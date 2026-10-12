import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import AddCourseModal from '../../../components/AddCourseModal'
import { api } from '../../../lib/api'

export default function Courses() {
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [removing, setRemoving] = useState(null)

  async function load() {
    try {
      const { data } = await api.getCourses()
      setCourses(data || [])
    } catch (error) {
      toast.error('Failed to load courses')
    }
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function remove(id) {
    setRemoving(id)
    try {
      await api.deleteCourse(id)
      setCourses((prev) => prev.filter((c) => c.id !== id))
      toast.success('Course removed')
    } catch (error) {
      toast.error('Failed to remove course')
    }
    setRemoving(null)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-lg font-bold text-white tracking-tight">Courses</h2>
          <p className="text-xs text-white/40 mt-0.5">Directory of tracked academic courses</p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="btn-primary text-xs sm:text-sm px-4 py-2 rounded-md"
        >
          + Add course
        </button>
      </div>

      {loading ? (
        <div className="bg-[#111111] border border-white/[0.08] rounded-md animate-pulse h-48" />
      ) : courses.length === 0 ? (
        <div className="bg-[#111111] border border-white/[0.08] rounded-md p-10 text-center">
          <p className="text-white/40 text-sm">No courses yet.</p>
        </div>
      ) : (
        <div className="bg-[#111111] border border-white/[0.08] rounded-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/[0.08] bg-[#161616]">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-white/40 uppercase tracking-wider">Code</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-white/40 uppercase tracking-wider">Name</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-white/40 uppercase tracking-wider">Dept</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-white/40 uppercase tracking-wider">Level</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-white/40 uppercase tracking-wider">Senders</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-white/40 uppercase tracking-wider">Updates</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.06]">
                {courses.map((course) => {
                  const senderNames = (course.sender_courses || [])
                    .map((sc) => sc.senders?.full_name)
                    .filter(Boolean)
                    .join(', ')
                  return (
                    <tr key={course.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-5 py-3.5 font-bold text-white">{course.course_code}</td>
                      <td className="px-5 py-3.5 text-white/80">{course.course_name}</td>
                      <td className="px-5 py-3.5 text-white/45 text-xs">{course.department}</td>
                      <td className="px-5 py-3.5 text-white/60">{course.level}L</td>
                      <td className="px-5 py-3.5 text-white/45 text-xs max-w-[150px] truncate">
                        {senderNames || '—'}
                      </td>
                      <td className="px-5 py-3.5 text-white/50">
                        {(course.updates || []).length}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <button
                          onClick={() => remove(course.id)}
                          disabled={removing === course.id}
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

      <AddCourseModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onAdded={load}
      />
    </div>
  )
}
