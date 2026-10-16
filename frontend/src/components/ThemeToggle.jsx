import { useTheme } from '../context/ThemeContext'

export default function ThemeToggle({ className = '', showLabel = false }) {
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`relative inline-flex items-center justify-center gap-1.5 p-1.5 sm:p-2 rounded-[6px] transition-all duration-200 border focus:outline-none ${
        isDark
          ? 'text-white/60 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border-white/[0.08]'
          : 'text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/80 border-slate-200 shadow-sm'
      } ${className}`}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {/* Animated icon container */}
      <span className="relative w-4 h-4 flex items-center justify-center transition-transform duration-300">
        {isDark ? (
          /* Sun icon (to switch to light) */
          <svg
            className="w-4 h-4 text-amber-400 transform rotate-0 transition-transform duration-300"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
            />
          </svg>
        ) : (
          /* Moon icon (to switch to dark) */
          <svg
            className="w-4 h-4 text-blue-600 transform rotate-0 transition-transform duration-300"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
            />
          </svg>
        )}
      </span>

      {showLabel && (
        <span className="text-xs font-semibold tracking-tight">
          {isDark ? 'Light' : 'Dark'}
        </span>
      )}
    </button>
  )
}
