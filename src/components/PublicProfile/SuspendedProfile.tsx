import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Text } from '@/components/ui/text'
import type { SuspendedProfilePublic } from '@/types/profile'

export function SuspendedProfile({ profile }: { profile: SuspendedProfilePublic }) {
  const displayName = profile.displayName || profile.username

  return (
    <div
      className="relative flex h-dvh flex-col items-center justify-center overflow-hidden bg-app-bg text-fg"
      style={{ ['--accent-glow' as string]: profile.accent }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,color-mix(in_oklab,var(--accent-glow)_18%,transparent)_0%,transparent_55%)]"
      />

      <div className="relative z-10 w-[340px] rounded-3xl shadow-glass-lg">
        <div className="absolute inset-0 rounded-3xl border border-hairline-strong bg-surface backdrop-blur-2xl [box-shadow:inset_0_1px_0_0_rgba(255,255,255,0.18)]" />
        <div className="relative flex flex-col items-center gap-4 p-8 text-center">
          <Avatar className="h-20 w-20 ring-2 ring-hairline-strong">
            {profile.avatarUrl && <AvatarImage src={profile.avatarUrl} alt={displayName} />}
            <AvatarFallback className="text-xl">
              {displayName.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col gap-1">
            <Text as="h1" variant="title" className="text-xl">
              {displayName}
            </Text>
            <Text variant="caption" className="text-sm">
              @{profile.username}
            </Text>
          </div>
          <Text variant="body" className="mt-2 text-sm">
            This page is currently paused.
          </Text>
        </div>
      </div>

      <div aria-hidden className="grain-overlay" />
    </div>
  )
}
