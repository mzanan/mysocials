import { z } from "zod";
import type { AgentContext, AgentPlan } from "@/types/agent";

const apiKey = process.env.AGENT_API_KEY || process.env.GROQ_API_KEY;
const baseUrl = process.env.AGENT_BASE_URL || "https://api.groq.com/openai/v1";
const model = process.env.AGENT_MODEL || "llama-3.3-70b-versatile";

export const agentEnabled = Boolean(apiKey);

const actionSchema = z.discriminatedUnion("tool", [
  z.object({
    tool: z.literal("create_tab"),
    label: z.string().trim().min(1).max(24),
    tabType: z.enum(["grid", "video"]),
  }),
  z.object({
    tool: z.literal("create_link"),
    title: z.string().trim().min(1).max(40),
    url: z.string().trim().url().max(500),
    tabLabel: z.string().trim().max(24).nullable(),
  }),
  z.object({
    tool: z.literal("open_upload"),
    tabLabel: z.string().trim().max(24).nullable(),
  }),
  z.object({ tool: z.literal("connect_instagram") }),
]);

const planSchema = z.object({
  reply: z.string().max(400),
  actions: z.array(actionSchema).max(12),
});

function systemPrompt(ctx: AgentContext): string {
  return [
    "You are the assistant inside mySocials, a link-in-bio builder.",
    "Turn the user request into ADDITIVE actions only — never delete, rename, or reorder anything.",
    'Respond with strict JSON: { "reply": string, "actions": Action[] }.',
    "Action types:",
    '- create_tab: { tool, label, tabType } where tabType is "grid" (photos) or "video".',
    "- create_link: { tool, title, url, tabLabel } — tabLabel matches an existing tab label or null for a global link. url must be absolute (https://...).",
    "- open_upload: { tool, tabLabel } — when the user wants to add photos/media to a tab.",
    "- connect_instagram: { tool } — when the user wants to connect or import Instagram.",
    `Existing tabs: ${ctx.tabLabels.length ? ctx.tabLabels.join(", ") : "(none)"}.`,
    `Instagram available: ${ctx.instagramEnabled}; already connected: ${ctx.instagramConnected}.`,
    "If a request needs no action, return an empty actions array and explain in reply.",
    "Keep reply short, friendly, and in the language of the user.",
  ].join("\n");
}

export async function planActions(
  message: string,
  ctx: AgentContext
): Promise<AgentPlan> {
  if (!agentEnabled)
    return { reply: "The assistant is not configured.", actions: [] };

  const res = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      temperature: 0.2,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: systemPrompt(ctx) },
        { role: "user", content: message },
      ],
    }),
  });

  if (!res.ok) throw new Error(`Agent provider error ${res.status}`);

  const data = await res.json();
  const raw = data.choices?.[0]?.message?.content;
  if (!raw) throw new Error("Empty agent response");

  const parsed = planSchema.safeParse(JSON.parse(raw));
  if (!parsed.success)
    return {
      reply: "I could not understand that — try rephrasing.",
      actions: [],
    };

  return { reply: parsed.data.reply, actions: parsed.data.actions };
}
