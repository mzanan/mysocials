export const THEME_VALUES = ['dark', 'light'] as const

export type Theme = (typeof THEME_VALUES)[number]

export const THEMES = [
  { value: 'dark', label: 'Dark' },
  { value: 'light', label: 'Light' },
] as const satisfies ReadonlyArray<{ value: Theme; label: string }>

export const DEFAULT_PROFILE_THEME: Theme = 'dark'

export const THEME_STORAGE_KEY = 'ms-theme'

export const ACCENT_PRESETS = [
  '#a78bfa',
  '#f472b6',
  '#60a5fa',
  '#34d399',
  '#fbbf24',
  '#f87171',
]
