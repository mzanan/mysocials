import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { agentEnabled, planActions } from "@/lib/agent/planner";
import { importEnabled } from "@/lib/ig";

export async function POST(req: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!agentEnabled)
    return NextResponse.json(
      { error: "Assistant not configured" },
      { status: 503 }
    );

  const body = await req.json().catch(() => null);
  const message = typeof body?.message === "string" ? body.message.trim() : "";
  const tabLabels = Array.isArray(body?.tabLabels)
    ? body.tabLabels.filter((l: unknown): l is string => typeof l === "string")
    : [];
  if (!message)
    return NextResponse.json({ error: "Empty message" }, { status: 400 });

  try {
    const plan = await planActions(message, {
      tabLabels,
      instagramEnabled: importEnabled(),
      instagramConnected: Boolean(body?.instagramConnected),
    });
    return NextResponse.json(plan);
  } catch {
    return NextResponse.json({ error: "Assistant failed" }, { status: 502 });
  }
}
