import { create } from 'zustand'

// Helper: resolve effective theme based on system preference
function getEffectiveTheme(theme) {
  if (theme === 'sistema') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'oscuro' : 'claro'
  }
  return theme
}

// Apply theme to the document
function applyTheme(theme) {
  const effective = getEffectiveTheme(theme)
  document.documentElement.setAttribute('data-theme', effective === 'oscuro' ? 'dark' : 'light')
}

// Read persisted settings from localStorage
function loadSettings() {
  try {
    const stored = localStorage.getItem('app-settings')
    if (stored) return JSON.parse(stored)
  } catch { /* ignore */ }
  return { theme: 'claro', language: 'es' }
}

// Persist settings to localStorage
function saveSettings(settings) {
  try {
    localStorage.setItem('app-settings', JSON.stringify(settings))
  } catch { /* ignore */ }
}

const initial = loadSettings()

// Apply theme on initial load
applyTheme(initial.theme)

export const useSettingsStore = create((set, get) => ({
  theme: initial.theme,       // 'claro' | 'oscuro' | 'sistema'
  language: initial.language,  // 'es' | 'en'

  setTheme: (theme) => {
    applyTheme(theme)
    const next = { ...get(), theme }
    saveSettings({ theme: next.theme, language: next.language })
    set({ theme })
  },

  setLanguage: (language) => {
    const next = { ...get(), language }
    saveSettings({ theme: next.theme, language: next.language })
    set({ language })
  },
}))

// Listen for system theme changes when "sistema" is selected
if (typeof window !== 'undefined') {
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    const { theme } = useSettingsStore.getState()
    if (theme === 'sistema') {
      applyTheme('sistema')
    }
  })
}
