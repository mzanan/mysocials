export type AgentAction =
  | { tool: "create_tab"; label: string; tabType: "grid" | "video" }
  | { tool: "create_link"; title: string; url: string; tabLabel: string | null }
  | { tool: "open_upload"; tabLabel: string | null }
  | { tool: "connect_instagram" };

export interface AgentPlan {
  reply: string;
  actions: AgentAction[];
}

export interface AgentContext {
  tabLabels: string[];
  instagramEnabled: boolean;
  instagramConnected: boolean;
}
