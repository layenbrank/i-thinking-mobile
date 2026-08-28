import { create } from 'zustand'

import { mmkvStorage } from '@/stores/storage'

type ThemePreference = 'system' | 'light' | 'dark'
type LanguagePreference = 'zh' | 'en'

interface SettingsState {
  theme: ThemePreference
  language: LanguagePreference
  hydrate: () => void
  setTheme: (theme: ThemePreference) => void
  setLanguage: (language: LanguagePreference) => void
}

const SETTINGS_KEY = 'app:settings'

function readSettings(): Pick<SettingsState, 'theme' | 'language'> {
  const raw = mmkvStorage.getItem(SETTINGS_KEY)
  if (!raw) {
    return { theme: 'system', language: 'zh' }
  }
  return JSON.parse(raw) as Pick<SettingsState, 'theme' | 'language'>
}

function writeSettings(theme: ThemePreference, language: LanguagePreference) {
  mmkvStorage.setItem(SETTINGS_KEY, JSON.stringify({ theme, language }))
}

const useSettingsStore = create<SettingsState>((set) => ({
  theme: 'system',
  language: 'zh',

  hydrate() {
    const settings = readSettings()
    set(settings)
  },

  setTheme(theme) {
    set({ theme })
    const { language } = useSettingsStore.getState()
    writeSettings(theme, language)
  },

  setLanguage(language) {
    set({ language })
    const { theme } = useSettingsStore.getState()
    writeSettings(theme, language)
  }
}))

export type { LanguagePreference, ThemePreference }
export { useSettingsStore }
