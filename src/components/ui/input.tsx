import * as React from "react"

import { cn } from "@/lib/utils"

export const inputBase =
  "w-full h-10 rounded-xl bg-surface border border-hairline px-3 text-[15px] text-fg placeholder:text-fg-faint outline-none transition focus:border-hairline-strong focus:bg-surface-strong"

function Input({ className, ...props }: React.ComponentProps<"input">) {
  return <input data-slot="input" className={cn(inputBase, className)} {...props} />
}

export { Input }
