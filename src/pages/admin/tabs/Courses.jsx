import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import AddCourseModal from '../../../components/AddCourseModal'
import { supabase } from '../../../lib/supabase'

export default function Courses() {
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [removing, setRemoving] = useState(null)

  async function load() {
    const { data } = await supabase
      .from('courses')
      .select(`
        *,
        sender_courses(sender_id, senders(full_name)),
        updates(id)
      `)
      .order('course_code')
    setCourses(data || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function remove(id) {
    setRemoving(id)
    const { error } = await supabase.from('courses').delete().eq('id', id)
    if (error) {
      toast.error('Failed to remove course')
    } else {
      setCourses((prev) => prev.filter((c) => c.id !== id))
      toast.success('Course removed')
    }
    setRemoving(null)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-semibold text-gray-900">Courses</h2>
        <button
          onClick={() => setModalOpen(true)}
          className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
        >
          + Add course
        </button>
      </div>

      {loading ? (
        <div className="bg-white border border-gray-200 rounded-xl animate-pulse h-48" />
      ) : courses.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-xl p-10 text-center">
          <p className="text-gray-500 text-sm">No courses yet.</p>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Code</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Name</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Dept</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Level</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Senders</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Updates</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {courses.map((course) => {
                  const senderNames = (course.sender_courses || [])
                    .map((sc) => sc.senders?.full_name)
                    .filter(Boolean)
                    .join(', ')
                  return (
                    <tr key={course.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-3.5 font-semibold text-gray-900">{course.course_code}</td>
                      <td className="px-5 py-3.5 text-gray-700">{course.course_name}</td>
                      <td className="px-5 py-3.5 text-gray-500 text-xs">{course.department}</td>
                      <td className="px-5 py-3.5 text-gray-500">{course.level}</td>
                      <td className="px-5 py-3.5 text-gray-500 text-xs max-w-[150px] truncate">
                        {senderNames || '—'}
                      </td>
                      <td className="px-5 py-3.5 text-gray-500">
                        {(course.updates || []).length}
                      </td>
                      <td className="px-5 py-3.5">
                        <button
                          onClick={() => remove(course.id)}
                          disabled={removing === course.id}
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

      <AddCourseModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onAdded={load}
      />
    </div>
  )
}
