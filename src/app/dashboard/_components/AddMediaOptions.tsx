"use client";

import { Instagram, Lock, Upload } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { GatedAction } from "./GatedAction";

export function AddMediaOptions({
  onPickPhotos,
  uploading,
}: {
  onPickPhotos: () => void;
  uploading: boolean;
}) {
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      <button
        type="button"
        onClick={onPickPhotos}
        disabled={uploading}
        className="group border-hairline bg-surface hover:border-hairline-strong hover:bg-surface-strong flex items-center gap-3 rounded-xl border p-3 text-left transition disabled:opacity-60"
      >
        <span className="bg-surface-strong text-fg grid size-10 shrink-0 place-items-center rounded-full">
          <Upload size={18} />
        </span>
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <span className="text-fg flex items-center gap-2 text-sm font-semibold">
            {uploading ? "Uploading…" : "Upload photos"}
            <Badge>Free</Badge>
          </span>
          <span className="text-fg-subtle text-xs">From your device</span>
        </div>
      </button>

      <GatedAction>
        {({ loading }) => (
          <button
            type="button"
            disabled={loading}
            className="group border-accent/40 bg-accent/8 hover:bg-accent/12 flex items-center gap-3 rounded-xl border p-3 text-left transition disabled:opacity-60"
          >
            <span className="bg-accent/15 text-accent grid size-10 shrink-0 place-items-center rounded-full">
              <Instagram size={18} />
            </span>
            <div className="flex min-w-0 flex-1 flex-col gap-0.5">
              <span className="text-fg flex items-center gap-2 text-sm font-semibold">
                Import from Instagram
                <Badge variant="accent">
                  <Lock size={11} /> Pro
                </Badge>
              </span>
              <span className="text-fg-subtle text-xs">
                Bring your whole grid in seconds
              </span>
            </div>
          </button>
        )}
      </GatedAction>
    </div>
  );
}
