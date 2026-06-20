"use client";

import { useState, useTransition } from "react";
import { Clapperboard, LayoutGrid, Plus, User } from "lucide-react";
import {
  DndContext,
  closestCenter,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  arrayMove,
  horizontalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { createTab, deleteTab, reorderTabs } from "../actions";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { moveItem } from "@/lib/array";
import { toast } from "@/lib/toast";
import { useHorizontalWheelScroll } from "@/hooks/useHorizontalWheelScroll";
import type { DashboardData, DashTab } from "@/types/dashboard";
import { useDashboardStore } from "./DashboardStore";
import { ProfileSection } from "./ProfileSection";
import { TabPanel } from "./TabPanel";

const triggerClass =
  "flex-none gap-1.5 rounded-lg px-3 py-1.5 text-sm transition data-[state=inactive]:hover:bg-hover data-[state=inactive]:hover:text-fg data-[state=active]:bg-surface-stronger data-[state=active]:shadow-sm data-[state=active]:[&_svg]:text-accent";

function SortableTabTrigger({ tab }: { tab: DashTab }) {
  const { listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: tab.id });
  return (
    <TabsTrigger
      ref={setNodeRef}
      value={tab.id}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(
        triggerClass,
        "cursor-grab active:cursor-grabbing",
        isDragging && "z-10 opacity-70"
      )}
      {...listeners}
    >
      {tab.type === "video" ? (
        <Clapperboard size={15} />
      ) : (
        <LayoutGrid size={15} />
      )}
      {tab.label || "Untitled"}
    </TabsTrigger>
  );
}

export function DashboardTabs({
  data,
  instagramEnabled,
  igUsesUsername,
  igConnected,
  igUsername,
  canImport,
}: {
  data: DashboardData;
  instagramEnabled: boolean;
  igUsesUsername: boolean;
  igConnected: boolean;
  igUsername: string | null;
  canImport: boolean;
}) {
  const { tabs, setTabs } = useDashboardStore();
  const [active, setActive] = useState("profile");
  const [pending, startTransition] = useTransition();
  const tabBarRef = useHorizontalWheelScroll<HTMLDivElement>();
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 180, tolerance: 8 },
    })
  );

  function addTab() {
    startTransition(async () => {
      const res = await createTab({ label: "New tab", type: "grid" });
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      setTabs((prev) => [...prev, res.tab]);
      setActive(res.tab.id);
      toast.success("Tab created");
    });
  }

  function reorder(index: number, dir: -1 | 1) {
    const ordered = moveItem(tabs, index, dir);
    setTabs(ordered);
    reorderTabs(ordered.map((t) => t.id));
  }

  function onDragEnd(e: DragEndEvent) {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const oldIndex = tabs.findIndex((t) => t.id === active.id);
    const newIndex = tabs.findIndex((t) => t.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;
    const ordered = arrayMove(tabs, oldIndex, newIndex);
    setTabs(ordered);
    reorderTabs(ordered.map((t) => t.id));
  }

  function remove(id: string) {
    const tab = tabs.find((t) => t.id === id);
    setActive("profile");
    setTabs((prev) => prev.filter((t) => t.id !== id));
    deleteTab(id);
    if (tab) toast.success(`Tab “${tab.label}” deleted`);
  }

  return (
    <Tabs value={active} onValueChange={setActive} className="gap-4">
      <div ref={tabBarRef} className="no-scrollbar -m-1 overflow-x-auto p-1">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={onDragEnd}
        >
          <TabsList className="inline-flex h-auto w-max justify-start gap-1 rounded-xl p-1">
            <TabsTrigger value="profile" className={triggerClass}>
              <User size={15} /> Profile
            </TabsTrigger>
            <SortableContext
              items={tabs.map((t) => t.id)}
              strategy={horizontalListSortingStrategy}
            >
              {tabs.map((t) => (
                <SortableTabTrigger key={t.id} tab={t} />
              ))}
            </SortableContext>
            <button
              type="button"
              onClick={addTab}
              disabled={pending}
              aria-label="Add tab"
              className="text-fg-subtle hover:bg-hover hover:text-fg ml-1 grid h-8 w-8 flex-none place-items-center rounded-lg transition disabled:opacity-50"
            >
              <Plus size={16} />
            </button>
          </TabsList>
        </DndContext>
      </div>

      <TabsContent value="profile">
        <Card>
          <ProfileSection data={data} canImport={canImport} />
        </Card>
      </TabsContent>

      {tabs.map((t, i) => (
        <TabsContent key={t.id} value={t.id}>
          <Card>
            <TabPanel
              tab={t}
              index={i}
              total={tabs.length}
              onReorder={reorder}
              onRemove={remove}
              instagramEnabled={instagramEnabled}
              igUsesUsername={igUsesUsername}
              igConnected={igConnected}
              igUsername={igUsername}
              canImport={canImport}
            />
          </Card>
        </TabsContent>
      ))}
    </Tabs>
  );
}
