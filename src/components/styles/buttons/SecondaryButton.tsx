import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { ButtonHTMLAttributes, forwardRef } from "react"

interface SecondaryButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean
  size?: "default" | "sm" | "lg" | "icon"
  variant?: "outline" | "ghost"
}

const SecondaryButton = forwardRef<HTMLButtonElement, SecondaryButtonProps>(
  ({ className, size = "default", variant = "outline", ...props }, ref) => {
    return (
      <Button
        ref={ref}
        variant={variant}
        size={size}
        className={cn(
          variant === "outline" && "border-gray-300 hover:bg-gray-50",
          className
        )}
        {...props}
      />
    )
  }
)
SecondaryButton.displayName = "SecondaryButton"

export { SecondaryButton } 