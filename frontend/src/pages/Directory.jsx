import { useState, useEffect, useMemo, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import { api } from '../lib/api'
import Navbar from '../components/Navbar'
import SenderNavbar from '../components/SenderNavbar'
import AdminNavbar from '../components/AdminNavbar'
import toast from 'react-hot-toast'

const ROLE_TABS = [
  { key: 'all', label: 'All Faculty & Reps' },
  { key: 'class_rep', label: 'Course Reps' },
  { key: 'lecturer', label: 'Lecturers' },
  { key: 'hod', label: 'Head of Department' },
  { key: 'my_facilitators', label: 'My Facilitators' },
]

export default function Directory() {
  const { user, profile } = useAuth()

  const [activeTab, setActiveTab] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [directoryList, setDirectoryList] = useState([])
  const [myFacilitatorIds, setMyFacilitatorIds] = useState(new Set())
  const [loading, setLoading] = useState(true)

  const fetchDirectory = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true)
    try {
      const [dirRes, subsRes] = await Promise.all([
        api.getDirectory().catch(() => ({ data: [] })),
        user?.id
          ? api.getStudentSubscriptions(user.id).catch(() => ({ data: [] }))
          : Promise.resolve({ data: [] }),
      ])

      const fetchedData = dirRes?.data || []
      const subs = subsRes?.data || []
      const subscribedCourseIds = new Set(
        subs.map((s) => s.course_id || s.courses?.id || s.id)
      )

      const mapped = fetchedData.map((item) => {
        const itemCourses =
          item.courses ||
          (item.sender_courses || []).map((sc) => sc.courses).filter(Boolean)
        return {
          ...item,
          courses: itemCourses,
        }
      })
      setDirectoryList(mapped)

      // Dynamically calculate which facilitators teach courses the student is subscribed to
      const myIds = new Set(
        mapped
          .filter((fac) =>
            (fac.courses || []).some((c) => subscribedCourseIds.has(c.id))
          )
          .map((fac) => fac.id)
      )
      setMyFacilitatorIds(myIds)
    } catch (err) {
      if (!isSilent) toast.error(err.message || 'Failed to load directory.')
    } finally {
      if (!isSilent) setLoading(false)
    }
  }, [user?.id])

  useEffect(() => {
    fetchDirectory(false)

    // 1. BroadcastChannel: Instant real-time updates for senders & subscriptions
    let channel = null
    if (typeof window !== 'undefined' && window.BroadcastChannel) {
      try {
        channel = new BroadcastChannel('classcheck_realtime')
        channel.onmessage = (event) => {
          if (
            event.data?.type === 'SENDER_UPDATE' ||
            event.data?.type === 'SUBSCRIPTIONS_UPDATED' ||
            event.data?.type === 'COURSES_UPDATE'
          ) {
            fetchDirectory(true)
          }
        }
      } catch {}
    }

    // 2. Storage event listener
    const handleStorage = (e) => {
      if (
        e.key === 'classcheck_dev_senders' ||
        e.key === 'classcheck_dev_subscribed_ids'
      ) {
        fetchDirectory(true)
      }
    }
    window.addEventListener('storage', handleStorage)

    // 3. Heartbeat polling
    const intervalId = setInterval(() => {
      fetchDirectory(true)
    }, 3500)

    return () => {
      if (channel) channel.close()
      window.removeEventListener('storage', handleStorage)
      clearInterval(intervalId)
    }
  }, [fetchDirectory])

  function handleCopyEmail(email) {
    if (!email) return
    navigator.clipboard.writeText(email)
    toast.success(`Copied ${email} to clipboard!`)
  }

  // Filtered and searched list
  const filteredList = useMemo(() => {
    return directoryList.filter((item) => {
      // Tab filter
      if (activeTab === 'class_rep' && item.role !== 'class_rep') return false
      if (activeTab === 'lecturer' && item.role !== 'lecturer') return false
      if (activeTab === 'hod' && item.role !== 'hod' && item.role !== 'dept_head') return false
      if (activeTab === 'my_facilitators' && !myFacilitatorIds.has(item.id)) return false

      // Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim()
        const matchName = item.full_name?.toLowerCase().includes(q)
        const matchEmail = item.email?.toLowerCase().includes(q)
        const matchDept = item.department?.toLowerCase().includes(q)
        const matchLocation = item.location?.toLowerCase().includes(q)
        const matchCourse = (item.courses || []).some(
          (c) =>
            c.course_code?.toLowerCase().includes(q) ||
            c.course_name?.toLowerCase().includes(q)
        )
        if (!matchName && !matchEmail && !matchDept && !matchLocation && !matchCourse) {
          return false
        }
      }

      return true
    })
  }, [directoryList, activeTab, searchQuery, myFacilitatorIds])

  // Counts per tab
  const tabCounts = useMemo(() => {
    return {
      all: directoryList.length,
      class_rep: directoryList.filter((i) => i.role === 'class_rep').length,
      lecturer: directoryList.filter((i) => i.role === 'lecturer').length,
      hod: directoryList.filter((i) => i.role === 'hod' || i.role === 'dept_head').length,
      my_facilitators: directoryList.filter((i) => myFacilitatorIds.has(i.id)).length,
    }
  }, [directoryList, myFacilitatorIds])

  // Appropriate navbar based on user role
  const renderNavbar = () => {
    if (profile?.role === 'admin') return <AdminNavbar />
    if (profile?.role === 'lecturer' || profile?.role === 'class_rep') {
      return <SenderNavbar />
    }
    return <Navbar />
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white flex flex-col font-sans">
      {renderNavbar()}

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 pt-20 pb-24 md:pb-12">
        {/* Header section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Course Rep & Faculty Directory
              </h1>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/25 text-blue-400">
                Official Contacts
              </span>
            </div>
            <p className="text-xs sm:text-sm text-white/50 mt-1">
              Find course representatives, lecturers, and faculty heads with consultation hours and office locations.
            </p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative mb-5">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, course code (e.g. MAT401), office, or role..."
            className="w-full bg-[#111111] border border-white/[0.12] rounded-[6px] pl-10 pr-10 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-blue-500 transition-colors"
          />
          <svg
            className="w-4 h-4 text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white text-xs font-bold"
            >
              ×
            </button>
          )}
        </div>

        {/* Role Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-6 no-scrollbar">
          {ROLE_TABS.map((tab) => {
            const isActive = activeTab === tab.key
            const count = tabCounts[tab.key] || 0

            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`relative flex items-center gap-2 px-3.5 py-2 rounded-[6px] text-xs font-semibold transition-all whitespace-nowrap border shrink-0 ${
                  isActive
                    ? 'bg-white/[0.12] border-blue-500/50 text-white shadow-sm'
                    : 'bg-[#111111] border-white/[0.06] text-white/55 hover:text-white hover:border-white/[0.12]'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    isActive
                      ? 'bg-blue-500/20 text-blue-300'
                      : 'bg-white/[0.06] text-white/40'
                  }`}
                >
                  {count}
                </span>
              </button>
            )
          })}
        </div>

        {/* Directory Cards Grid */}
        {loading ? (
          <div className="py-20 text-center">
            <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs text-white/40">Loading directory...</p>
          </div>
        ) : filteredList.length === 0 ? (
          <div className="bg-[#111111] border border-white/[0.08] rounded-[6px] p-12 text-center">
            <div className="w-12 h-12 rounded-full bg-white/[0.04] border border-white/[0.08] flex items-center justify-center mx-auto mb-3 text-white/40">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </div>
            <h3 className="text-sm font-bold text-white mb-1">
              No contacts found
            </h3>
            <p className="text-xs text-white/45 max-w-sm mx-auto">
              {searchQuery
                ? `No faculty or course reps matched "${searchQuery}". Try a different term or clear your search.`
                : 'No contacts available in this category.'}
            </p>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="mt-4 px-3.5 py-1.5 rounded-[6px] text-xs font-semibold bg-white/[0.08] hover:bg-white/[0.14] text-white transition-colors"
              >
                Clear Search
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredList.map((person) => {
              const isRep = person.role === 'class_rep'
              const isHod = person.role === 'hod' || person.role === 'dept_head'
              const initials = person.full_name
                ? person.full_name
                    .replace(/(Prof\.|Dr\.|Mr\.|Mrs\.|Ms\.)/g, '')
                    .trim()
                    .split(' ')
                    .slice(0, 2)
                    .map((n) => n[0])
                    .join('')
                    .toUpperCase()
                : 'CC'

              return (
                <div
                  key={person.id}
                  className="bg-[#111111] border border-white/[0.08] rounded-[6px] p-5 flex flex-col justify-between hover:border-white/[0.16] transition-all"
                >
                  <div>
                    {/* Header: Avatar, Name & Role Pill */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-sm shrink-0 ${
                            isRep
                              ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                              : isHod
                              ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30'
                              : 'bg-purple-600/20 text-purple-400 border border-purple-500/30'
                          }`}
                        >
                          {initials}
                        </div>
                        <div>
                          <h2 className="text-sm sm:text-base font-bold text-white tracking-tight leading-snug">
                            {person.full_name}
                          </h2>
                          <p className="text-xs text-white/50">
                            {person.department || 'Department'}{' '}
                            {person.level ? `• ${person.level}L` : ''}
                          </p>
                        </div>
                      </div>

                      {/* Role Badge */}
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded shrink-0 border ${
                          isRep
                            ? 'bg-blue-500/10 text-blue-400 border-blue-500/25'
                            : isHod
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25'
                            : 'bg-purple-500/10 text-purple-400 border-purple-500/25'
                        }`}
                      >
                        {isRep
                          ? 'Course Rep'
                          : isHod
                          ? 'Head of Dept'
                          : 'Lecturer'}
                      </span>
                    </div>

                    {/* Location & Office Hours */}
                    <div className="space-y-2 my-3.5 text-xs text-white/70 bg-[#0A0A0A] p-3 rounded-[6px] border border-white/[0.04]">
                      {person.location && (
                        <div className="flex items-center gap-2">
                          <svg className="w-3.5 h-3.5 text-blue-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <span className="truncate">{person.location}</span>
                        </div>
                      )}

                      {person.office_hours && (
                        <div className="flex items-center gap-2 text-white/60">
                          <svg className="w-3.5 h-3.5 text-amber-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="truncate">{person.office_hours}</span>
                        </div>
                      )}

                      {person.phone && (
                        <div className="flex items-center gap-2 text-white/60">
                          <svg className="w-3.5 h-3.5 text-emerald-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                          <a href={`tel:${person.phone}`} className="hover:text-white transition-colors">
                            {person.phone}
                          </a>
                        </div>
                      )}
                    </div>

                    {/* Assigned Courses Badges */}
                    {person.courses?.length > 0 && (
                      <div className="mb-4">
                        <span className="text-[10px] font-bold text-white/40 uppercase tracking-wider block mb-1.5">
                          Assigned Courses
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {person.courses.map((c) => (
                            <span
                              key={c.id || c.course_code}
                              className="px-2 py-0.5 rounded-[4px] text-[11px] font-semibold bg-white/[0.06] border border-white/[0.08] text-white/80"
                              title={c.course_name}
                            >
                              {c.course_code}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions Bar */}
                  <div className="flex items-center gap-2 pt-3 border-t border-white/[0.06]">
                    <a
                      href={`mailto:${person.email}`}
                      className="flex-1 text-center py-2 rounded-[6px] text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white transition-colors"
                    >
                      Send Email
                    </a>
                    <button
                      onClick={() => handleCopyEmail(person.email)}
                      className="px-3 py-2 rounded-[6px] text-xs font-semibold text-white/60 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] transition-colors"
                      title="Copy email address"
                    >
                      Copy
                    </button>
                    {person.phone && (
                      <a
                        href={`tel:${person.phone}`}
                        className="px-3 py-2 rounded-[6px] text-xs font-semibold text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/25 transition-colors"
                        title="Call contact"
                      >
                        Call
                      </a>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
