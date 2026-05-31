"use client";

import { useState } from "react";
import { Mic, Send, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAgentChat } from "./useAgentChat";

export function AgentChat({
  instagramConnected,
}: {
  instagramConnected: boolean;
}) {
  const [open, setOpen] = useState(false);
  const chat = useAgentChat({ instagramConnected });

  if (!open) {
    return (
      <Button
        variant="glassPrimary"
        onClick={() => setOpen(true)}
        className="shadow-glass-lg fixed right-5 bottom-5 z-40 h-12 gap-2 rounded-full px-5"
      >
        <Sparkles size={16} /> Assistant
      </Button>
    );
  }

  return (
    <div className="bg-app-bg/95 shadow-glass-lg fixed right-5 bottom-5 z-40 flex h-[460px] w-[360px] max-w-[calc(100vw-2.5rem)] flex-col overflow-hidden rounded-2xl border border-white/10 backdrop-blur-xl">
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
        <span className="flex items-center gap-2 text-sm font-medium text-white">
          <Sparkles size={15} className="text-white/60" /> Assistant
        </span>
        <button
          onClick={() => setOpen(false)}
          className="rounded-md p-1 text-white/45 transition hover:bg-white/10 hover:text-white/80"
          aria-label="Close assistant"
        >
          <X size={16} />
        </button>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
        {chat.messages.length === 0 && (
          <p className="text-sm text-white/45">
            Ask me to set things up — e.g. “add an Instagram tab and a video
            tab”, or “connect my Instagram”.
          </p>
        )}
        {chat.messages.map((m, i) => (
          <div
            key={i}
            className={`max-w-[85%] rounded-xl px-3 py-2 text-sm whitespace-pre-line ${
              m.role === "user"
                ? "ml-auto bg-white/[0.12] text-white"
                : "bg-white/[0.05] text-white/80"
            }`}
          >
            {m.text}
          </div>
        ))}
        {chat.busy && <p className="text-sm text-white/40">Thinking…</p>}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          chat.send();
        }}
        className="flex items-center gap-2 border-t border-white/10 p-3"
      >
        {chat.micSupported && (
          <Button
            type="button"
            variant="glass"
            size="icon"
            onClick={chat.toggleMic}
            className={chat.listening ? "text-red-300" : "text-white/70"}
            aria-label="Voice input"
          >
            <Mic size={16} />
          </Button>
        )}
        <Input
          value={chat.input}
          onChange={(e) => chat.setInput(e.target.value)}
          placeholder={chat.listening ? "Listening…" : "Type a request"}
          className="h-10 flex-1 px-3"
        />
        <Button
          type="submit"
          variant="glassPrimary"
          size="icon"
          disabled={chat.busy || !chat.input.trim()}
          aria-label="Send"
        >
          <Send size={16} />
        </Button>
      </form>
    </div>
  );
}
