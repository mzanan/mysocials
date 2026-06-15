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
      variant="primary"
      size="auth"
      disabled={disabled}
      className="mt-2 w-full font-semibold"
    >
      {children}
    </Button>
  );
}
