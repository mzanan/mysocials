import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { BrandFooter } from "@/components/ui/BrandFooter";
import { DisplayTitle } from "@/components/ui/DisplayTitle";
import { HeroAmbient } from "@/components/ui/HeroAmbient";
import { Text } from "@/components/ui/text";

export function StatusPage({
  badge,
  lead,
  accent,
  message,
  action,
}: {
  badge?: string;
  lead: string;
  accent: string;
  message: string;
  action: ReactNode;
}) {
  return (
    <main className="bg-app-bg text-fg relative flex min-h-dvh flex-col items-center justify-center overflow-hidden px-6 pb-24 text-center">
      <HeroAmbient />
      <div className="relative flex max-w-xl flex-col items-center gap-5">
        {badge && <Badge variant="accent">{badge}</Badge>}
        <DisplayTitle lead={lead} accent={accent} />
        <Text variant="body" className="max-w-sm">
          {message}
        </Text>
        <div className="mt-2">{action}</div>
      </div>
      <BrandFooter overlay />
      <div aria-hidden className="grain-overlay" />
    </main>
  );
}
