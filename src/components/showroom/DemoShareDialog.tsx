import { useEffect, useRef, useState } from "react";
import { Check, Copy, Mail } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { ShowroomDesign } from "@/content/showroom";
import { SITE_URL } from "@/lib/seo";

// Share a live demo: copies the link, hands it to the phone's share sheet where there is one, or
// opens an email draft. Nothing is sent from the site itself.
export function DemoShareDialog({
  design,
  open,
  onOpenChange,
}: {
  design: ShowroomDesign;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [copied, setCopied] = useState(false);
  const [failed, setFailed] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const url = `${SITE_URL}/demos/${design.slug}`;
  const text = `${design.title} website design demo by Teague Industries`;
  const canShare = typeof navigator !== "undefined" && typeof navigator.share === "function";

  useEffect(() => {
    if (open) {
      setCopied(false);
      setFailed(false);
    }
  }, [open, design.slug]);

  useEffect(() => {
    if (!copied) return;
    const t = window.setTimeout(() => setCopied(false), 2500);
    return () => window.clearTimeout(t);
  }, [copied]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setFailed(false);
      setCopied(true);
    } catch {
      // Clipboard blocked (e.g. insecure context): select the link so it can be copied by hand.
      setFailed(true);
      inputRef.current?.select();
    }
  };

  const nativeShare = async () => {
    try {
      await navigator.share({ title: design.title, text, url });
    } catch {
      // Dismissed by the user, or refused: nothing to do.
    }
  };

  const mailto = `mailto:?subject=${encodeURIComponent(text)}&body=${encodeURIComponent(
    `Have a look at this website design:\n\n${url}`,
  )}`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-border bg-surface sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl">Share this design</DialogTitle>
          <DialogDescription>
            Send the link to a business partner or a designer. The demo opens straight to{" "}
            {design.title}.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-3">
          <label className="grid gap-1.5">
            <span className="label">Link</span>
            <input
              ref={inputRef}
              readOnly
              value={url}
              onFocus={(e) => e.currentTarget.select()}
              className="field"
            />
          </label>
          <p role="status" className="min-h-5 text-sm text-muted-foreground">
            {copied && "Link copied."}
            {failed && "Couldn't copy automatically. The link is selected, so press Ctrl+C."}
          </p>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => void copy()} className="btn-primary">
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied" : "Copy link"}
            </button>
            <a href={mailto} className="btn-chrome">
              <Mail className="h-4 w-4" aria-hidden="true" /> Email it
            </a>
            {canShare && (
              <button type="button" onClick={() => void nativeShare()} className="btn-chrome">
                Share…
              </button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
