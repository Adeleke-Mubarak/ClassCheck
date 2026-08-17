import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

export default function Onboarding() {
  const { user, profile, refreshProfile } = useAuth()
  const navigate = useNavigate()
  const [courses, setCourses] = useState([])
  const [selected, setSelected] = useState(new Set())
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    async function load() {
      if (!profile) return
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .order('course_code')

      if (error) {
        toast.error('Failed to load courses')
      } else {
        setCourses(data)
      }
      setLoading(false)
    }
    load()
  }, [profile])

  function toggle(id) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  async function handleContinue() {
    setSaving(true)
    try {
      // Insert subscriptions
      if (selected.size > 0) {
        const rows = Array.from(selected).map((course_id) => ({
          student_id: user.id,
          course_id,
        }))
        const { error } = await supabase.from('student_courses').insert(rows)
        if (error) throw error
      }

      // Mark as onboarded
      const { error: updateError } = await supabase
        .from('students')
        .update({ onboarded: true })
        .eq('id', user.id)
      if (updateError) throw updateError

      await refreshProfile()
      navigate('/feed')
    } catch (err) {
      toast.error('Failed to save your courses. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="h-14 border-b border-gray-200 bg-white flex items-center px-6">
        <span className="font-semibold text-gray-900">ClassCheck</span>
      </header>

      <div className="max-w-[680px] mx-auto px-4 sm:px-6 py-10">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Pick your courses</h1>
          <p className="mt-1.5 text-sm text-gray-500">
            Select the courses you are enrolled in this semester. You can change these anytime.
          </p>
        </div>

        {/* Stats bar */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm text-gray-500">
            {profile?.department} — {profile?.level} Level
          </span>
          <span className="text-sm font-medium text-gray-900">
            {selected.size} course{selected.size !== 1 ? 's' : ''} selected
          </span>
        </div>

        {/* Course list */}
        {loading ? (
          <div className="space-y-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white border border-gray-200 rounded-xl p-4 animate-pulse">
                <div className="h-4 bg-gray-100 rounded w-1/3 mb-2" />
                <div className="h-3 bg-gray-100 rounded w-2/3" />
              </div>
            ))}
          </div>
        ) : courses.length === 0 ? (
          <div className="text-center py-16 bg-white border border-gray-200 rounded-xl">
            <p className="text-gray-500 text-sm">
              No courses found for your department and level. Contact your admin.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {courses.map((course) => {
              const isSelected = selected.has(course.id)
              return (
                <button
                  key={course.id}
                  onClick={() => toggle(course.id)}
                  className={`w-full text-left bg-white border rounded-xl p-4 flex items-center justify-between transition-all ${
                    isSelected
                      ? 'border-gray-900 shadow-sm'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{course.course_code}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{course.course_name}</p>
                  </div>
                  {/* Toggle */}
                  <div
                    className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ${
                      isSelected ? 'bg-gray-900' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${
                        isSelected ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </div>
                </button>
              )
            })}
          </div>
        )}

        <div className="mt-8">
          <button
            onClick={handleContinue}
            disabled={saving}
            className="btn-primary"
          >
            {saving ? 'Saving...' : 'Continue to my feed'}
          </button>
          {selected.size === 0 && (
            <p className="mt-2 text-center text-xs text-gray-400">
              You can skip for now and add courses later
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
