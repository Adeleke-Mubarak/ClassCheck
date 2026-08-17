import { useEffect, useState } from 'react'
import { formatDistanceToNow } from 'date-fns'
import toast from 'react-hot-toast'
import SenderNavbar from '../../components/SenderNavbar'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'

export default function History() {
  const { user } = useAuth()
  const [updates, setUpdates] = useState([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(null)

  async function loadUpdates() {
    const { data, error } = await supabase
      .from('updates')
      .select('*, courses(course_code, course_name)')
      .eq('sender_id', user.id)
      .order('created_at', { ascending: false })

    if (!error) setUpdates(data || [])
    setLoading(false)
  }

  useEffect(() => {
    loadUpdates()
  }, [user])

  async function handleDelete(id) {
    setDeleting(id)
    const { error } = await supabase.from('updates').delete().eq('id', id)
    if (error) {
      toast.error('Failed to delete update')
    } else {
      setUpdates((prev) => prev.filter((u) => u.id !== id))
      toast.success('Update deleted')
    }
    setDeleting(null)
  }

  return (
    <div className="page-container">
      <SenderNavbar />
      <div className="feed-container">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">My history</h1>
          <p className="text-sm text-gray-500 mt-1">All updates you have posted</p>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white border border-gray-200 rounded-xl p-5 animate-pulse">
                <div className="h-4 bg-gray-100 rounded w-1/4 mb-3" />
                <div className="h-6 bg-gray-100 rounded w-1/3 mb-2" />
                <div className="h-3 bg-gray-100 rounded w-3/4" />
              </div>
            ))}
          </div>
        ) : updates.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-xl p-10 text-center">
            <p className="text-base font-medium text-gray-900">No updates yet</p>
            <p className="text-sm text-gray-500 mt-1">
              Updates you post will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {updates.map((update) => (
              <div
                key={update.id}
                className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-sm text-gray-900">
                        {update.courses?.course_code}
                      </span>
                      <span className="text-gray-300 text-sm">·</span>
                      <span className="text-sm text-gray-500">{update.courses?.course_name}</span>
                    </div>
                    <div className="mt-2">
                      {update.type === 'cancelled' ? (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-red-50 text-red-700 border border-red-200">
                          Class cancelled
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                          Venue change
                        </span>
                      )}
                    </div>
                    {update.new_venue && (
                      <p className="mt-2 text-sm text-gray-700">
                        New venue: <span className="font-medium">{update.new_venue}</span>
                      </p>
                    )}
                    {update.note && (
                      <p className="mt-1.5 text-sm text-gray-600">{update.note}</p>
                    )}
                    <p className="mt-3 text-xs text-gray-400">
                      {formatDistanceToNow(new Date(update.created_at), { addSuffix: true })}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDelete(update.id)}
                    disabled={deleting === update.id}
                    className="shrink-0 px-3 py-1.5 text-xs font-medium text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
                  >
                    {deleting === update.id ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
