import { useEffect, useState } from 'react'
import { formatDistanceToNow } from 'date-fns'
import toast from 'react-hot-toast'
import { supabase } from '../../../lib/supabase'

const TYPE_FILTERS = ['All', 'Cancelled', 'Venue change']

export default function AllUpdates() {
  const [updates, setUpdates] = useState([])
  const [loading, setLoading] = useState(true)
  const [typeFilter, setTypeFilter] = useState('All')
  const [courseFilter, setCourseFilter] = useState('')
  const [courses, setCourses] = useState([])
  const [deleting, setDeleting] = useState(null)

  async function load() {
    const [{ data: upd }, { data: crs }] = await Promise.all([
      supabase
        .from('updates')
        .select('*, courses(course_code, course_name), senders(full_name, role)')
        .order('created_at', { ascending: false }),
      supabase.from('courses').select('id, course_code').order('course_code'),
    ])
    setUpdates(upd || [])
    setCourses(crs || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function handleDelete(id) {
    setDeleting(id)
    const { error } = await supabase.from('updates').delete().eq('id', id)
    if (error) {
      toast.error('Failed to delete')
    } else {
      setUpdates((prev) => prev.filter((u) => u.id !== id))
      toast.success('Update deleted')
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
        <h2 className="text-lg font-semibold text-gray-900">All updates</h2>
        <div className="flex gap-3">
          {/* Course filter */}
          <select
            value={courseFilter}
            onChange={(e) => setCourseFilter(e.target.value)}
            className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-gray-900"
          >
            <option value="">All courses</option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>{c.course_code}</option>
            ))}
          </select>
          {/* Type filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-gray-900"
          >
            {TYPE_FILTERS.map((f) => (
              <option key={f} value={f}>{f}</option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="bg-white border border-gray-200 rounded-xl animate-pulse h-48" />
      ) : filtered.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-xl p-10 text-center">
          <p className="text-gray-500 text-sm">No updates found</p>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Course</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Type</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Note</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Posted by</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">When</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3.5 font-semibold text-gray-900">{u.courses?.course_code}</td>
                    <td className="px-5 py-3.5">
                      {u.type === 'cancelled' ? (
                        <span className="text-xs font-semibold text-red-700 bg-red-50 px-2 py-0.5 rounded border border-red-200">Cancelled</span>
                      ) : (
                        <span className="text-xs font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">Venue change</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-gray-500 max-w-[200px] truncate">
                      {u.new_venue ? `Venue: ${u.new_venue}` : (u.note || '—')}
                    </td>
                    <td className="px-5 py-3.5 text-gray-600">
                      <div>{u.senders?.full_name}</div>
                      <div className="text-xs text-gray-400 capitalize">
                        {u.senders?.role === 'class_rep' ? 'Class rep' : 'Lecturer'}
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-gray-400 text-xs whitespace-nowrap">
                      {formatDistanceToNow(new Date(u.created_at), { addSuffix: true })}
                    </td>
                    <td className="px-5 py-3.5">
                      <button
                        onClick={() => handleDelete(u.id)}
                        disabled={deleting === u.id}
                        className="text-xs text-red-600 hover:underline disabled:opacity-50"
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
