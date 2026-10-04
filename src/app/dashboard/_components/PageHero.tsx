"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SettingRow } from "@/components/ui/SettingRow";
import { Switch } from "@/components/ui/switch";
import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils";
import type { DashboardData } from "@/types/dashboard";
import { SubscribeGate } from "./SubscribeGate";
import { usePageHero } from "./usePageHero";

export function PageHero({
  data,
  billingEnabled,
}: {
  data: DashboardData;
  billingEnabled: boolean;
}) {
  const hero = usePageHero(data, billingEnabled);

  return (
    <>
      <SubscribeGate
        username={data.username}
        open={hero.showGate}
        onOpenChange={hero.setShowGate}
      />
      <Card className="p-5 sm:p-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <Badge>
              <span
                aria-hidden
                className={cn(
                  "size-1.5 rounded-full",
                  hero.published ? "bg-success" : "bg-fg-faint",
                )}
              />
              {hero.published ? "Live" : "Draft"}
            </Badge>
            <Text
              as="h1"
              variant="display"
              className="mt-4 truncate text-[length:clamp(2.2rem,7vw,3.4rem)]! leading-none!"
            >
              <span className="text-accent">/</span>
              {data.username}
            </Text>
            <Text variant="caption" className="mt-3">
              {hero.published
                ? "Your page is live. Share the link anywhere."
                : "Only you can see this page until you publish it."}
            </Text>
            {hero.error && (
              <p className="text-danger mt-2 text-sm">{hero.error}</p>
            )}
          </div>
          <div className="flex shrink-0 gap-2">
            {hero.published ? (
              <Button asChild variant="secondary" size="lg" className="flex-1 sm:flex-none">
                <Link href={`/${data.username}`} target="_blank">
                  View page <ArrowUpRight />
                </Link>
              </Button>
            ) : (
              <Button asChild variant="secondary" size="lg" className="flex-1 sm:flex-none lg:hidden">
                <Link href="/preview" target="_blank">
                  Preview <ArrowUpRight />
                </Link>
              </Button>
            )}
            <Button
              variant="primary"
              size="lg"
              onClick={hero.togglePublished}
              disabled={hero.pending}
              className="flex-1 sm:flex-none"
            >
              {hero.needsSubscription
                ? "Subscribe to publish"
                : hero.published
                  ? "Unpublish"
                  : "Publish page"}
            </Button>
          </div>
        </div>

        <div className="border-hairline-subtle mt-6 border-t pt-6">
          <SettingRow
            title="Hide from search engines"
            description="Your page still works for anyone with the link, but Google and other search engines won't list it."
            control={
              <Switch
                checked={hero.hideFromSearch}
                onCheckedChange={hero.toggleHideFromSearch}
                disabled={hero.pending}
              />
            }
          />
        </div>
      </Card>
    </>
  );
}
