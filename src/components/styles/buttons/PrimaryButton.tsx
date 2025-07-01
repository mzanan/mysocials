import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { ButtonHTMLAttributes, forwardRef } from "react"

interface PrimaryButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean
  size?: "default" | "sm" | "lg" | "icon"
}

const PrimaryButton = forwardRef<HTMLButtonElement, PrimaryButtonProps>(
  ({ className, size = "default", ...props }, ref) => {
    return (
      <Button
        ref={ref}
        size={size}
        className={cn(
          "bg-white text-purple-600 hover:bg-gray-100 border-0",
          className
        )}
        {...props}
      />
    )
  }
)
PrimaryButton.displayName = "PrimaryButton"

export { PrimaryButton } 