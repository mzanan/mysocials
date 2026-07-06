"use client";

import { useState } from "react";
import Image from "next/image";
import { Instagram, Images } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import type { DashMedia } from "@/types/dashboard";
import { MediaPicker } from "./MediaPicker";
import { SubscribeLockButton } from "./SubscribeLockButton";
import { useAvatar } from "./useAvatar";

export function AvatarSection({
  initialUrl,
  instagramConnected,
  imageMedia,
  canImport,
}: {
  initialUrl: string | null;
  instagramConnected: boolean;
  imageMedia: DashMedia[];
  canImport: boolean;
}) {
  const {
    avatarUrl,
    busy,
    msg,
    fileRef,
    uploadFile,
    useInstagramAvatar,
    pickFromMedia,
  } = useAvatar(initialUrl);
  const [pickerOpen, setPickerOpen] = useState(false);

  async function onPick(id: string) {
    setPickerOpen(false);
    await pickFromMedia(id);
  }

  return (
    <div className="flex items-center gap-4">
      <div className="border-hairline-strong bg-surface relative h-16 w-16 shrink-0 overflow-hidden rounded-full border">
        {avatarUrl && (
          <Image
            src={avatarUrl}
            alt="avatar"
            fill
            priority
            className="object-cover"
            sizes="64px"
          />
        )}
      </div>
      <div className="flex min-w-0 flex-col gap-1.5">
        <Text variant="label">Profile photo</Text>
        <input
          ref={fileRef}
          type="file"
          accept="image/*,.heic,.heif"
          hidden
          onChange={uploadFile}
        />
        <div className="flex flex-wrap gap-1.5">
          <Button
            variant="secondary"
            size="sm"
            disabled={busy}
            onClick={() => fileRef.current?.click()}
          >
            {busy ? "Updating…" : "Upload"}
          </Button>
          {imageMedia.length > 0 && (
            <Button
              variant="secondary"
              size="sm"
              disabled={busy}
              onClick={() => setPickerOpen(true)}
            >
              <Images size={14} /> Photos
            </Button>
          )}
          {instagramConnected &&
            (canImport ? (
              <Button
                variant="secondary"
                size="sm"
                disabled={busy}
                onClick={useInstagramAvatar}
              >
                <Instagram size={14} /> Import from Instagram
              </Button>
            ) : (
              <SubscribeLockButton size="sm" />
            ))}
        </div>
        {msg && <span className="text-fg-subtle text-xs">{msg}</span>}
      </div>

      <MediaPicker
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        media={imageMedia}
        onPick={onPick}
      />
    </div>
  );
}
