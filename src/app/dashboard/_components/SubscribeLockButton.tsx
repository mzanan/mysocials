"use client";

import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { GatedAction } from "./GatedAction";

export function SubscribeLockButton({
  label = "Import from Instagram",
  size = "default",
  className,
}: {
  label?: string;
  size?: "default" | "sm";
  className?: string;
}) {
  return (
    <GatedAction>
      {({ loading }) => (
        <Button
          type="button"
          variant="secondary"
          size={size}
          disabled={loading}
          className={cn(
            "border-accent/40 bg-accent/10 text-fg hover:bg-accent/15",
            className
          )}
        >
          <Lock size={14} className="text-accent" /> {label}
        </Button>
      )}
    </GatedAction>
  );
}
