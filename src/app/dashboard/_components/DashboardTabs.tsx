'use client'

import { useState, useTransition } from 'react'
import { Clapperboard, LayoutGrid, Plus, User } from 'lucide-react'
import { createTab, deleteTab, reorderTabs } from '../actions'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card } from '@/components/ui/card'
import { moveItem } from '@/lib/array'
import { toast } from '@/lib/toast'
import type { DashboardData } from '@/types/dashboard'
import { useDashboardStore } from './DashboardStore'
import { ProfileSection } from './ProfileSection'
import { TabPanel } from './TabPanel'

const triggerClass =
  'flex-none gap-1.5 rounded-lg px-3 py-1.5 text-sm data-[state=active]:bg-surface-strong'

export function DashboardTabs({
  data,
  instagramEnabled,
  igUsesUsername,
  igConnected,
  igUsername,
}: {
  data: DashboardData
  instagramEnabled: boolean
  igUsesUsername: boolean
  igConnected: boolean
  igUsername: string | null
}) {
  const { tabs, setTabs } = useDashboardStore()
  const [active, setActive] = useState('profile')
  const [pending, startTransition] = useTransition()

  function addTab() {
    startTransition(async () => {
      const res = await createTab({ label: 'New tab', type: 'grid' })
      if (!res.ok) {
        toast.error(res.error)
        return
      }
      setTabs((prev) => [...prev, res.tab])
      setActive(res.tab.id)
      toast.success('Tab created')
    })
  }

  function reorder(index: number, dir: -1 | 1) {
    const ordered = moveItem(tabs, index, dir)
    setTabs(ordered)
    reorderTabs(ordered.map((t) => t.id))
  }

  function remove(id: string) {
    const tab = tabs.find((t) => t.id === id)
    setActive('profile')
    setTabs((prev) => prev.filter((t) => t.id !== id))
    deleteTab(id)
    if (tab) toast.success(`Tab “${tab.label}” deleted`)
  }

  return (
    <Tabs value={active} onValueChange={setActive} className="gap-4">
      <TabsList className="flex h-auto w-full justify-start gap-1 overflow-x-auto rounded-xl p-1">
        <TabsTrigger value="profile" className={triggerClass}>
          <User size={15} /> Profile
        </TabsTrigger>
        {tabs.map((t) => (
          <TabsTrigger key={t.id} value={t.id} className={triggerClass}>
            {t.type === 'video' ? <Clapperboard size={15} /> : <LayoutGrid size={15} />}
            {t.label || 'Untitled'}
          </TabsTrigger>
        ))}
        <button
          type="button"
          onClick={addTab}
          disabled={pending}
          aria-label="Add tab"
          className="ml-1 grid h-8 w-8 flex-none place-items-center rounded-lg text-fg-subtle transition hover:bg-surface-strong hover:text-fg disabled:opacity-50"
        >
          <Plus size={16} />
        </button>
      </TabsList>

      <TabsContent value="profile">
        <Card>
          <ProfileSection data={data} />
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
            />
          </Card>
        </TabsContent>
      ))}
    </Tabs>
  )
}
