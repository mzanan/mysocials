"use client";

import { Suspense, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { setPublished } from "../actions";
import { IgConnectStatus } from "./IgConnectStatus";
import { ProfileSection } from "./ProfileSection";
import { TabsSection } from "./TabsSection";
import { LinksSection } from "./LinksSection";
import { BillingCard } from "./BillingCard";
import { DashboardStore } from "./DashboardStore";
import { AgentChat } from "./AgentChat";
import { SubscribeGate } from "./SubscribeGate";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { DashboardData } from "@/types/dashboard";

function PublishBar({
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

  const status = data.subscriptionStatus;
  const hasActiveSub = status === "active";

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

  if (showGate) {
    return <SubscribeGate username={data.username} />;
  }

  return (
    <Card>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs text-fg-subtle">Your public page</p>
          <Link
            href={`/${data.username}`}
            target="_blank"
            className="inline-flex items-center gap-1.5 text-lg font-medium text-fg underline-offset-4 hover:underline"
          >
            /{data.username}{" "}
            <ExternalLink size={15} className="text-fg-subtle" />
          </Link>
          {error && <p className="mt-1 text-sm text-danger">{error}</p>}
          {billingEnabled && !hasActiveSub && (
            <p className="mt-1 text-sm text-fg-subtle">
              Subscribe to publish your page.
            </p>
          )}
        </div>
        <Button
          variant="primary"
          onClick={toggle}
          disabled={pending || (billingEnabled && !hasActiveSub && published === false)}
        >
          {published ? "Published — unpublish" : "Publish page"}
        </Button>
      </div>
    </Card>
  );
}

export function DashboardEditor({
  data,
  billingEnabled,
  instagramEnabled,
  agentEnabled,
}: {
  data: DashboardData;
  billingEnabled: boolean;
  instagramEnabled: boolean;
  agentEnabled: boolean;
}) {
  return (
    <div className="flex flex-col gap-6">
      {instagramEnabled && (
        <Suspense fallback={null}>
          <IgConnectStatus />
        </Suspense>
      )}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-fg">
          Dashboard
        </h1>
        <p className="mt-1 text-sm text-fg-subtle">
          Build your page. Changes save as you go.
        </p>
      </div>
      <PublishBar data={data} billingEnabled={billingEnabled} />
      {billingEnabled && <BillingCard status={data.subscriptionStatus} />}
      <ProfileSection data={data} />
      <DashboardStore initial={data}>
        <TabsSection
          instagramEnabled={instagramEnabled}
          igConnected={data.instagramConnected}
        />
        <LinksSection />
        {agentEnabled && (
          <AgentChat instagramConnected={data.instagramConnected} />
        )}
      </DashboardStore>
    </div>
  );
}
