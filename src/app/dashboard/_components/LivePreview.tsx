"use client";

import { Spinner } from "@/components/ui/spinner";
import { Text } from "@/components/ui/text";
import type { DashboardData } from "@/types/dashboard";
import { useLivePreview } from "./useLivePreview";

export function LivePreview({ data }: { data: DashboardData }) {
  const preview = useLivePreview(data);

  return (
    <aside className="sticky top-24 hidden flex-col items-center gap-3 lg:flex">
      <Text variant="label" className="flex items-center gap-2">
        <span aria-hidden className="bg-success size-1.5 animate-pulse rounded-full" />
        Live preview
      </Text>
      <div className="border-hairline-strong bg-app-bg shadow-card relative aspect-[9/19] h-[min(760px,calc(100dvh-10rem))] overflow-hidden rounded-[2.6rem] border-[6px]">
        {!preview.loaded && (
          <div className="absolute inset-0 z-10 grid place-items-center">
            <Spinner className="text-fg-subtle size-6" />
          </div>
        )}
        <iframe
          key={preview.frameKey}
          src="/preview"
          title="Live preview of your page"
          onLoad={preview.onLoad}
          className="h-full w-full border-0"
        />
      </div>
    </aside>
  );
}
