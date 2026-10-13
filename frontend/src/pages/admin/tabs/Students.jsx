import { useEffect, useState } from 'react'
import { formatDistanceToNow } from 'date-fns'
import toast from 'react-hot-toast'
import { api } from '../../../lib/api'

export default function Students() {
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  async function loadStudents() {
    try {
      const { data } = await api.getRegisteredStudents()
      setStudents(data || [])
    } catch {
      toast.error('Failed to load registered students')
    }
    setLoading(false)
  }

  useEffect(() => {
    loadStudents()

    let channel = null
    if (typeof window !== 'undefined' && window.BroadcastChannel) {
      try {
        channel = new BroadcastChannel('classcheck_realtime')
        channel.onmessage = (event) => {
          if (event.data?.type === 'NEW_STUDENT_REGISTERED') {
            loadStudents()
          }
        }
      } catch {}
    }

    const handleStorage = (e) => {
      if (e.key === 'classcheck_registered_students' || e.key === 'classcheck_user') {
        loadStudents()
      }
    }
    window.addEventListener('storage', handleStorage)

    const interval = setInterval(loadStudents, 3000)

    return () => {
      if (channel) channel.close()
      window.removeEventListener('storage', handleStorage)
      clearInterval(interval)
    }
  }, [])

  function copyToClipboard(text, label = 'Copied') {
    navigator.clipboard.writeText(text)
    toast.success(`${label} to clipboard`)
  }

  function exportCSV() {
    if (students.length === 0) {
      toast.error('No students to export')
      return
    }
    const headers = ['Full Name', 'Matric No', 'Email', 'Department', 'Level', 'Status', 'Registered At']
    const rows = students.map((s) => [
      `"${s.full_name || ''}"`,
      `"${s.matric_no || ''}"`,
      `"${s.email || ''}"`,
      `"${s.department || ''}"`,
      `"${s.level || ''}"`,
      `"${s.status || 'active'}"`,
      `"${s.created_at || ''}"`,
    ])
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `classcheck_students_${new Date().toISOString().slice(0, 10)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast.success('Student roster exported')
  }

  const filtered = students.filter((s) => {
    if (!search.trim()) return true
    const q = search.toLowerCase()
    return (
      (s.full_name && s.full_name.toLowerCase().includes(q)) ||
      (s.matric_no && s.matric_no.toLowerCase().includes(q)) ||
      (s.email && s.email.toLowerCase().includes(q))
    )
  })

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-10 bg-[#111111] border border-white/[0.08] rounded-md animate-pulse" />
        <div className="h-64 bg-[#111111] border border-white/[0.08] rounded-md animate-pulse" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white tracking-tight">Registered Students</h2>
          <p className="text-xs text-white/40 mt-0.5">
            Active enrolled cohort directory for the closed pilot.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={exportCSV}
            className="px-3.5 py-1.5 text-xs font-semibold rounded bg-[#161616] border border-white/[0.1] text-white hover:bg-white/[0.06] transition-colors"
          >
            Export CSV
          </button>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="stat-card">
          <p className="text-3xl font-extrabold text-white tracking-tight">{students.length}</p>
          <p className="text-xs font-semibold text-white/45 uppercase tracking-wider mt-1">
            Total Active Students
          </p>
        </div>
        <div className="stat-card">
          <p className="text-3xl font-extrabold text-white tracking-tight">400L</p>
          <p className="text-xs font-semibold text-white/45 uppercase tracking-wider mt-1">
            Mathematics Pilot Level
          </p>
        </div>
        <div className="stat-card">
          <p className="text-3xl font-extrabold text-emerald-400 tracking-tight">Verified</p>
          <p className="text-xs font-semibold text-white/45 uppercase tracking-wider mt-1">
            Matriculation Verified
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-[#111111] border border-white/[0.08] rounded-md p-4">
        <input
          type="text"
          placeholder="Search by name, matric no, or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-[#161616] border border-white/[0.08] rounded px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-blue-500 transition-colors"
        />
      </div>

      {/* Students Table */}
      <div className="bg-[#111111] border border-white/[0.08] rounded-md overflow-hidden">
        <div className="px-5 py-3.5 border-b border-white/[0.08] bg-[#161616] flex items-center justify-between">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">
            Enrolled Students ({filtered.length})
          </h3>
          <span className="text-[11px] font-semibold text-white/40">
            {filtered.length === 1 ? '1 student found' : `${filtered.length} students found`}
          </span>
        </div>

        {filtered.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-sm font-medium text-white/50">No students match your search.</p>
          </div>
        ) : (
          <div className="divide-y divide-white/[0.06]">
            {filtered.map((st) => (
              <div
                key={st.id || st.matric_no}
                className="px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-white/[0.02] transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2.5">
                    <p className="text-sm font-bold text-white truncate">{st.full_name}</p>
                    <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
                      {st.status || 'Active'}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs text-white/40">
                    <span>
                      Matric: <strong className="text-white/70">{st.matric_no}</strong>
                    </span>
                    <span>•</span>
                    <button
                      onClick={() => copyToClipboard(st.email, 'Email copied')}
                      className="hover:text-white transition-colors underline decoration-white/20 underline-offset-2"
                      title="Click to copy email"
                    >
                      {st.email}
                    </button>
                    <span>•</span>
                    <span>{st.department} ({st.level}L)</span>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-xs text-white/35">
                    {st.created_at
                      ? `Enrolled ${formatDistanceToNow(new Date(st.created_at), { addSuffix: true })}`
                      : 'Pilot Student'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
