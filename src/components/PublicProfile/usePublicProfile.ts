'use client'

import { usePublicProfile as usePublicProfileHook } from '@/hooks/usePublicProfile'

interface UsePublicProfileProps {
  username: string
}

export function usePublicProfile({ username }: UsePublicProfileProps) {
  const { data, loading, error } = usePublicProfileHook(username)

  const handleLinkClick = (linkId: string) => {
    window.open(`/api/analytics/link-click/${linkId}`, '_blank', 'noopener,noreferrer')
  }

  return {
    profile: data?.profile || null,
    links: data?.links || [],
    loading,
    error,
    handleLinkClick
  }
} 