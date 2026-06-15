import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { ig_connections, profiles } from "@/lib/db/schema";
import { instagramEnabled } from "@/lib/ig";
import { billingEnabled } from "@/lib/subscription";
import { agentEnabled } from "@/lib/agent/planner";
import { DashboardEditor } from "./_components/DashboardEditor";
import type { DashboardData } from "@/types/dashboard";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/");

  const profile = await db.query.profiles.findFirst({
    where: eq(profiles.user_id, session.user.id),
    with: {
      tabs: {
        orderBy: (t, { asc }) => [asc(t.position)],
        with: { media: { orderBy: (m, { asc }) => [asc(m.position)] } },
      },
      links: { orderBy: (l, { asc }) => [asc(l.position)] },
    },
  });
  if (!profile) redirect("/");

  const igConn = instagramEnabled()
    ? await db.query.ig_connections.findFirst({
        where: eq(ig_connections.user_id, session.user.id),
      })
    : null;

  const data: DashboardData = {
    username: profile.username,
    displayName: profile.display_name,
    bio: profile.bio,
    accent: profile.accent,
    theme: profile.theme,
    avatarUrl: profile.avatar_url,
    published: profile.published,
    subscriptionStatus: profile.subscription_status,
    instagramConnected: Boolean(igConn),
    tabs: profile.tabs.map((t) => ({
      id: t.id,
      label: t.label,
      type: t.type,
      gridSize: t.grid_size,
      media: t.media.map((m) => ({
        id: m.id,
        kind: m.kind,
        url: m.url,
        posterUrl: m.poster_url,
      })),
    })),
    links: profile.links.map((l) => ({
      id: l.id,
      tabId: l.tab_id,
      network: l.network,
      handle: l.handle,
      title: l.title,
      url: l.url,
      icon: l.icon,
    })),
  };

  return (
    <DashboardEditor
      data={data}
      billingEnabled={billingEnabled()}
      instagramEnabled={instagramEnabled()}
      agentEnabled={agentEnabled}
    />
  );
}
