import { createFileRoute } from "@tanstack/react-router";
import { GoogleGenAI } from "@google/genai";
import { faqs, site, steps } from "@/content/site";
import { addOns, carePlans, services } from "@/content/services";
import { showroomDesigns } from "@/content/showroom";
const normaliseStoreCopy = (s: string) => s;
import { generateJarvisReply } from "@/components/JarvisAssistant";

const MODELS = ["gemini-3.5-flash-lite", "gemini-3.8-flash", "gemini-3.1-flash-lite"] as const;

// Simple in-memory per-IP rate limiter (max 20 requests per 60s window) to protect the API key.
const RATE_WINDOW_MS = 60_000;
const MAX_REQUESTS_PER_WINDOW = 20;
const ipHits = new Map<string, number[]>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (ipHits.get(ip) ?? []).filter((t) => now - t < RATE_WINDOW_MS);
  if (recent.length >= MAX_REQUESTS_PER_WINDOW) {
    ipHits.set(ip, recent);
    return true;
  }
  recent.push(now);
  ipHits.set(ip, recent);
  return false;
}

function isAllowedOrigin(request: Request): boolean {
  const origin = request.headers.get("origin") ?? request.headers.get("referer") ?? "";
  if (!origin) return true;
  return /localhost|127\.0\.0\.1|teagueindustries\.com\.au|lovable\.app|lovable\.dev|lovableproject\.com/i.test(
    origin,
  );
}

// --- Zero-Key Public APIs (from github.com/public-apis/public-apis) ---
// 1. Open-Meteo (No key required): Live Sydney / Lower North Shore weather
async function fetchSydneyWeather(): Promise<string | null> {
  try {
    const res = await fetch(
      "https://api.open-meteo.com/v1/forecast?latitude=-33.839&longitude=151.207&current=temperature_2m,wind_speed_10m,weather_code&timezone=Australia%2FSydney",
      { signal: AbortSignal.timeout(2500) },
    );
    if (!res.ok) return null;
    const data = (await res.json()) as {
      current?: { temperature_2m?: number; wind_speed_10m?: number };
    };
    if (typeof data.current?.temperature_2m === "number") {
      return `Live North Sydney weather (Open-Meteo): ${data.current.temperature_2m}°C, wind ${data.current.wind_speed_10m ?? 0} km/h.`;
    }
    return null;
  } catch {
    return null;
  }
}

// 2. Frankfurter Currency API (No key required): Live AUD exchange rates
async function fetchAudRates(): Promise<string | null> {
  try {
    const res = await fetch(
      "https://api.frankfurter.dev/v1/latest?base=AUD&symbols=USD,NZD,GBP,EUR",
      {
        signal: AbortSignal.timeout(2500),
      },
    );
    if (!res.ok) return null;
    const data = (await res.json()) as { rates?: Record<string, number> };
    if (!data.rates) return null;
    const parts = Object.entries(data.rates).map(([k, v]) => `1 AUD = ${v.toFixed(2)} ${k}`);
    return `Live AUD exchange rates (Frankfurter API): ${parts.join(", ")}.`;
  } catch {
    return null;
  }
}

// 3. Wikipedia REST Summary API (No key required): Open-knowledge factual lookup
async function fetchWikipediaSummary(query: string): Promise<string | null> {
  try {
    const cleaned = query
      .replace(/^(what is|who is|tell me about|explain|define|where is)\s+/i, "")
      .replace(/[?.!]+$/, "")
      .trim();
    if (!cleaned || cleaned.length < 2 || cleaned.length > 80) return null;
    const searchUrl = `https://en.wikipedia.org/w/api.php?action=opensearch&search=${encodeURIComponent(cleaned)}&limit=1&namespace=0&format=json`;
    const searchRes = await fetch(searchUrl, { signal: AbortSignal.timeout(2500) });
    if (!searchRes.ok) return null;
    const searchData = (await searchRes.json()) as [string, string[]];
    const title = searchData?.[1]?.[0];
    if (!title) return null;
    const sumRes = await fetch(
      `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`,
      { signal: AbortSignal.timeout(2500) },
    );
    if (!sumRes.ok) return null;
    const sumData = (await sumRes.json()) as { extract?: string };
    return sumData.extract ? sumData.extract.slice(0, 450) : null;
  } catch {
    return null;
  }
}

async function gatherPublicApiContext(message: string): Promise<string[]> {
  const notes: string[] = [];
  const lower = message.toLowerCase();
  const tasks: Promise<void>[] = [];

  if (/weather|temperature|rain|forecast|sunny|sydney weather/i.test(lower)) {
    tasks.push(
      fetchSydneyWeather().then((w) => {
        if (w) notes.push(w);
      }),
    );
  }
  if (/usd|nzd|gbp|eur|currency|exchange rate|convert|dollar/i.test(lower)) {
    tasks.push(
      fetchAudRates().then((r) => {
        if (r) notes.push(r);
      }),
    );
  }
  if (/^(what is|who is|tell me about|explain|define|where is)\b/i.test(lower)) {
    tasks.push(
      fetchWikipediaSummary(message).then((wiki) => {
        if (wiki) notes.push(`Reference context: ${wiki}`);
      }),
    );
  }
  await Promise.all(tasks);
  return notes;
}

function buildSystemInstruction(liveContext: string[]): string {
  const servicesSummary = services
    .map(
      (s) =>
        `- ${s.title}: ${s.price}${s.priceNote ? ` (${s.priceNote})` : ""} — ${s.short}. Includes: ${s.included.join(", ")}.`,
    )
    .join("\n");

  const careSummary = carePlans
    .map(
      (p) =>
        `- ${p.title}: ${p.price}${p.priceNote ?? "/month"} — ${p.short}. Includes: ${p.included.join(", ")}.`,
    )
    .join("\n");

  const addOnsSummary = addOns.map((a) => `- ${a.title} (${a.price}): ${a.summary}`).join("\n");

  const demosSummary = showroomDesigns
    .map((d) => `- ${d.title} (/demos/${d.slug}): ${d.industry} — ${d.interactiveWidget}`)
    .join("\n");

  const faqsSummary = faqs.map((f) => `Q: ${f.q}\nA: ${f.a}`).join("\n\n");
  const stepsSummary = steps.map((s) => `${s.n}. ${s.title} (${s.when}): ${s.body}`).join(" | ");

  return [
    `You are JARVIS, the intelligent on-site assistant for ${site.name} (www.teagueindustries.com.au), founded by Ben Teague (ABN ${site.abn}, email ${site.email}).`,
    `Service area: Sydney's Lower North Shore (${site.suburbs.join(", ")}) plus anywhere in Australia online.`,
    `Your role: Answer ANY question the visitor asks — whether about ${site.name}, website design, online stores, SEO, marketing for their industry, Australian business questions, live weather/currency, or any general knowledge topic — in a warm, sharp, concise Australian tone (keep answers to 2–4 short sentences unless they ask for a detailed list).`,
    `Strict brand rules (always follow):`,
    `1. Say "Websites and Stores" or "online store" — NEVER use the word "Shopify" in your reply.`,
    `2. Say "Australian businesses" or "local businesses" — NEVER say "small business" or "small businesses".`,
    `3. NEVER claim deliverables are "AI-made", "AI-built", or "AI-generated".`,
    `4. Never invent a phone number for ${site.name}; visitors can book a 15-minute call at /book, email ${site.email}, or request a free preview right here in chat.`,
    ``,
    `=== CORE SERVICES & PRICING (AUD, not GST registered) ===`,
    servicesSummary,
    ``,
    `=== CARE PLANS (month-to-month, stop any time by email) ===`,
    careSummary,
    ``,
    `=== FIXED-SCOPE ADD-ONS ===`,
    addOnsSummary,
    ``,
    `=== HOW IT WORKS ===`,
    stepsSummary,
    ``,
    `=== 12 LIVE SHOWROOM DESIGNS (/demos) ===`,
    demosSummary,
    ``,
    `=== POLICIES & FAQS ===`,
    faqsSummary,
    ...(liveContext.length > 0 ? ["", "=== LIVE PUBLIC API DATA ===", ...liveContext] : []),
  ].join("\n");
}

type HistoryTurn = {
  sender: "user" | "jarvis";
  text: string;
};

type JarvisRequestBody = {
  message?: string;
  history?: HistoryTurn[];
  cartCount?: number;
  checkoutUrl?: string | null;
};

export const Route = createFileRoute("/api/jarvis")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        if (!isAllowedOrigin(request)) {
          return Response.json({ error: "Forbidden origin" }, { status: 403 });
        }

        const ip =
          request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
          request.headers.get("cf-connecting-ip") ||
          "local";
        if (isRateLimited(ip)) {
          return Response.json(
            { error: "Rate limit exceeded. Please wait a moment." },
            { status: 429 },
          );
        }

        let body: JarvisRequestBody;
        try {
          body = (await request.json()) as JarvisRequestBody;
        } catch {
          return Response.json({ error: "Invalid JSON body" }, { status: 400 });
        }

        const rawMessage =
          typeof body.message === "string" ? body.message.trim().slice(0, 800) : "";
        if (!rawMessage) {
          return Response.json({ error: "Message is required" }, { status: 400 });
        }

        const cartCount = typeof body.cartCount === "number" ? body.cartCount : 0;
        const checkoutUrl = typeof body.checkoutUrl === "string" ? body.checkoutUrl : null;

        // Compute context-aware action buttons using our deterministic matcher
        const localFallback = generateJarvisReply(rawMessage, cartCount, checkoutUrl);
        const liveContext = await gatherPublicApiContext(rawMessage);

        const apiKey = process.env["GEMINI_API_KEY"] || process.env["GOOGLE_API_KEY"];
        if (process.env["GEMINI_API_KEY"] && process.env["GOOGLE_API_KEY"]) {
          delete process.env["GOOGLE_API_KEY"];
        }
        if (!apiKey) {
          const enrichedText =
            liveContext.length > 0
              ? `${liveContext.join(" ")}\n\n${localFallback.text}`
              : localFallback.text;
          return Response.json({
            text: enrichedText,
            actions: localFallback.actions,
            openLeadForm: localFallback.openLeadForm,
            source: "public-api+local",
          });
        }

        const history = Array.isArray(body.history) ? body.history.slice(-8) : [];
        const transcript = history
          .map(
            (turn) =>
              `${turn.sender === "user" ? "Visitor" : "JARVIS"}: ${String(turn.text).slice(0, 500)}`,
          )
          .join("\n");

        const promptInput = transcript
          ? `Conversation so far:\n${transcript}\n\nVisitor: ${rawMessage}\nJARVIS:`
          : rawMessage;

        const ai = new GoogleGenAI({ apiKey });
        const systemInstruction = buildSystemInstruction(liveContext);

        for (const model of MODELS) {
          try {
            const interaction = await ai.interactions.create({
              model,
              input: promptInput,
              system_instruction: systemInstruction,
              store: false,
            });
            const output = interaction.output_text?.trim();
            if (output) {
              const cleaned = normaliseStoreCopy(output)
                .replace(/\bsmall businesses\b/gi, "Australian businesses")
                .replace(/\bsmall business\b/gi, "local business")
                .replace(/\bAI-made\b|\bAI-built\b|\bAI-generated\b/gi, "custom-built");

              return Response.json({
                text: cleaned,
                actions: localFallback.actions,
                openLeadForm: localFallback.openLeadForm,
                source: model,
              });
            }
          } catch (err) {
            console.warn(`[JARVIS] Model ${model} failed, trying next fallback:`, err);
          }
        }

        const fallbackText =
          liveContext.length > 0
            ? `${liveContext.join(" ")}\n\n${localFallback.text}`
            : localFallback.text;

        return Response.json({
          text: fallbackText,
          actions: localFallback.actions,
          openLeadForm: localFallback.openLeadForm,
          source: "fallback",
        });
      },
    },
  },
});
