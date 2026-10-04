import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils";

const SIZES = {
  md: "text-[length:clamp(2.2rem,8vw,3.2rem)]! leading-[0.98]!",
  lg: "text-[length:clamp(2.6rem,10vw,4.25rem)]! leading-[0.95]!",
} as const;

export function DisplayTitle({
  lead,
  accent,
  size = "lg",
  className,
}: {
  lead: string;
  accent?: string;
  size?: keyof typeof SIZES;
  className?: string;
}) {
  return (
    <Text
      as="h1"
      variant="display"
      className={cn(
        SIZES[size],
        "animate-in fade-in slide-in-from-bottom-3 duration-700",
        className,
      )}
    >
      <span className="block">{lead}</span>
      {accent && <span className="text-accent block">{accent}</span>}
    </Text>
  );
}
