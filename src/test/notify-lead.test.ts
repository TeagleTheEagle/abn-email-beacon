import { describe, expect, it, vi } from "vitest";
import {
  handleNotifyLead,
  ProviderResponseError,
  type LeadForNotification,
  type NotificationStore,
  type NotificationOutcome,
  type DeliveryKind,
} from "../../supabase/functions/notify-lead/handler";

class FakeNotificationStore implements NotificationStore {
  lead: LeadForNotification;
  private attempt = 0;

  constructor(message = "Website enquiry") {
    this.lead = {
      id: "11111111-1111-4111-8111-111111111111",
      created_at: "2026-11-17T00:55:00Z",
      notify_token_hash: "6a87499eebbac68617673349b2d323e5a7974f5f71745fff8b5160ecf6243b40",
      name: "Alex",
      business_name: "Example Co",
      email: "alex@example.com.au",
      phone: null,
      business_type: null,
      needs: [],
      current_website: null,
      message,
      notified_at: null,
      owner_notification_status: "pending",
      owner_notification_attempts: 0,
      owner_notification_attempted_at: null,
      owner_notification_attempt_id: null,
      owner_notification_error: null,
      owner_notification_provider_id: null,
      customer_confirmation_status: "pending",
      customer_confirmation_attempts: 0,
      customer_confirmation_attempted_at: null,
      customer_confirmation_attempt_id: null,
      customer_confirmation_error: null,
      customer_confirmation_provider_id: null,
    };
  }

  async findLead(id: string, email: string) {
    return id === this.lead.id && email === this.lead.email ? { ...this.lead } : null;
  }

  async claim(kind: DeliveryKind, id: string, staleBefore: Date, maxAttempts: number) {
    if (id !== this.lead.id) return null;
    const prefix = kind === "owner" ? "owner_notification" : "customer_confirmation";
    const statusKey = `${prefix}_status` as const;
    const attemptsKey = `${prefix}_attempts` as const;
    const attemptedAtKey = `${prefix}_attempted_at` as const;
    const attemptIdKey = `${prefix}_attempt_id` as const;
    const status = this.lead[statusKey];
    const attempts = this.lead[attemptsKey];
    const attemptedAt = this.lead[attemptedAtKey];
    const claimable =
      status === "pending" ||
      ((status === "failed" || status === "unknown") && attempts < maxAttempts) ||
      (status === "processing" &&
        attempts < maxAttempts &&
        attemptedAt !== null &&
        new Date(attemptedAt) <= staleBefore);
    if (!claimable || (kind === "owner" && this.lead.notified_at !== null)) return null;
    this.attempt += 1;
    this.lead[statusKey] = "processing";
    this.lead[attemptsKey] = attempts + 1;
    this.lead[attemptedAtKey] = "2026-11-17T01:00:00Z";
    this.lead[attemptIdKey] = `attempt-${this.attempt}`;
    return this.lead[attemptIdKey];
  }

  async mark(kind: DeliveryKind, _id: string, attemptId: string, outcome: NotificationOutcome) {
    const prefix = kind === "owner" ? "owner_notification" : "customer_confirmation";
    if (this.lead[`${prefix}_attempt_id`] !== attemptId) return;
    this.lead[`${prefix}_status`] = outcome.status;
    this.lead[`${prefix}_error`] = outcome.error ?? null;
    this.lead[`${prefix}_provider_id`] = outcome.providerId ?? null;
    if (kind === "owner" && outcome.status === "sent") this.lead.notified_at = "sent-now";
  }

  async skipCustomer(_id: string, reason: string) {
    if (this.lead.customer_confirmation_status === "pending") {
      this.lead.customer_confirmation_status = "skipped";
      this.lead.customer_confirmation_error = reason;
    }
  }
}

function request(scheduled = false, token = "tttttttttttttttttttttttttttttttttttttttt") {
  return new Request("https://example.com/functions/notify-lead", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(scheduled ? { authorization: "Bearer test-scheduler-key" } : {}),
    },
    body: JSON.stringify({
      id: "11111111-1111-4111-8111-111111111111",
      email: "alex@example.com.au",
      ...(scheduled ? { scheduled: true } : { token }),
    }),
  });
}

function dependencies(
  store: NotificationStore,
  sendEmail = vi.fn().mockResolvedValue({ id: "email-1" }),
) {
  return {
    store,
    sendEmail,
    ownerEmail: "owner@example.com.au",
    from: "Teague Industries <hello@example.com.au>",
    customerConfirmationEnabled: true,
    schedulerKey: "test-scheduler-key",
    now: () => new Date("2026-11-17T01:00:00Z"),
  };
}

describe("notify-lead delivery lifecycle", () => {
  it("preserves the enquiry and marks a rejected owner send as retryable failure", async () => {
    const store = new FakeNotificationStore();
    const sendEmail = vi.fn().mockRejectedValue(new ProviderResponseError(503, "Unavailable"));

    const response = await handleNotifyLead(request(), dependencies(store, sendEmail));

    expect(response.status).toBe(502);
    expect(store.lead.business_name).toBe("Example Co");
    expect(store.lead.owner_notification_status).toBe("failed");
    expect(store.lead.owner_notification_attempts).toBe(1);
    expect(store.lead.notified_at).toBeNull();
  });

  it("retries only customer confirmation after the owner notification has succeeded", async () => {
    const store = new FakeNotificationStore();
    const sendEmail = vi
      .fn()
      .mockResolvedValueOnce({ id: "owner-email" })
      .mockRejectedValueOnce(new ProviderResponseError(500, "Failed"))
      .mockResolvedValue({ id: "customer-email" });
    const deps = dependencies(store, sendEmail);

    await handleNotifyLead(request(), deps);
    const retry = await handleNotifyLead(request(), deps);

    expect(retry.status).toBe(200);
    expect(sendEmail).toHaveBeenCalledTimes(3);
    expect(store.lead.owner_notification_status).toBe("sent");
    expect(store.lead.customer_confirmation_status).toBe("sent");
    expect(sendEmail.mock.calls.map((call) => call[1])).toEqual([
      "teague-lead-11111111-1111-4111-8111-111111111111-owner",
      "teague-lead-11111111-1111-4111-8111-111111111111-customer",
      "teague-lead-11111111-1111-4111-8111-111111111111-customer",
    ]);
  });

  it("does not duplicate owner email for concurrent or completed attempts", async () => {
    const store = new FakeNotificationStore();
    const sendEmail = vi.fn().mockResolvedValue({ id: "owner-email" });
    const deps = dependencies(store, sendEmail);

    await Promise.all([handleNotifyLead(request(), deps), handleNotifyLead(request(), deps)]);
    await handleNotifyLead(request(), deps);

    expect(
      sendEmail.mock.calls.filter((call) => call[0].to[0] === "owner@example.com.au"),
    ).toHaveLength(1);
  });

  it("marks a timeout as an unknown outcome and retries with the same provider key", async () => {
    const store = new FakeNotificationStore();
    const timeout = new Error("Provider timed out");
    timeout.name = "TimeoutError";
    const sendEmail = vi.fn().mockRejectedValueOnce(timeout).mockResolvedValue({ id: "owner-2" });
    const deps = dependencies(store, sendEmail);

    await handleNotifyLead(request(), deps);
    expect(store.lead.owner_notification_status).toBe("unknown");
    await handleNotifyLead(request(), deps);

    expect(sendEmail.mock.calls[0]?.[1]).toBe(sendEmail.mock.calls[1]?.[1]);
    expect(store.lead.owner_notification_status).toBe("sent");
  });

  it("stops retrying at the configured attempt bound", async () => {
    const store = new FakeNotificationStore();
    store.lead.owner_notification_status = "failed";
    store.lead.owner_notification_attempts = 5;
    const sendEmail = vi.fn();

    const response = await handleNotifyLead(request(), dependencies(store, sendEmail));

    expect(response.status).toBe(409);
    expect(sendEmail).not.toHaveBeenCalled();
  });

  it("refuses unscheduled notifications for enquiries older than ten minutes", async () => {
    const store = new FakeNotificationStore();
    store.lead.created_at = "2026-11-16T00:00:00Z";
    const sendEmail = vi.fn();
    const response = await handleNotifyLead(request(), dependencies(store, sendEmail));
    expect(response.status).toBe(404);
    expect(sendEmail).not.toHaveBeenCalled();
  });

  it("refuses visitor notifications without the enquiry's one-time token", async () => {
    const store = new FakeNotificationStore();
    const sendEmail = vi.fn().mockResolvedValue({ id: "email-1" });
    const response = await handleNotifyLead(
      request(false, "x".repeat(40)),
      dependencies(store, sendEmail),
    );
    expect(response.status).toBe(404);
    expect(sendEmail).not.toHaveBeenCalled();
  });

  it("lets a signed-in owner resend without the visitor token", async () => {
    const store = new FakeNotificationStore();
    const sendEmail = vi.fn().mockResolvedValue({ id: "email-1" });
    const deps = { ...dependencies(store, sendEmail), isOwner: async () => true };
    const response = await handleNotifyLead(request(false, "x".repeat(40)), deps);
    expect(response.status).toBe(200);
    expect(sendEmail).toHaveBeenCalled();
  });

  it("rejects scheduled calls without the dedicated scheduler credential", async () => {
    const store = new FakeNotificationStore();
    const sendEmail = vi.fn();
    const scheduledRequest = request(true);
    const deps = { ...dependencies(store, sendEmail), schedulerKey: "different-key" };

    const response = await handleNotifyLead(scheduledRequest, deps);

    expect(response.status).toBe(401);
    expect(sendEmail).not.toHaveBeenCalled();
  });

  it("requires provider reconciliation before retrying an unknown outcome older than 24 hours", async () => {
    const store = new FakeNotificationStore();
    store.lead.owner_notification_status = "unknown";
    store.lead.owner_notification_attempts = 1;
    store.lead.owner_notification_attempted_at = "2026-11-16T00:00:00Z";
    const sendEmail = vi.fn();

    const response = await handleNotifyLead(request(), dependencies(store, sendEmail));

    expect(response.status).toBe(409);
    expect(sendEmail).not.toHaveBeenCalled();
  });

  it("preserves the existing no-confirmation behaviour for AI assistant enquiries", async () => {
    const store = new FakeNotificationStore("[Sent via AI assistant] Website enquiry");
    const sendEmail = vi.fn().mockResolvedValue({ id: "owner-email" });

    const response = await handleNotifyLead(request(), dependencies(store, sendEmail));

    expect(response.status).toBe(200);
    expect(sendEmail).toHaveBeenCalledTimes(1);
    expect(store.lead.customer_confirmation_status).toBe("skipped");
  });
});
