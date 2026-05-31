import { Button } from "@/components/ui/button";

export function AuthSubmit({
  disabled,
  children,
}: {
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <Button
      type="submit"
      variant="glass"
      size="auth"
      disabled={disabled}
      className="link-btn mt-2 w-full"
    >
      {children}
    </Button>
  );
}
