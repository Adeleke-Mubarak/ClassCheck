import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { api } from '../lib/api'
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
      try {
        const { data } = await api.getCourses()
        setCourses(data || [])
      } catch (error) {
        toast.error('Failed to load courses')
      } finally {
        setLoading(false)
      }
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
      // Update subscriptions
      if (selected.size > 0) {
        const courseIds = Array.from(selected)
        await api.updateSubscriptions(user.id, courseIds)
      }

      await refreshProfile()
      navigate('/feed')
    } catch (err) {
      toast.error('Failed to save your courses. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="light-workspace min-h-screen bg-[#0A0A0A] text-white">
      <header className="h-14 border-b border-white/[0.08] bg-[#0A0A0A] flex items-center justify-between px-6">
        <span className="font-extrabold text-base tracking-tight text-white">ClassCheck</span>
        <span className="text-xs font-semibold uppercase tracking-wider text-white/40">Step 2 of 2 · Setup</span>
      </header>

      <div className="max-w-[640px] mx-auto px-4 sm:px-6 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Pick your courses</h1>
          <p className="mt-2 text-sm text-white/50 leading-relaxed">
            Select the courses you are enrolled in this semester. Your feed will only show updates for these courses.
          </p>
        </div>

        {/* Stats bar */}
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/[0.06]">
          <span className="text-xs font-semibold uppercase tracking-wider text-white/40">
            {profile?.department || 'Department'} · {profile?.level ? `${profile.level} Level` : '400 Level'}
          </span>
          <span className="text-xs font-bold text-white bg-white/[0.08] px-2.5 py-1 rounded-[4px] border border-white/10">
            {selected.size} selected
          </span>
        </div>

        {/* Course list */}
        {loading ? (
          <div className="space-y-2.5">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-[#111111] border border-white/[0.08] rounded-[6px] p-4 animate-pulse">
                <div className="h-4 bg-white/10 rounded-[4px] w-1/4 mb-2" />
                <div className="h-3 bg-white/5 rounded-[4px] w-3/5" />
              </div>
            ))}
          </div>
        ) : courses.length === 0 ? (
          <div className="text-center py-14 bg-[#111111] border border-white/[0.08] rounded-[6px] p-6">
            <p className="text-white/60 text-sm font-medium">
              No courses found for your department and level yet.
            </p>
            <p className="text-white/40 text-xs mt-1">
              Your department admin will add courses shortly. You can still continue to your feed.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {courses.map((course) => {
              const isSelected = selected.has(course.id)
              return (
                <button
                  type="button"
                  key={course.id}
                  onClick={() => toggle(course.id)}
                  className={`w-full text-left bg-[#111111] border rounded-[6px] p-4 flex items-center justify-between transition-all ${
                    isSelected
                      ? 'border-white/40 bg-[#161616] ring-1 ring-white/20'
                      : 'border-white/[0.08] hover:border-white/20'
                  }`}
                >
                  <div className="min-w-0 pr-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-white">{course.course_code}</span>
                      {isSelected && (
                        <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-[3px] bg-blue-500/20 text-blue-400 border border-blue-500/30">
                          Enrolled
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-white/50 mt-1 truncate">{course.course_name}</p>
                  </div>

                  {/* Toggle Indicator */}
                  <div
                    className={`relative w-10 h-5.5 rounded-full transition-colors shrink-0 ${
                      isSelected ? 'bg-blue-600' : 'bg-white/10'
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 left-0.5 w-4.5 h-4.5 bg-white rounded-full shadow-sm transition-transform ${
                        isSelected ? 'translate-x-4.5' : 'translate-x-0'
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
            type="button"
            onClick={handleContinue}
            disabled={saving}
            className="btn-primary"
          >
            {saving ? 'Saving courses...' : 'Continue to my feed'}
          </button>
          {selected.size === 0 && (
            <p className="mt-3 text-center text-xs text-white/40">
              You can skip for now and manage courses later under My Courses
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
