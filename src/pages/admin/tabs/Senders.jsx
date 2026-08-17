import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import AddSenderModal from '../../../components/AddSenderModal'
import { supabase } from '../../../lib/supabase'

export default function Senders() {
  const [senders, setSenders] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [removing, setRemoving] = useState(null)

  async function load() {
    const { data } = await supabase
      .from('senders')
      .select(`
        *,
        sender_courses(course_id, courses(course_code))
      `)
      .order('created_at', { ascending: false })
    setSenders(data || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function toggleStatus(sender) {
    const newStatus = sender.status === 'active' ? 'inactive' : 'active'
    const { error } = await supabase.from('senders').update({ status: newStatus }).eq('id', sender.id)
    if (error) {
      toast.error('Failed to update status')
    } else {
      setSenders((prev) => prev.map((s) => s.id === sender.id ? { ...s, status: newStatus } : s))
    }
  }

  async function remove(id) {
    setRemoving(id)
    const { error } = await supabase.from('senders').delete().eq('id', id)
    if (error) {
      toast.error('Failed to remove sender')
    } else {
      setSenders((prev) => prev.filter((s) => s.id !== id))
      toast.success('Sender removed')
    }
    setRemoving(null)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-semibold text-gray-900">Senders</h2>
        <button
          onClick={() => setModalOpen(true)}
          className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
        >
          + Add sender
        </button>
      </div>

      {loading ? (
        <div className="bg-white border border-gray-200 rounded-xl animate-pulse h-48" />
      ) : senders.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-xl p-10 text-center">
          <p className="text-gray-500 text-sm">No senders yet. Add the first one.</p>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Name</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Email</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Role</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Courses</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {senders.map((sender) => {
                  const courseCodes = (sender.sender_courses || [])
                    .map((sc) => sc.courses?.course_code)
                    .filter(Boolean)
                    .join(', ')
                  return (
                    <tr key={sender.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-3.5 font-medium text-gray-900">{sender.full_name}</td>
                      <td className="px-5 py-3.5 text-gray-500">{sender.email}</td>
                      <td className="px-5 py-3.5 text-gray-600 capitalize">
                        {sender.role === 'class_rep' ? 'Class rep' : 'Lecturer'}
                      </td>
                      <td className="px-5 py-3.5 text-gray-500 text-xs max-w-[200px] truncate">
                        {courseCodes || '—'}
                      </td>
                      <td className="px-5 py-3.5">
                        <button
                          onClick={() => toggleStatus(sender)}
                          className={`text-xs font-medium px-2.5 py-1 rounded-full border transition-colors ${
                            sender.status === 'active'
                              ? 'text-green-700 bg-green-50 border-green-200 hover:bg-green-100'
                              : 'text-gray-500 bg-gray-50 border-gray-200 hover:bg-gray-100'
                          }`}
                        >
                          {sender.status === 'active' ? 'Active' : 'Inactive'}
                        </button>
                      </td>
                      <td className="px-5 py-3.5">
                        <button
                          onClick={() => remove(sender.id)}
                          disabled={removing === sender.id}
                          className="text-xs text-red-600 hover:underline disabled:opacity-50"
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
