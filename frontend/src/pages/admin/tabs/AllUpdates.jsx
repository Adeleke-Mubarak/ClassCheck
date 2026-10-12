import { useEffect, useState } from 'react'
import { formatDistanceToNow } from 'date-fns'
import toast from 'react-hot-toast'
import { api } from '../../../lib/api'

const TYPE_FILTERS = ['All', 'Cancelled', 'Venue change']

export default function AllUpdates() {
  const [updates, setUpdates] = useState([])
  const [loading, setLoading] = useState(true)
  const [typeFilter, setTypeFilter] = useState('All')
  const [courseFilter, setCourseFilter] = useState('')
  const [courses, setCourses] = useState([])
  const [deleting, setDeleting] = useState(null)

  async function load() {
    try {
      const [{ data: upd }, { data: crs }] = await Promise.all([
        api.getAllUpdates(),
        api.getCourses(),
      ])
      setUpdates(upd || [])
      setCourses(crs || [])
    } catch (error) {
      toast.error('Failed to load data')
    }
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function handleDelete(id) {
    setDeleting(id)
    try {
      await api.deleteUpdate(id)
      setUpdates((prev) => prev.filter((u) => u.id !== id))
      toast.success('Update deleted')
    } catch (error) {
      toast.error('Failed to delete')
    }
    setDeleting(null)
  }

  const filtered = updates.filter((u) => {
    if (typeFilter === 'Cancelled' && u.type !== 'cancelled') return false
    if (typeFilter === 'Venue change' && u.type !== 'venue_change') return false
    if (courseFilter && u.course_id !== courseFilter) return false
    return true
  })

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
        <div>
          <h2 className="text-lg font-bold text-white tracking-tight">All updates</h2>
          <p className="text-xs text-white/40 mt-0.5">Audit log of all sent course broadcasts</p>
        </div>
        <div className="flex gap-2.5">
          {/* Course filter */}
          <select
            value={courseFilter}
            onChange={(e) => setCourseFilter(e.target.value)}
            className="text-xs sm:text-sm border border-white/[0.08] rounded-md px-3 py-1.5 bg-[#161616] text-white focus:outline-none focus:border-blue-500"
          >
            <option value="" className="bg-[#161616] text-white/50">All courses</option>
            {courses.map((c) => (
              <option key={c.id} value={c.id} className="bg-[#161616] text-white">{c.course_code}</option>
            ))}
          </select>
          {/* Type filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="text-xs sm:text-sm border border-white/[0.08] rounded-md px-3 py-1.5 bg-[#161616] text-white focus:outline-none focus:border-blue-500"
          >
            {TYPE_FILTERS.map((f) => (
              <option key={f} value={f} className="bg-[#161616] text-white">{f}</option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="bg-[#111111] border border-white/[0.08] rounded-md animate-pulse h-48" />
      ) : filtered.length === 0 ? (
        <div className="bg-[#111111] border border-white/[0.08] rounded-md p-10 text-center">
          <p className="text-white/40 text-sm">No updates found</p>
        </div>
      ) : (
        <div className="bg-[#111111] border border-white/[0.08] rounded-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/[0.08] bg-[#161616]">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-white/40 uppercase tracking-wider">Course</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-white/40 uppercase tracking-wider">Type</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-white/40 uppercase tracking-wider">Note</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-white/40 uppercase tracking-wider">Posted by</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-white/40 uppercase tracking-wider">When</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.06]">
                {filtered.map((u) => (
                  <tr key={u.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-5 py-3.5 font-bold text-white">{u.courses?.course_code}</td>
                    <td className="px-5 py-3.5">
                      {u.type === 'cancelled' ? (
                        <span className="text-[11px] font-semibold text-red-400 bg-red-500/10 border border-red-500/25 px-2 py-0.5 rounded">
                          Cancelled
                        </span>
                      ) : (
                        <span className="text-[11px] font-semibold text-amber-400 bg-amber-500/10 border border-amber-500/25 px-2 py-0.5 rounded">
                          Venue change
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-white/70 max-w-[200px] truncate">
                      {u.new_venue ? `Venue: ${u.new_venue}` : (u.note || '—')}
                    </td>
                    <td className="px-5 py-3.5 text-white">
                      <div className="font-semibold text-sm">{u.senders?.full_name}</div>
                      <div className="text-xs text-white/40 capitalize">
                        {u.senders?.role === 'class_rep' ? 'Class rep' : 'Lecturer'}
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-white/35 text-xs whitespace-nowrap">
                      {formatDistanceToNow(new Date(u.created_at), { addSuffix: true })}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <button
                        onClick={() => handleDelete(u.id)}
                        disabled={deleting === u.id}
                        className="text-xs font-semibold text-red-400 hover:text-red-300 disabled:opacity-50 transition-colors"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
