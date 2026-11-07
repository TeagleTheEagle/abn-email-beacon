"use client";

import { useEffect, useState } from "react";
import { Send, Sparkles, X, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BookCallLink } from "@/components/BookCallLink";
import { QuickLeadForm } from "@/components/QuickLeadForm";
import { site } from "@/content/site";

export function MobileStickyActions() {
  const [showLeadForm, setShowLeadForm] = useState(false);
  const [jarvisOpen, setJarvisOpen] = useState(false);

  // Hide on desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 640) {
        setShowLeadForm(false);
        setJarvisOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (typeof window !== "undefined" && window.innerWidth >= 640) {
    return null;
  }

  return (
    <>
      {/* Sticky action bar at bottom of viewport on mobile */}
      <div
        className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-background/95 backdrop-blur-xl px-4 py-3 sm:hidden"
        role="region"
        aria-label="Quick actions"
      >
        <div className="mx-auto flex max-w-[480px] items-center justify-between gap-3">
          <Button
            asChild
            size="lg"
            variant="outline"
            className="h-12 flex-1 min-w-0"
            onClick={() => setShowLeadForm(true)}
          >
            <Send className="h-4 w-4 mr-2" aria-hidden="true" />
            <span className="truncate">Free Preview</span>
          </Button>
          <Button
            asChild
            size="lg"
            className="h-12 flex-1 min-w-0 btn-primary"
            onClick={() => setJarvisOpen(true)}
          >
            <Sparkles className="h-4 w-4 mr-2" aria-hidden="true" />
            <span className="truncate">Ask JARVIS</span>
          </Button>
        </div>
      </div>

      {/* Bottom sheet for free preview form */}
      {showLeadForm && (
        <div
          className="fixed inset-0 z-50 sm:hidden"
          role="dialog"
          aria-modal="true"
          aria-labelledby="mobile-preview-title"
        >
          <div
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            onClick={() => setShowLeadForm(false)}
            aria-hidden="true"
          />
          <div className="absolute bottom-0 left-0 right-0 max-h-[85vh] overflow-y-auto bg-background border-t border-border rounded-t-2xl px-4 pb-6 pt-4">
            <div className="mx-auto max-w-md">
              <div className="flex items-center justify-between">
                <h2 id="mobile-preview-title" className="text-xl font-semibold">
                  Free Preview Request
                </h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowLeadForm(false)}
                  aria-label="Close"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                No upfront payment. We'll build your preview first.
              </p>
              <QuickLeadForm onSuccess={() => setShowLeadForm(false)} />
            </div>
          </div>
        </div>
      )}

      {/* Bottom sheet for JARVIS trigger - opens the main JARVIS component */}
      {jarvisOpen && (
        <div
          className="fixed inset-0 z-50 sm:hidden"
          role="dialog"
          aria-modal="true"
          aria-labelledby="mobile-jarvis-title"
        >
          <div
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            onClick={() => setJarvisOpen(false)}
            aria-hidden="true"
          />
          <div className="absolute bottom-0 left-0 right-0 max-h-[90vh] overflow-hidden bg-background border-t border-border rounded-t-2xl">
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <h2 id="mobile-jarvis-title" className="text-lg font-semibold">
                JARVIS AI Assistant
              </h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setJarvisOpen(false)}
                aria-label="Close JARVIS"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="p-4 space-y-4">
              <p className="text-sm text-muted-foreground">
                Ask JARVIS about pricing, demos, or request a free preview right here.
              </p>
              <Button
                asChild
                className="w-full h-12 btn-primary"
                onClick={() => {
                  setJarvisOpen(false);
                  // Dispatch custom event to open JARVIS panel
                  window.dispatchEvent(new CustomEvent("jarvis:open"));
                }}
              >
                <Sparkles className="h-4 w-4 mr-2" aria-hidden="true" />
                Open JARVIS Chat
              </Button>
              <Button asChild variant="outline" className="w-full h-12">
                <BookCallLink />
              </Button>
              <Button asChild variant="outline" className="w-full h-12">
                <a href={`mailto:${site.email}`}>
                  Email Ben <Send className="h-4 w-4 ml-2" aria-hidden="true" />
                </a>
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
