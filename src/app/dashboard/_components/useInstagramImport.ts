'use client'

import { useImportContext } from './ImportProvider'

export function useInstagramImport(tabId: string) {
  const { activeTabId, progress, start } = useImportContext()
  const importing = activeTabId === tabId
  return {
    importing,
    progress: importing ? progress : null,
    start: () => start(tabId),
  }
}
