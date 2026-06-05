"use client";

import { useRef, useState } from "react";
import { createTab, createLink } from "../actions";
import { useDashboardStore } from "./DashboardStore";
import {
  createRecognition,
  speechSupported,
  transcriptFrom,
  type Recognition,
} from "@/lib/speech";
import { toast } from "@/lib/toast";
import type { AgentAction } from "@/types/agent";

export interface ChatMessage {
  role: "user" | "assistant";
  text: string;
}

export function useAgentChat({
  instagramConnected,
}: {
  instagramConnected: boolean;
}) {
  const { tabs, setTabs, setLinks } = useDashboardStore();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef<Recognition | null>(null);

  async function runAction(action: AgentAction): Promise<string | null> {
    if (action.tool === "create_tab") {
      const res = await createTab({
        label: action.label,
        type: action.tabType,
      });
      if (!res.ok) return `Couldn't create “${action.label}”: ${res.error}`;
      setTabs((prev) => [...prev, res.tab]);
      return `Created the “${res.tab.label}” tab`;
    }
    if (action.tool === "create_link") {
      const tabId = action.tabLabel
        ? (tabs.find(
            (t) => t.label.toLowerCase() === action.tabLabel?.toLowerCase()
          )?.id ?? null)
        : null;
      const res = await createLink({
        tabId,
        network: null,
        handle: null,
        title: action.title,
        url: action.url,
        icon: null,
      });
      if (!res.ok)
        return `Couldn't add the “${action.title}” link: ${res.error}`;
      setLinks((prev) => [...prev, res.link]);
      return `Added the “${res.link.title}” link`;
    }
    if (action.tool === "connect_instagram") {
      if (instagramConnected) return "Instagram is already connected";
      window.location.href = "/api/import/instagram/connect";
      return "Opening Instagram connect…";
    }
    if (action.tool === "open_upload") {
      const tab = action.tabLabel
        ? tabs.find(
            (t) => t.label.toLowerCase() === action.tabLabel?.toLowerCase()
          )
        : tabs[0];
      if (!tab) return "Create a tab first, then add photos to it";
      return `Open the “${tab.label}” tab and tap Add to upload from your phone`;
    }
    return null;
  }

  async function send(raw?: string) {
    const text = (raw ?? input).trim();
    if (!text || busy) return;
    setInput("");
    setMessages((prev) => [...prev, { role: "user", text }]);
    setBusy(true);
    try {
      const res = await fetch("/api/agent", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          message: text,
          tabLabels: tabs.map((t) => t.label),
          instagramConnected,
        }),
      });
      if (!res.ok) throw new Error();
      const plan: { reply: string; actions: AgentAction[] } = await res.json();

      const done: string[] = [];
      for (const action of plan.actions) {
        const note = await runAction(action);
        if (note) done.push(note);
      }

      const reply = [plan.reply, ...done.map((d) => `• ${d}`)]
        .filter(Boolean)
        .join("\n");
      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: reply || "Done." },
      ]);
    } catch {
      toast.error("The assistant could not respond");
      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: "Something went wrong — try again." },
      ]);
    } finally {
      setBusy(false);
    }
  }

  function toggleMic() {
    if (listening) {
      recognitionRef.current?.stop();
      return;
    }
    const recognition = createRecognition(navigator.language || "en-US");
    if (!recognition) {
      toast.error("Voice input is not supported in this browser");
      return;
    }
    recognitionRef.current = recognition;
    recognition.onresult = (event) => {
      const transcript = transcriptFrom(event);
      if (transcript) setInput(transcript);
    };
    recognition.onend = () => setListening(false);
    recognition.onerror = () => setListening(false);
    setListening(true);
    recognition.start();
  }

  return {
    messages,
    input,
    setInput,
    busy,
    listening,
    micSupported: speechSupported(),
    send,
    toggleMic,
  };
}
