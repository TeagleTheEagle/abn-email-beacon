"use client";

import { useEffect, useState } from "react";
import { useLocation } from "@tanstack/react-router";
import { Send, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { QuickLeadForm } from "@/components/QuickLeadForm";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { requestJarvisOpen } from "@/lib/jarvis-events";
import { hasMobileActionBar } from "@/lib/mobile-actions";

export function MobileStickyActions() {
  const pathname = useLocation({ select: (location) => location.pathname });
  const [showLeadForm, setShowLeadForm] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);
  if (!hasMobileActionBar(pathname)) return null;

  return (
    <>
      <div
        className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur-xl sm:hidden"
        role="region"
        aria-label="Quick actions"
        aria-busy={!hydrated}
      >
        <div className="mx-auto flex max-w-lg items-center gap-3">
          <Button
            size="lg"
            variant="outline"
            className="h-12 min-w-0 flex-1 !px-3"
            onClick={() => setShowLeadForm(true)}
            aria-haspopup="dialog"
            disabled={!hydrated}
          >
            <Send className="mr-2 h-4 w-4" aria-hidden="true" />
            <span className="truncate">Free Preview</span>
          </Button>
          <Button
            size="lg"
            className="btn-primary h-12 min-w-0 flex-1 !px-3"
            onClick={requestJarvisOpen}
            aria-controls="jarvis-command-panel"
            disabled={!hydrated}
          >
            <Sparkles className="mr-2 h-4 w-4" aria-hidden="true" />
            <span className="truncate">Ask JARVIS</span>
          </Button>
        </div>
      </div>
      <Sheet open={showLeadForm} onOpenChange={setShowLeadForm}>
        <SheetContent
          side="bottom"
          className="max-h-[90dvh] overflow-y-auto border-border px-4 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-4 sm:hidden"
        >
          <div className="mx-auto max-w-md">
            <SheetHeader className="pr-10 text-left">
              <SheetTitle>Free preview request</SheetTitle>
              <SheetDescription>
                No upfront payment. We’ll build your preview first.
              </SheetDescription>
            </SheetHeader>
            <div className="mt-5">
              <QuickLeadForm />
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
