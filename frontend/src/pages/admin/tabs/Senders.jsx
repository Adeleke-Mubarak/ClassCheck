import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import AddSenderModal from '../../../components/AddSenderModal'
import { api } from '../../../lib/api'

export default function Senders() {
  const [senders, setSenders] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [removing, setRemoving] = useState(null)

  async function load() {
    try {
      const { data } = await api.getSenders()
      setSenders(data || [])
    } catch (error) {
      toast.error('Failed to load senders')
    }
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function toggleStatus(sender) {
    const newStatus = sender.status === 'active' ? 'inactive' : 'active'
    try {
      await api.updateSenderStatus(sender.id, newStatus)
      setSenders((prev) => prev.map((s) => s.id === sender.id ? { ...s, status: newStatus } : s))
    } catch (error) {
      toast.error('Failed to update status')
    }
  }

  async function remove(id) {
    setRemoving(id)
    try {
      await api.deleteSender(id)
      setSenders((prev) => prev.filter((s) => s.id !== id))
      toast.success('Sender removed')
    } catch (error) {
      toast.error('Failed to remove sender')
    }
    setRemoving(null)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-lg font-bold text-white tracking-tight">Senders</h2>
          <p className="text-xs text-white/40 mt-0.5">Faculty and reps authorized to issue broadcasts</p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="btn-primary text-xs sm:text-sm px-4 py-2 rounded-md"
        >
          + Add sender
        </button>
      </div>

      {loading ? (
        <div className="bg-[#111111] border border-white/[0.08] rounded-md animate-pulse h-48" />
      ) : senders.length === 0 ? (
        <div className="bg-[#111111] border border-white/[0.08] rounded-md p-10 text-center">
          <p className="text-white/40 text-sm">No senders yet. Add the first one.</p>
        </div>
      ) : (
        <div className="bg-[#111111] border border-white/[0.08] rounded-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/[0.08] bg-[#161616]">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-white/40 uppercase tracking-wider">Name</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-white/40 uppercase tracking-wider">Email</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-white/40 uppercase tracking-wider">Role</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-white/40 uppercase tracking-wider">Courses</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-white/40 uppercase tracking-wider">Status</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.06]">
                {senders.map((sender) => {
                  const courseCodes = (sender.sender_courses || [])
                    .map((sc) => sc.courses?.course_code)
                    .filter(Boolean)
                    .join(', ')
                  return (
                    <tr key={sender.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-5 py-3.5 font-semibold text-white">{sender.full_name}</td>
                      <td className="px-5 py-3.5 text-white/60">{sender.email}</td>
                      <td className="px-5 py-3.5 text-white/50 capitalize">
                        {sender.role === 'class_rep' ? 'Class rep' : 'Lecturer'}
                      </td>
                      <td className="px-5 py-3.5 text-white/40 text-xs max-w-[200px] truncate">
                        {courseCodes || '—'}
                      </td>
                      <td className="px-5 py-3.5">
                        <button
                          onClick={() => toggleStatus(sender)}
                          className={`text-[11px] font-semibold px-2.5 py-1 rounded border transition-colors ${
                            sender.status === 'active'
                              ? 'text-green-400 bg-green-500/10 border-green-500/25 hover:bg-green-500/20'
                              : 'text-white/40 bg-white/5 border-white/10 hover:bg-white/10'
                          }`}
                        >
                          {sender.status === 'active' ? 'Active' : 'Inactive'}
                        </button>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <button
                          onClick={() => remove(sender.id)}
                          disabled={removing === sender.id}
                          className="text-xs font-semibold text-red-400 hover:text-red-300 disabled:opacity-50 transition-colors"
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <AddSenderModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onAdded={load}
      />
    </div>
  )
}
