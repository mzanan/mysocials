'use client'

import { Moon, Sun } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { THEME_STORAGE_KEY } from '@/lib/appearance'

export function ThemeToggle() {
  function toggle() {
    const cur = document.documentElement.dataset.theme === 'light' ? 'light' : 'dark'
    const next = cur === 'dark' ? 'light' : 'dark'
    document.documentElement.dataset.theme = next
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next)
    } catch {}
  }

  return (
    <Button variant="ghost" size="icon" onClick={toggle} aria-label="Toggle theme">
      <Sun size={16} className="theme-when-dark" />
      <Moon size={16} className="theme-when-light" />
    </Button>
  )
}
