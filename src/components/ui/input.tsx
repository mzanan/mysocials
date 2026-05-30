import * as React from "react"

import { cn } from "@/lib/utils"

export const inputBase =
  "w-full h-10 rounded-xl bg-white/[0.06] border border-white/10 px-3 text-[15px] text-white placeholder:text-white/35 outline-none transition focus:border-white/25 focus:bg-white/[0.08]"

function Input({ className, ...props }: React.ComponentProps<"input">) {
  return <input data-slot="input" className={cn(inputBase, className)} {...props} />
}

export { Input }
