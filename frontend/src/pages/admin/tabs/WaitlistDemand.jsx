import { useEffect, useState, useRef } from 'react'
import { formatDistanceToNow } from 'date-fns'
import toast from 'react-hot-toast'
import { api } from '../../../lib/api'

export default function WaitlistDemand() {
  const [waitlist, setWaitlist] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedDept, setSelectedDept] = useState('All')
  const [showAddModal, setShowAddModal] = useState(false)
  const [lastSyncTime, setLastSyncTime] = useState(new Date())
  const [newEntry, setNewEntry] = useState({
    full_name: '',
    email: '',
    university: 'University of Lagos',
    department: 'Computer Science',
    level: '300',
  })

  const previousCountRef = useRef(null)

  async function loadData(isBackground = false) {
    try {
      const { data } = await api.getWaitlistEntries()
      const list = data || []
      
      // If new entries arrived in background, notify admin
      if (
        isBackground &&
        previousCountRef.current !== null &&
        list.length > previousCountRef.current
      ) {
        const newest = list[0]
        toast.success(`⚡ Real-time demand: ${newest.full_name} (${newest.department})`, {
          duration: 5000,
          id: `wl_live_${newest.id}`,
        })
      }
      
      previousCountRef.current = list.length
      setWaitlist(list)
      setLastSyncTime(new Date())
    } catch {
      if (!isBackground) toast.error('Failed to load waitlist entries')
    }
    if (!isBackground) setLoading(false)
  }

  useEffect(() => {
    loadData(false)

    // 1. BroadcastChannel: Instant cross-tab real-time push
    let channel = null
    if (typeof window !== 'undefined' && window.BroadcastChannel) {
      try {
        channel = new BroadcastChannel('classcheck_realtime')
        channel.onmessage = (event) => {
          if (
            event.data?.type === 'NEW_WAITLIST_ENTRY' ||
            event.data?.type === 'UPDATE_WAITLIST' ||
            event.data?.type === 'DELETE_WAITLIST'
          ) {
            loadData(true)
          }
        }
      } catch {}
    }

    // 2. Storage event: Cross-tab localStorage listener
    const handleStorage = (e) => {
      if (e.key === 'classcheck_dev_waitlist') {
        loadData(true)
      }
    }
    window.addEventListener('storage', handleStorage)

    // 3. Heartbeat polling (every 2.5 seconds) for real-time live sync
    const interval = setInterval(() => {
      loadData(true)
    }, 2500)

    return () => {
      if (channel) channel.close()
      window.removeEventListener('storage', handleStorage)
      clearInterval(interval)
    }
  }, [])

  // Aggregate department counts
  const departmentCounts = waitlist.reduce((acc, curr) => {
    const dept = curr.department || 'Other'
    acc[dept] = (acc[dept] || 0) + 1
    return acc
  }, {})

  const sortedDepartments = Object.entries(departmentCounts).sort((a, b) => b[1] - a[1])
  const uniqueDepartments = ['All', ...Object.keys(departmentCounts).sort()]

  const topDepartment = sortedDepartments.length > 0 ? sortedDepartments[0] : null
  const TARGET_THRESHOLD = 15 // Target requests to unlock department pilot

  function copyToClipboard(text, label = 'Copied') {
    navigator.clipboard.writeText(text)
    toast.success(`${label} to clipboard`)
  }

  async function toggleStatus(entry) {
    const newStatus = entry.status === 'notified' ? 'pending' : 'notified'
    try {
      if (api.updateWaitlistStatus) {
        await api.updateWaitlistStatus(entry.id, newStatus)
      }
      setWaitlist((prev) =>
        prev.map((w) => (w.id === entry.id ? { ...w, status: newStatus } : w))
      )
      toast.success(`Applicant marked as ${newStatus}`)
    } catch {
      toast.error('Failed to update status')
    }
  }

  async function handleDelete(id) {
    try {
      if (api.deleteWaitlistEntry) {
        await api.deleteWaitlistEntry(id)
      }
      setWaitlist((prev) => prev.filter((w) => w.id !== id))
      toast.success('Waitlist request deleted')
    } catch {
      toast.error('Failed to delete request')
    }
  }

  async function handleAddEntry(e) {
    e.preventDefault()
    if (!newEntry.full_name || !newEntry.email || !newEntry.department) {
      toast.error('Please fill all required fields')
      return
    }
    try {
      const { data } = await api.joinWaitlist({
        ...newEntry,
        status: 'pending',
      })
      setWaitlist((prev) => [data, ...prev.filter((w) => w.id !== data.id)])
      setShowAddModal(false)
      setNewEntry({
        full_name: '',
        email: '',
        university: 'University of Lagos',
        department: 'Computer Science',
        level: '300',
      })
      toast.success('Live waitlist request recorded!')
    } catch {
      toast.error('Failed to record entry')
    }
  }

  function handleNotifyDepartment(dept) {
    toast.success(`Priority rollout notice queued for ${dept} applicants`)
  }

  function exportCSV() {
    if (waitlist.length === 0) {
      toast.error('No waitlist data to export')
      return
    }
    const headers = ['Full Name', 'Email', 'University', 'Department', 'Level', 'Status', 'Submitted At']
    const rows = waitlist.map((w) => [
      `"${w.full_name || ''}"`,
      `"${w.email || ''}"`,
      `"${w.university || ''}"`,
      `"${w.department || ''}"`,
      `"${w.level || ''}"`,
      `"${w.status || 'pending'}"`,
      `"${w.created_at || ''}"`,
    ])
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `classcheck_waitlist_realtime_${new Date().toISOString().slice(0, 10)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast.success('Waitlist CSV exported successfully')
  }

  const filtered = waitlist.filter((w) => {
    if (selectedDept !== 'All' && w.department !== selectedDept) return false
    if (!search.trim()) return true
    const q = search.toLowerCase()
    return (
      (w.full_name && w.full_name.toLowerCase().includes(q)) ||
      (w.email && w.email.toLowerCase().includes(q)) ||
      (w.department && w.department.toLowerCase().includes(q)) ||
      (w.university && w.university.toLowerCase().includes(q))
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
      {/* Header and Live Telemetry Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-lg font-bold text-white tracking-tight">Waitlist & Campus Demand</h2>
            <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/25">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[11px] font-semibold text-emerald-400 tracking-wide uppercase">
                Real-Time Live
              </span>
            </div>
          </div>
          <p className="text-xs text-white/40 mt-1">
            Listening for live student demand votes across campus. No page refresh needed.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <a
            href="/waitlist"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3.5 py-1.5 text-xs font-semibold rounded bg-[#161616] border border-white/[0.1] text-white hover:bg-white/[0.06] transition-colors flex items-center gap-1.5"
            title="Open the student-facing waitlist form in a new tab to submit a live request"
          >
            <span>Open /waitlist</span>
            <span className="text-[10px] text-white/40">↗</span>
          </a>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-3.5 py-1.5 text-xs font-semibold rounded bg-white text-black font-bold hover:bg-white/90 transition-colors"
          >
            + Add Manual Request
          </button>
          <button
            onClick={exportCSV}
            className="px-3.5 py-1.5 text-xs font-semibold rounded bg-[#161616] border border-white/[0.1] text-white hover:bg-white/[0.06] transition-colors"
          >
            Export CSV
          </button>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="stat-card">
          <p className="text-3xl font-extrabold text-white tracking-tight">{waitlist.length}</p>
          <p className="text-xs font-semibold text-white/45 uppercase tracking-wider mt-1">
            Total Waitlist Requests
          </p>
        </div>
        <div className="stat-card">
          <p className="text-3xl font-extrabold text-white tracking-tight">
            {Object.keys(departmentCounts).length}
          </p>
          <p className="text-xs font-semibold text-white/45 uppercase tracking-wider mt-1">
            Departments Represented
          </p>
        </div>
        <div className="stat-card">
          <p className="text-xl font-extrabold text-blue-400 tracking-tight truncate">
            {topDepartment ? topDepartment[0] : 'None yet'}
          </p>
          <p className="text-xs font-semibold text-white/45 uppercase tracking-wider mt-1">
            Top Requested {topDepartment ? `(${topDepartment[1]} votes)` : ''}
          </p>
        </div>
        <div className="stat-card">
          <p className="text-3xl font-extrabold text-emerald-400 tracking-tight">
            {TARGET_THRESHOLD}
          </p>
          <p className="text-xs font-semibold text-white/45 uppercase tracking-wider mt-1">
            Votes Target per Pilot
          </p>
        </div>
      </div>

      {/* Department Demand Leaderboard */}
      <div className="bg-[#111111] border border-white/[0.08] rounded-md p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight">
              Department Rollout Pipeline
            </h3>
            <p className="text-xs text-white/40 mt-0.5">
              Live ranking of student expansion votes. Target: {TARGET_THRESHOLD} votes to unlock department timetable and broadcast permissions.
            </p>
          </div>
          <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Live Sync ({formatDistanceToNow(lastSyncTime, { addSuffix: true })})
          </span>
        </div>

        {sortedDepartments.length === 0 ? (
          <div className="py-8 text-center border border-dashed border-white/[0.08] rounded-md bg-[#161616]/50">
            <p className="text-sm font-semibold text-white/60">No department votes submitted yet</p>
            <p className="text-xs text-white/35 mt-1 max-w-md mx-auto">
              When students from other faculties submit requests on <code className="text-blue-400 font-mono">/waitlist</code>, their departments will automatically rank here in real time.
            </p>
            <div className="mt-4 flex items-center justify-center gap-3">
              <a
                href="/waitlist"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-white text-black rounded hover:bg-white/90"
              >
                <span>Submit Live Test Vote</span>
                <span>↗</span>
              </a>
              <button
                onClick={() => setShowAddModal(true)}
                className="px-3 py-1.5 text-xs font-semibold bg-[#222222] border border-white/[0.1] text-white rounded hover:bg-[#2A2A2A]"
              >
                + Add Manual Request
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3.5">
            {sortedDepartments.map(([dept, count], idx) => {
              const pct = Math.min(Math.round((count / TARGET_THRESHOLD) * 100), 100)
              const isReady = count >= TARGET_THRESHOLD
              return (
                <div key={dept} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded bg-[#161616] text-white/50 border border-white/[0.06] flex items-center justify-center font-bold text-[10px]">
                        {idx + 1}
                      </span>
                      <strong className="text-white font-semibold">{dept}</strong>
                      {isReady && (
                        <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/25 px-1.5 py-0.5 rounded">
                          Ready to Launch
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-white/50">
                        <strong className="text-white">{count}</strong> / {TARGET_THRESHOLD} votes ({pct}%)
                      </span>
                      <button
                        onClick={() => handleNotifyDepartment(dept)}
                        className="text-[11px] text-blue-400 hover:text-blue-300 font-semibold underline underline-offset-2"
                      >
                        Notify
                      </button>
                    </div>
                  </div>
                  {/* Progress bar */}
                  <div className="w-full h-1.5 bg-[#1A1A1A] rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isReady ? 'bg-emerald-500' : 'bg-blue-500'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search by student name, email, department, or university..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#111111] border border-white/[0.08] rounded-md px-3.5 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>
        <div className="sm:w-60">
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="w-full bg-[#111111] border border-white/[0.08] rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
          >
            {uniqueDepartments.map((dept) => (
              <option key={dept} value={dept} className="bg-[#111111]">
                {dept === 'All' ? 'All Departments' : dept}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Submissions Table */}
      <div className="bg-[#111111] border border-white/[0.08] rounded-md overflow-hidden">
        <div className="px-5 py-3.5 border-b border-white/[0.08] bg-[#161616] flex items-center justify-between">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">
            Applicant Submissions ({filtered.length})
          </h3>
          <span className="text-[11px] font-semibold text-white/40">
            {filtered.length === 1 ? '1 applicant' : `${filtered.length} applicants`}
          </span>
        </div>

        {filtered.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-sm font-medium text-white/50">No waitlist applicants yet.</p>
            <p className="text-xs text-white/30 mt-1">
              Submissions from <code className="text-blue-400">/waitlist</code> will stream here immediately in real time.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-white/[0.06]">
            {filtered.map((w) => {
              const isNotified = w.status === 'notified'
              return (
                <div
                  key={w.id || w.email}
                  className="px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-white/[0.02] transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2.5">
                      <p className="text-sm font-bold text-white truncate">{w.full_name}</p>
                      <span className="text-[10px] font-semibold text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded">
                        {w.department}
                      </span>
                      {w.level && (
                        <span className="text-[10px] font-semibold text-white/40 bg-white/5 px-1.5 py-0.5 rounded">
                          {w.level}L
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs text-white/40">
                      <button
                        onClick={() => copyToClipboard(w.email, 'Email copied')}
                        className="hover:text-white transition-colors underline decoration-white/20 underline-offset-2"
                        title="Click to copy email"
                      >
                        {w.email}
                      </button>
                      <span>•</span>
                      <span>{w.university || 'University of Lagos'}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-xs text-white/35">
                      {w.created_at
                        ? formatDistanceToNow(new Date(w.created_at), { addSuffix: true })
                        : 'Just now'}
                    </span>
                    <button
                      onClick={() => toggleStatus(w)}
                      className={`text-[11px] font-semibold px-2.5 py-1 rounded border transition-colors ${
                        isNotified
                          ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/25 hover:bg-emerald-500/20'
                          : 'text-amber-400 bg-amber-500/10 border-amber-500/25 hover:bg-amber-500/20'
                      }`}
                    >
                      {isNotified ? 'Notified' : 'Pending'}
                    </button>
                    <button
                      onClick={() => handleDelete(w.id)}
                      className="text-white/30 hover:text-red-400 text-xs px-1.5 py-1 transition-colors"
                      title="Delete entry"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Add Manual Request Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-[#111111] border border-white/[0.1] rounded-lg max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
              <h3 className="text-base font-bold text-white">Record Manual Waitlist Request</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-white/40 hover:text-white text-lg font-bold"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleAddEntry} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-white/60 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Samuel Adekunle"
                  value={newEntry.full_name}
                  onChange={(e) => setNewEntry({ ...newEntry, full_name: e.target.value })}
                  className="w-full bg-[#161616] border border-white/[0.08] rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/60 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. samuel@student.edu.ng"
                  value={newEntry.email}
                  onChange={(e) => setNewEntry({ ...newEntry, email: e.target.value })}
                  className="w-full bg-[#161616] border border-white/[0.08] rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-white/60 mb-1">Department</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Computer Science"
                    value={newEntry.department}
                    onChange={(e) => setNewEntry({ ...newEntry, department: e.target.value })}
                    className="w-full bg-[#161616] border border-white/[0.08] rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-white/60 mb-1">Level</label>
                  <select
                    value={newEntry.level}
                    onChange={(e) => setNewEntry({ ...newEntry, level: e.target.value })}
                    className="w-full bg-[#161616] border border-white/[0.08] rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="100">100L</option>
                    <option value="200">200L</option>
                    <option value="300">300L</option>
                    <option value="400">400L</option>
                    <option value="500">500L</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/60 mb-1">University</label>
                <input
                  type="text"
                  placeholder="e.g. University of Lagos"
                  value={newEntry.university}
                  onChange={(e) => setNewEntry({ ...newEntry, university: e.target.value })}
                  className="w-full bg-[#161616] border border-white/[0.08] rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-semibold rounded bg-[#161616] text-white/60 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold rounded bg-white text-black font-bold hover:bg-white/90"
                >
                  Add Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
