import { useEffect, useState } from 'react'
import { formatDistanceToNow } from 'date-fns'
import toast from 'react-hot-toast'
import { api } from '../../../lib/api'

export default function Overview() {
  const [stats, setStats] = useState({ students: 0, senders: 0, todayUpdates: 0, courses: 0 })
  const [recentUpdates, setRecentUpdates] = useState([])
  const [senders, setSenders] = useState([])
  const [loading, setLoading] = useState(true)

  async function load() {
    try {
      const { data } = await api.getOverviewMetrics()
      setStats({
        students: data?.students || 0,
        senders: data?.senders || 0,
        todayUpdates: data?.updates || data?.todayUpdates || 0,
        courses: data?.courses || 0,
      })
      setRecentUpdates(data?.recentUpdates || [])
      setSenders(data?.recentSenders || data?.senderList || [])
    } catch (error) {
      toast.error('Failed to load overview')
    }
    setLoading(false)
  }

  useEffect(() => {
    load()

    let channel = null
    if (typeof window !== 'undefined' && window.BroadcastChannel) {
      try {
        channel = new BroadcastChannel('classcheck_realtime')
        channel.onmessage = () => { load() }
      } catch {}
    }

    const handleStorage = (e) => {
      if (e.key && e.key.startsWith('classcheck_')) {
        load()
      }
    }
    window.addEventListener('storage', handleStorage)

    const interval = setInterval(load, 3000)

    return () => {
      if (channel) channel.close()
      window.removeEventListener('storage', handleStorage)
      clearInterval(interval)
    }
  }, [])

  async function toggleSenderStatus(sender) {
    const newStatus = sender.status === 'active' ? 'inactive' : 'active'
    try {
      await api.updateSenderStatus(sender.id, newStatus)
      setSenders((prev) => prev.map((s) => s.id === sender.id ? { ...s, status: newStatus } : s))
      toast.success(`Sender ${newStatus === 'active' ? 'activated' : 'deactivated'}`)
    } catch (error) {
      toast.error('Failed to update status')
    }
  }

  const STAT_CARDS = [
    { label: 'Total students', value: stats.students },
    { label: 'Active senders', value: stats.senders },
    { label: 'Updates today', value: stats.todayUpdates },
    { label: 'Total courses', value: stats.courses },
  ]

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-[#111111] border border-white/[0.08] rounded-md p-5 animate-pulse">
            <div className="h-8 bg-white/5 rounded w-1/2 mb-2" />
            <div className="h-3 bg-white/5 rounded w-3/4" />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {STAT_CARDS.map((card) => (
          <div key={card.label} className="stat-card">
            <p className="text-3xl font-extrabold text-white tracking-tight">{card.value}</p>
            <p className="text-xs font-semibold text-white/45 uppercase tracking-wider mt-1">{card.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent updates */}
        <div className="bg-[#111111] border border-white/[0.08] rounded-md overflow-hidden">
          <div className="px-5 py-4 border-b border-white/[0.08] bg-[#161616]">
            <h2 className="text-sm font-bold text-white tracking-tight">Recent updates</h2>
          </div>
          {recentUpdates.length === 0 ? (
            <p className="text-sm text-white/40 p-5">No updates yet</p>
          ) : (
            <div className="divide-y divide-white/[0.06]">
              {recentUpdates.map((u) => (
                <div key={u.id} className="px-5 py-3.5 flex items-center justify-between gap-4 hover:bg-white/[0.02] transition-colors">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-white">{u.courses?.course_code}</p>
                    <p className="text-xs text-white/40 mt-0.5">{u.senders?.full_name}</p>
                  </div>
                  <div className="flex items-center gap-2.5 shrink-0">
                    {u.type === 'cancelled' ? (
                      <span className="text-[11px] font-semibold text-red-400 bg-red-500/10 border border-red-500/25 px-2 py-0.5 rounded">
                        Cancelled
                      </span>
                    ) : (
                      <span className="text-[11px] font-semibold text-amber-400 bg-amber-500/10 border border-amber-500/25 px-2 py-0.5 rounded">
                        Venue
                      </span>
                    )}
                    <span className="text-xs text-white/35">
                      {formatDistanceToNow(new Date(u.created_at), { addSuffix: true })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Senders quick list */}
        <div className="bg-[#111111] border border-white/[0.08] rounded-md overflow-hidden">
          <div className="px-5 py-4 border-b border-white/[0.08] bg-[#161616]">
            <h2 className="text-sm font-bold text-white tracking-tight">Senders</h2>
          </div>
          {senders.length === 0 ? (
            <p className="text-sm text-white/40 p-5">No senders yet</p>
          ) : (
            <div className="divide-y divide-white/[0.06]">
              {senders.map((s) => (
                <div key={s.id} className="px-5 py-3.5 flex items-center justify-between gap-4 hover:bg-white/[0.02] transition-colors">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white truncate">{s.full_name}</p>
                    <p className="text-xs text-white/40 capitalize mt-0.5">
                      {s.role === 'class_rep' ? 'Class rep' : 'Lecturer'}
                    </p>
                  </div>
                  <button
                    onClick={() => toggleSenderStatus(s)}
                    className={`text-[11px] font-semibold px-2.5 py-1 rounded border transition-colors ${
                      s.status === 'active'
                        ? 'text-green-400 bg-green-500/10 border-green-500/25 hover:bg-green-500/20'
                        : 'text-white/40 bg-white/5 border-white/10 hover:bg-white/10'
                    }`}
                  >
                    {s.status === 'active' ? 'Active' : 'Inactive'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
