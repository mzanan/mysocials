"use client";

import type { ReactElement } from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Spinner } from "@/components/ui/spinner";
import { useCheckout } from "./useCheckout";

export function GatedAction({
  children,
}: {
  children: (props: { loading: boolean }) => ReactElement;
}) {
  const { checkout, loading } = useCheckout();
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>{children({ loading })}</PopoverTrigger>
      <PopoverContent
        align="start"
        side="bottom"
        className="flex flex-col gap-2"
      >
        <span className="text-fg text-sm font-semibold">Pro feature</span>
        <span className="text-fg-subtle text-xs">
          Importing from Instagram is included with a subscription.
        </span>
        <Button
          variant="primary"
          size="sm"
          className="mt-1 w-full"
          onClick={checkout}
          disabled={loading}
        >
          {loading ? <Spinner className="size-4" /> : "Subscribe to unlock"}
        </Button>
      </PopoverContent>
    </Popover>
  );
}
