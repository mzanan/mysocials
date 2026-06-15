import * as React from "react";
import { cn } from "@/lib/utils";
import { inputBase } from "./input";

export function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(inputBase, "h-auto resize-none py-2", className)}
      {...props}
    />
  );
}
