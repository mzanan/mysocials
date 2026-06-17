import * as React from "react"

import { cn } from "@/lib/utils"

export const inputBase =
  "w-full h-10 rounded-xl bg-surface-strong border border-hairline-strong px-3 text-[15px] text-fg placeholder:text-fg-faint outline-none transition focus:border-accent focus:bg-surface-stronger focus:ring-2 focus:ring-accent/25"

function Input({ className, ...props }: React.ComponentProps<"input">) {
  return <input data-slot="input" className={cn(inputBase, className)} {...props} />
}

export { Input }
