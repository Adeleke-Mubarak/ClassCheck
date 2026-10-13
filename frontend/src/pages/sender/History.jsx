import { useEffect, useState, useCallback } from 'react'
import { formatDistanceToNow } from 'date-fns'
import toast from 'react-hot-toast'
import SenderNavbar from '../../components/SenderNavbar'
import { api } from '../../lib/api'
import { useAuth } from '../../context/AuthContext'

export default function History() {
  const { user } = useAuth()
  const [updates, setUpdates] = useState([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(null)

  const loadUpdates = useCallback(async () => {
    try {
      const { data } = await api.getSenderHistory(user.id)
      setUpdates(data || [])
    } catch {
      toast.error('Failed to load history')
    } finally {
      setLoading(false)
    }
  }, [user?.id])

  useEffect(() => {
    if (user?.id) loadUpdates()

    let bc = null
    try {
      if (typeof window !== 'undefined' && window.BroadcastChannel) {
        bc = new BroadcastChannel('classcheck_realtime')
        bc.onmessage = (event) => {
          if (event.data?.type === 'NEW_UPDATE' || event.data?.type === 'DELETE_UPDATE') {
            loadUpdates()
          }
        }
      }
    } catch {}

    const handleStorage = (e) => {
      if (e.key === 'classcheck_dev_updates') {
        loadUpdates()
      }
    }
    window.addEventListener('storage', handleStorage)

    // 3.5s real-time heartbeat
    const interval = setInterval(loadUpdates, 3500)

    return () => {
      if (bc) bc.close()
      window.removeEventListener('storage', handleStorage)
      clearInterval(interval)
    }
  }, [user?.id, loadUpdates])

  async function handleDelete(id) {
    setDeleting(id)
    try {
      await api.deleteUpdate(id)
      setUpdates((prev) => prev.filter((u) => u.id !== id))
      toast.success('Update deleted')
    } catch (error) {
      toast.error('Failed to delete update')
    }
    setDeleting(null)
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white pt-20 pb-12 px-4">
      <SenderNavbar />
      <div className="max-w-[560px] mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-extrabold text-white tracking-tight">My history</h1>
          <p className="text-sm text-white/50 mt-1">Broadcasts dispatched from your account</p>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-[#111111] border border-white/[0.08] rounded-md p-5 animate-pulse">
                <div className="h-4 bg-white/5 rounded w-1/4 mb-3" />
                <div className="h-6 bg-white/5 rounded w-1/3 mb-2" />
                <div className="h-3 bg-white/5 rounded w-3/4" />
              </div>
            ))}
          </div>
        ) : updates.length === 0 ? (
          <div className="bg-[#111111] border border-white/[0.08] rounded-md p-10 text-center">
            <p className="text-base font-semibold text-white">No updates yet</p>
            <p className="text-sm text-white/40 mt-1">
              Broadcasts you post will be listed here.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {updates.map((update) => (
              <div
                key={update.id}
                className="bg-[#111111] border border-white/[0.08] rounded-md p-5"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-sm text-white">
                        {update.courses?.course_code}
                      </span>
                      <span className="text-white/20 text-sm">·</span>
                      <span className="text-sm text-white/50">{update.courses?.course_name}</span>
                    </div>
                    <div className="mt-2.5">
                      {update.type === 'cancelled' ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-red-500/10 text-red-400 border border-red-500/25">
                          Class cancelled
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/25">
                          Venue change
                        </span>
                      )}
                    </div>
                    {update.new_venue && (
                      <p className="mt-2 text-sm text-white/80">
                        New venue: <span className="font-semibold text-white">{update.new_venue}</span>
                      </p>
                    )}
                    {update.note && (
                      <p className="mt-1.5 text-sm text-white/60">{update.note}</p>
                    )}
                    <p className="mt-3 text-xs text-white/35">
                      {formatDistanceToNow(new Date(update.created_at), { addSuffix: true })}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDelete(update.id)}
                    disabled={deleting === update.id}
                    className="shrink-0 px-2.5 py-1 text-xs font-semibold text-red-400 border border-red-500/25 bg-red-500/5 rounded hover:bg-red-500/15 transition-colors disabled:opacity-50"
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
