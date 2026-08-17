import { useEffect, useState } from 'react'
import { formatDistanceToNow } from 'date-fns'
import toast from 'react-hot-toast'
import { supabase } from '../../../lib/supabase'

export default function Overview() {
  const [stats, setStats] = useState({ students: 0, senders: 0, todayUpdates: 0, courses: 0 })
  const [recentUpdates, setRecentUpdates] = useState([])
  const [senders, setSenders] = useState([])
  const [loading, setLoading] = useState(true)

  async function load() {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const [
      { count: students },
      { count: activeSenders },
      { count: todayUpdates },
      { count: courses },
      { data: updates },
      { data: senderList },
    ] = await Promise.all([
      supabase.from('students').select('*', { count: 'exact', head: true }),
      supabase.from('senders').select('*', { count: 'exact', head: true }).eq('status', 'active'),
      supabase.from('updates').select('*', { count: 'exact', head: true }).gte('created_at', today.toISOString()),
      supabase.from('courses').select('*', { count: 'exact', head: true }),
      supabase.from('updates').select('*, courses(course_code), senders(full_name, role)').order('created_at', { ascending: false }).limit(5),
      supabase.from('senders').select('*').order('created_at', { ascending: false }).limit(8),
    ])

    setStats({
      students: students || 0,
      senders: activeSenders || 0,
      todayUpdates: todayUpdates || 0,
      courses: courses || 0,
    })
    setRecentUpdates(updates || [])
    setSenders(senderList || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function toggleSenderStatus(sender) {
    const newStatus = sender.status === 'active' ? 'inactive' : 'active'
    const { error } = await supabase.from('senders').update({ status: newStatus }).eq('id', sender.id)
    if (error) {
      toast.error('Failed to update status')
    } else {
      setSenders((prev) => prev.map((s) => s.id === sender.id ? { ...s, status: newStatus } : s))
      toast.success(`Sender ${newStatus === 'active' ? 'activated' : 'deactivated'}`)
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
          <div key={i} className="stat-card animate-pulse">
            <div className="h-8 bg-gray-100 rounded w-1/2 mb-2" />
            <div className="h-3 bg-gray-100 rounded w-3/4" />
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
            <p className="text-3xl font-bold text-gray-900">{card.value}</p>
            <p className="text-sm text-gray-500 mt-1">{card.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent updates */}
        <div className="bg-white border border-gray-200 rounded-xl">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="text-sm font-semibold text-gray-900">Recent updates</h2>
          </div>
          {recentUpdates.length === 0 ? (
            <p className="text-sm text-gray-400 p-5">No updates yet</p>
          ) : (
            <div className="divide-y divide-gray-100">
              {recentUpdates.map((u) => (
                <div key={u.id} className="px-5 py-3 flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{u.courses?.course_code}</p>
                    <p className="text-xs text-gray-500">{u.senders?.full_name}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {u.type === 'cancelled' ? (
                      <span className="text-xs font-semibold text-red-600 bg-red-50 px-2 py-0.5 rounded">Cancelled</span>
                    ) : (
                      <span className="text-xs font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded">Venue</span>
                    )}
                    <span className="text-xs text-gray-400">
                      {formatDistanceToNow(new Date(u.created_at), { addSuffix: true })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Senders quick list */}
        <div className="bg-white border border-gray-200 rounded-xl">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="text-sm font-semibold text-gray-900">Senders</h2>
          </div>
          {senders.length === 0 ? (
            <p className="text-sm text-gray-400 p-5">No senders yet</p>
          ) : (
            <div className="divide-y divide-gray-100">
              {senders.map((s) => (
                <div key={s.id} className="px-5 py-3 flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{s.full_name}</p>
                    <p className="text-xs text-gray-500 capitalize">
                      {s.role === 'class_rep' ? 'Class rep' : 'Lecturer'}
                    </p>
                  </div>
                  <button
                    onClick={() => toggleSenderStatus(s)}
                    className={`text-xs font-medium px-2.5 py-1 rounded-full border transition-colors ${
                      s.status === 'active'
                        ? 'text-green-700 bg-green-50 border-green-200 hover:bg-green-100'
                        : 'text-gray-500 bg-gray-50 border-gray-200 hover:bg-gray-100'
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
