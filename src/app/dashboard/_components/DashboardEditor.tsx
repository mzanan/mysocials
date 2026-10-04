"use client";

import { Suspense } from "react";
import { CheckoutConfirm } from "./CheckoutConfirm";
import { IgConnectStatus } from "./IgConnectStatus";
import { DashboardStore } from "./DashboardStore";
import { ImportProvider } from "./ImportProvider";
import { MediaUndoProvider } from "./MediaUndoProvider";
import { DashboardTabs } from "./DashboardTabs";
import { AgentChat } from "./AgentChat";
import { LivePreview } from "./LivePreview";
import { PageHero } from "./PageHero";
import type { DashboardData } from "@/types/dashboard";

export function DashboardEditor({
  data,
  billingEnabled,
  instagramEnabled,
  igUsesUsername,
  agentEnabled,
  justCheckedOut,
}: {
  data: DashboardData;
  billingEnabled: boolean;
  instagramEnabled: boolean;
  igUsesUsername: boolean;
  agentEnabled: boolean;
  justCheckedOut: boolean;
}) {
  const canImport = !billingEnabled || data.subscriptionStatus === "active";
  return (
    <DashboardStore initial={data}>
      <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_auto]">
        <div className="flex min-w-0 flex-col gap-6">
          {justCheckedOut && (
            <CheckoutConfirm
              username={data.username}
              alreadyActive={data.subscriptionStatus === "active"}
            />
          )}
          {instagramEnabled && (
            <Suspense fallback={null}>
              <IgConnectStatus />
            </Suspense>
          )}
          <PageHero data={data} billingEnabled={billingEnabled} />
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
        </div>
        <LivePreview data={data} />
      </div>
    </DashboardStore>
  );
}
