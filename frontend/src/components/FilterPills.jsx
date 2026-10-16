import { useTheme } from '../context/ThemeContext'

const FILTERS = ['All', 'Cancelled', 'Venue change']

export default function FilterPills({ active, onChange }) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
      {FILTERS.map((f) => {
        const isActive = active === f
        return (
          <button
            key={f}
            onClick={() => onChange(f)}
            style={{
              padding: '6px 16px',
              borderRadius: '6px',
              fontSize: '13px',
              fontWeight: isActive ? 700 : 500,
              border: isActive
                ? '1px solid #2563EB'
                : `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : '#E2E8F0'}`,
              background: isActive
                ? isDark ? 'rgba(37,99,235,0.15)' : '#EFF6FF'
                : isDark ? 'transparent' : '#FFFFFF',
              color: isActive
                ? isDark ? '#60A5FA' : '#2563EB'
                : isDark ? 'rgba(255,255,255,0.5)' : '#64748B',
              boxShadow: !isActive && !isDark ? '0 1px 2px 0 rgba(0, 0, 0, 0.03)' : 'none',
              cursor: 'pointer',
              transition: 'all 0.15s',
              fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif",
            }}
          >
            {f}
          </button>
        )
      })}
    </div>
  )
}
