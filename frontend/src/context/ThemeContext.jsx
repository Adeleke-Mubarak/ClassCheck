import { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react'

const THEME_STORAGE_KEY = 'classcheck_theme'

const ThemeContext = createContext({
  theme: 'dark',
  preference: 'dark',
  toggleTheme: () => {},
  setTheme: () => {},
})

export function ThemeProvider({ children }) {
  // Read initial preference from localStorage (default to 'dark' to preserve ClassCheck's signature aesthetic)
  const [preference, setPreferenceState] = useState(() => {
    try {
      const saved = localStorage.getItem(THEME_STORAGE_KEY)
      if (saved === 'dark' || saved === 'light' || saved === 'system') {
        return saved
      }
    } catch {}
    return 'dark'
  })

  // System dark mode listener
  const [systemIsDark, setSystemIsDark] = useState(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches
    }
    return true
  })

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = (e) => setSystemIsDark(e.matches)
    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  // Resolved active theme ('dark' or 'light')
  const theme = useMemo(() => {
    if (preference === 'system') {
      return systemIsDark ? 'dark' : 'light'
    }
    return preference
  }, [preference, systemIsDark])

  // Apply class and data-theme to <html> and update theme-color meta tag
  useEffect(() => {
    const root = document.documentElement
    if (theme === 'dark') {
      root.classList.add('dark')
      root.classList.remove('light')
      root.setAttribute('data-theme', 'dark')
      root.style.colorScheme = 'dark'
    } else {
      root.classList.remove('dark')
      root.classList.add('light')
      root.setAttribute('data-theme', 'light')
      root.style.colorScheme = 'light'
    }

    // Update <meta name="theme-color"> for mobile browser chrome
    const metaThemeColor = document.querySelector('meta[name="theme-color"]')
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', theme === 'dark' ? '#0A0A0A' : '#F8FAFC')
    }
  }, [theme])

  const setTheme = useCallback((newPreference) => {
    setPreferenceState(newPreference)
    try {
      localStorage.setItem(THEME_STORAGE_KEY, newPreference)
    } catch {}
  }, [])

  const toggleTheme = useCallback(() => {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }, [theme, setTheme])

  const value = useMemo(
    () => ({
      theme,
      preference,
      toggleTheme,
      setTheme,
    }),
    [theme, preference, toggleTheme, setTheme]
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
