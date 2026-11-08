"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Text } from "@/components/ui/text";
import { useVerifyEmailNotice } from "./useVerifyEmailNotice";

export function VerifyEmailNotice({ email }: { email: string }) {
  const n = useVerifyEmailNotice(email);

  return (
    <Card className="mb-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Text>
          Verify your email. Didn&apos;t get the link at{" "}
          <span className="text-fg">{email}</span>?
        </Text>
        <Button
          size="sm"
          onClick={n.resend}
          disabled={n.status !== "idle"}
        >
          {n.status === "sending" ? "Sending…" : n.status === "sent" ? "Sent" : "Resend email"}
        </Button>
      </div>
      {n.error && <Text variant="error" className="mt-3">{n.error}</Text>}
    </Card>
  );
}
