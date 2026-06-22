"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Trash2 } from "lucide-react";
import { updateTab } from "../actions";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { toast } from "@/lib/toast";
import type { DashTab } from "@/types/dashboard";
import { useDashboardStore } from "./DashboardStore";
import { MediaManager } from "./MediaManager";
import { TabLinks } from "./TabLinks";

export function TabPanel({
  tab,
  index,
  total,
  onReorder,
  onRemove,
  instagramEnabled,
  igUsesUsername,
  igConnected,
  igUsername,
  canImport,
}: {
  tab: DashTab;
  index: number;
  total: number;
  onReorder: (index: number, dir: -1 | 1) => void;
  onRemove: (id: string) => void;
  instagramEnabled: boolean;
  igUsesUsername: boolean;
  igConnected: boolean;
  igUsername: string | null;
  canImport: boolean;
}) {
  const { patchTab } = useDashboardStore();
  const [label, setLabel] = useState(tab.label);

  async function persist(next: { label: string; type: "grid" | "video" }) {
    const prev = { label: tab.label, type: tab.type };
    if (prev.label === next.label && prev.type === next.type) return;
    patchTab(tab.id, next);
    const res = await updateTab(tab.id, next);
    if (!res.ok) {
      patchTab(tab.id, prev);
      setLabel(prev.label);
      toast.error(res.error ?? "Couldn't save changes");
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <Field label="Tab name" className="flex-1 sm:max-w-xs">
          <Input
            name="tab-label"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            onBlur={() => persist({ label, type: tab.type })}
          />
        </Field>
        <Field label="Layout" className="sm:w-44">
          <Select
            name="tab-layout"
            value={tab.type}
            onChange={(e) =>
              persist({ label, type: e.target.value as "grid" | "video" })
            }
            className="w-full"
          >
            <option value="grid">Photo grid</option>
            <option value="video">Video</option>
          </Select>
        </Field>
        <div className="flex items-center gap-1 sm:pb-0.5">
          <Button
            variant="ghost"
            size="icon"
            disabled={index === 0}
            onClick={() => onReorder(index, -1)}
            aria-label="Move tab left"
          >
            <ChevronLeft size={16} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            disabled={index === total - 1}
            onClick={() => onReorder(index, 1)}
            aria-label="Move tab right"
          >
            <ChevronRight size={16} />
          </Button>
          <Button
            variant="danger"
            size="icon"
            onClick={() => onRemove(tab.id)}
            aria-label="Delete tab"
            className="ml-auto"
          >
            <Trash2 size={16} />
          </Button>
        </div>
      </div>

      <MediaManager
        tab={tab}
        instagramEnabled={instagramEnabled}
        igUsesUsername={igUsesUsername}
        igConnected={igConnected}
        canImport={canImport}
      />

      <TabLinks tabId={tab.id} igUsername={igUsername} />
    </div>
  );
}
