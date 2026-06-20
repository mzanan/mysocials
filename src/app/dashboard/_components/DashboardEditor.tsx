"use client";

import { Suspense, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { setPublished } from "../actions";
import { IgConnectStatus } from "./IgConnectStatus";
import { DashboardStore } from "./DashboardStore";
import { ImportProvider } from "./ImportProvider";
import { MediaUndoProvider } from "./MediaUndoProvider";
import { DashboardTabs } from "./DashboardTabs";
import { AgentChat } from "./AgentChat";
import { SubscribeGate } from "./SubscribeGate";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Text } from "@/components/ui/text";
import type { DashboardData } from "@/types/dashboard";

function PageHero({
  data,
  billingEnabled,
}: {
  data: DashboardData;
  billingEnabled: boolean;
}) {
  const router = useRouter();
  const [published, setPublishedState] = useState(data.published);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [showGate, setShowGate] = useState(false);

  const hasActiveSub = data.subscriptionStatus === "active";

  function toggle() {
    setError(null);
    const next = !published;
    if (billingEnabled && next && !hasActiveSub) {
      setShowGate(true);
      return;
    }
    startTransition(async () => {
      const res = await setPublished(next);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setPublishedState(next);
      router.refresh();
    });
  }

  return (
    <>
      <SubscribeGate
        username={data.username}
        open={showGate}
        onOpenChange={setShowGate}
      />
      <Card>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <Text variant="caption">Your public page</Text>
            <Link
              href={`/${data.username}`}
              target="_blank"
              className="text-fg mt-0.5 inline-flex max-w-full items-center gap-1.5 text-xl font-semibold tracking-tight underline-offset-4 hover:underline"
            >
              <span className="truncate">/{data.username}</span>
              <ExternalLink size={16} className="text-fg-subtle shrink-0" />
            </Link>
            {published && (
              <div className="mt-2">
                <span className="bg-accent/15 text-fg rounded-full px-2 py-0.5 text-xs font-medium">
                  Published
                </span>
              </div>
            )}
            {error && <p className="text-danger mt-2 text-sm">{error}</p>}
          </div>
          <Button
            variant="primary"
            onClick={toggle}
            disabled={pending}
            className="w-full sm:w-auto"
          >
            {billingEnabled && !hasActiveSub
              ? "Subscribe to publish"
              : published
                ? "Unpublish"
                : "Publish page"}
          </Button>
        </div>
      </Card>
    </>
  );
}

export function DashboardEditor({
  data,
  billingEnabled,
  instagramEnabled,
  igUsesUsername,
  agentEnabled,
}: {
  data: DashboardData;
  billingEnabled: boolean;
  instagramEnabled: boolean;
  igUsesUsername: boolean;
  agentEnabled: boolean;
}) {
  const canImport = !billingEnabled || data.subscriptionStatus === "active";
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-5">
      {instagramEnabled && (
        <Suspense fallback={null}>
          <IgConnectStatus />
        </Suspense>
      )}
      <PageHero data={data} billingEnabled={billingEnabled} />
      <DashboardStore initial={data}>
        <ImportProvider>
          <MediaUndoProvider>
            <DashboardTabs
              data={data}
              instagramEnabled={instagramEnabled}
              igUsesUsername={igUsesUsername}
              igConnected={data.instagramConnected}
              igUsername={data.instagramUsername}
              canImport={canImport}
            />
            {agentEnabled && (
              <AgentChat
                instagramConnected={data.instagramConnected}
                igUsesUsername={igUsesUsername}
              />
            )}
          </MediaUndoProvider>
        </ImportProvider>
      </DashboardStore>
    </div>
  );
}
