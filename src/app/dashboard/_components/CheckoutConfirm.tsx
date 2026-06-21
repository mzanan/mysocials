"use client";

import { useEffect, useState } from "react";
import { ExternalLink, PartyPopper, X } from "lucide-react";
import { LazyMotion, domAnimation, m } from "motion/react";

import { confirmCheckout } from "../actions";
import { celebrate } from "@/lib/confetti";
import { Button } from "@/components/ui/button";
import { Dialog, DialogBody, DialogClose } from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";
import { Text } from "@/components/ui/text";

const POLL_INTERVAL_MS = 1500;
const MAX_ATTEMPTS = 20;

type Status = "confirming" | "success" | "timedout";

export function CheckoutConfirm({
  username,
  alreadyActive,
}: {
  username: string;
  alreadyActive: boolean;
}) {
  const [status, setStatus] = useState<Status>(
    alreadyActive ? "success" : "confirming",
  );

  useEffect(() => {
    if (alreadyActive) {
      celebrate();
      return;
    }

    let cancelled = false;
    let attempts = 0;

    async function poll() {
      if (cancelled) return;
      const res = await confirmCheckout().catch(() => ({ active: false }));
      if (cancelled) return;
      if (res.active) {
        setStatus("success");
        celebrate();
        return;
      }
      attempts += 1;
      if (attempts >= MAX_ATTEMPTS) {
        setStatus("timedout");
        return;
      }
      window.setTimeout(poll, POLL_INTERVAL_MS);
    }

    const id = window.setTimeout(poll, 800);
    return () => {
      cancelled = true;
      window.clearTimeout(id);
    };
  }, [alreadyActive]);

  function goToDashboard() {
    window.location.replace("/dashboard");
  }

  return (
    <Dialog
      open
      onOpenChange={(next) => {
        if (!next) goToDashboard();
      }}
      onOpenAutoFocus={(e) => e.preventDefault()}
    >
      <DialogClose
        aria-label="Close"
        className="text-fg-subtle hover:bg-hover hover:text-fg focus-visible:ring-accent/50 absolute right-3 top-3 z-10 rounded-md p-1 outline-none transition-colors focus-visible:ring-2"
      >
        <X size={16} />
      </DialogClose>

      <DialogBody className="flex flex-col items-center gap-5 px-6 py-9 text-center">
        {status === "confirming" && (
          <>
            <div className="bg-surface-strong flex size-16 items-center justify-center rounded-full">
              <Spinner className="text-accent size-7" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Text variant="heading" className="text-lg">
                Confirming your payment…
              </Text>
              <Text variant="body">This only takes a few seconds.</Text>
            </div>
          </>
        )}

        {status === "success" && (
          <>
            <LazyMotion features={domAnimation}>
              <m.div
                initial={{ scale: 0.4, opacity: 0, rotate: -12 }}
                animate={{ scale: 1, opacity: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 320, damping: 15 }}
                className="bg-accent/10 flex size-16 items-center justify-center rounded-full"
              >
                <PartyPopper className="text-accent size-8" strokeWidth={2} />
              </m.div>
            </LazyMotion>
            <div className="flex flex-col gap-1.5">
              <Text variant="heading" className="text-lg">
                You’re all set
              </Text>
              <Text variant="body">
                Thanks for subscribing.
                <br />
                Your profile is now active and published.
              </Text>
            </div>
            <div className="flex w-full flex-col gap-2">
              <Button asChild variant="primary">
                <a href={`/${username}`} target="_blank" rel="noopener noreferrer">
                  View my page <ExternalLink size={15} />
                </a>
              </Button>
              <Button variant="ghost" onClick={goToDashboard}>
                Back to dashboard
              </Button>
            </div>
          </>
        )}

        {status === "timedout" && (
          <>
            <div className="flex flex-col gap-1.5">
              <Text variant="heading" className="text-lg">
                Still processing
              </Text>
              <Text variant="body">
                Your payment is taking longer than usual. It will appear shortly.
                Refresh the page in a moment.
              </Text>
            </div>
            <Button variant="secondary" onClick={goToDashboard}>
              Got it
            </Button>
          </>
        )}
      </DialogBody>
    </Dialog>
  );
}
