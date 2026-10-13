import { useEffect, useState } from 'react'
import { formatDistanceToNow } from 'date-fns'
import toast from 'react-hot-toast'
import { api } from '../../../lib/api'

export default function WaitlistRequests() {
  const [students, setStudents] = useState([])
  const [waitlist, setWaitlist] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeSubTab, setActiveSubTab] = useState('students') // 'students' | 'waitlist'

  async function loadData() {
    try {
      const [{ data: stData }, { data: wlData }] = await Promise.all([
        api.getRegisteredStudents(),
        api.getWaitlistEntries(),
      ])
      setStudents(stData || [])
      setWaitlist(wlData || [])
    } catch {
      toast.error('Failed to load students and waitlist data')
    }
    setLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [])

  // Aggregate department demand from waitlist
  const demandByDept = waitlist.reduce((acc, curr) => {
    const dept = curr.department || 'Other'
    acc[dept] = (acc[dept] || 0) + 1
    return acc
  }, {})

  const sortedDemand = Object.entries(demandByDept).sort((a, b) => b[1] - a[1])

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-24 bg-[#111111] border border-white/[0.08] rounded-md animate-pulse" />
        <div className="h-64 bg-[#111111] border border-white/[0.08] rounded-md animate-pulse" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header and Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white tracking-tight">Students & Waitlist Demand</h2>
          <p className="text-xs text-white/40 mt-0.5">
            Monitor verified active pilot students and track campus expansion demand by department.
          </p>
        </div>

        <div className="flex bg-[#161616] p-1 rounded-md border border-white/[0.08] self-start sm:self-auto">
          <button
            onClick={() => setActiveSubTab('students')}
            className={`px-3 py-1.5 text-xs font-semibold rounded transition-colors ${
              activeSubTab === 'students'
                ? 'bg-white text-black font-bold'
                : 'text-white/60 hover:text-white'
            }`}
          >
            Registered Students ({students.length})
          </button>
          <button
            onClick={() => setActiveSubTab('waitlist')}
            className={`px-3 py-1.5 text-xs font-semibold rounded transition-colors ${
              activeSubTab === 'waitlist'
                ? 'bg-white text-black font-bold'
                : 'text-white/60 hover:text-white'
            }`}
          >
            Waitlist Requests ({waitlist.length})
          </button>
        </div>
      </div>

      {/* Subtab: Registered Students */}
      {activeSubTab === 'students' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="stat-card">
              <p className="text-2xl font-extrabold text-white tracking-tight">{students.length}</p>
              <p className="text-xs font-semibold text-white/45 uppercase tracking-wider mt-1">
                Active Student Accounts
              </p>
            </div>
            <div className="stat-card">
              <p className="text-2xl font-extrabold text-white tracking-tight">400L Mathematics</p>
              <p className="text-xs font-semibold text-white/45 uppercase tracking-wider mt-1">
                Primary Pilot Cohort
              </p>
            </div>
            <div className="stat-card">
              <p className="text-2xl font-extrabold text-emerald-400 tracking-tight">100%</p>
              <p className="text-xs font-semibold text-white/45 uppercase tracking-wider mt-1">
                Data Grounding Integrity
              </p>
            </div>
          </div>

          <div className="bg-[#111111] border border-white/[0.08] rounded-md overflow-hidden">
            <div className="px-5 py-4 border-b border-white/[0.08] bg-[#161616] flex items-center justify-between">
              <h3 className="text-sm font-bold text-white tracking-tight">Enrolled Students</h3>
              <span className="text-[11px] font-semibold text-white/40">
                {students.length} {students.length === 1 ? 'student' : 'students'} registered
              </span>
            </div>

            {students.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-sm font-medium text-white/50">No students registered yet.</p>
                <p className="text-xs text-white/30 mt-1">
                  New student signups at <code className="text-white/60">/signup</code> will appear here automatically in real time.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-white/[0.06]">
                {students.map((st) => (
                  <div
                    key={st.id || st.matric_no}
                    className="px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-white/[0.02] transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2.5">
                        <p className="text-sm font-bold text-white truncate">{st.full_name}</p>
                        <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
                          Active
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs text-white/40">
                        <span>Matric: <strong className="text-white/70">{st.matric_no}</strong></span>
                        <span>•</span>
                        <span>{st.email}</span>
                        <span>•</span>
                        <span>{st.department} ({st.level}L)</span>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-xs text-white/35">
                        {st.created_at
                          ? `Joined ${formatDistanceToNow(new Date(st.created_at), { addSuffix: true })}`
                          : 'Pilot Member'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Subtab: Waitlist Requests */}
      {activeSubTab === 'waitlist' && (
        <div className="space-y-6">
          {/* Department Demand Aggregation */}
          {sortedDemand.length > 0 && (
            <div className="bg-[#111111] border border-white/[0.08] rounded-md p-5">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
                Top Expansion Demand by Department
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {sortedDemand.slice(0, 4).map(([dept, count]) => (
                  <div key={dept} className="bg-[#161616] border border-white/[0.06] rounded p-3">
                    <p className="text-lg font-bold text-white">{count}</p>
                    <p className="text-xs text-white/50 truncate mt-0.5">{dept}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="bg-[#111111] border border-white/[0.08] rounded-md overflow-hidden">
            <div className="px-5 py-4 border-b border-white/[0.08] bg-[#161616] flex items-center justify-between">
              <h3 className="text-sm font-bold text-white tracking-tight">Waitlist Intake Log</h3>
              <span className="text-[11px] font-semibold text-white/40">
                {waitlist.length} {waitlist.length === 1 ? 'request' : 'requests'}
              </span>
            </div>

            {waitlist.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-sm font-medium text-white/50">No waitlist submissions yet.</p>
                <p className="text-xs text-white/30 mt-1">
                  Students from non-pilot departments who join the waitlist at <code className="text-white/60">/waitlist</code> will appear here.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-white/[0.06]">
                {waitlist.map((w) => (
                  <div
                    key={w.id || w.email}
                    className="px-5 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-white/[0.02] transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-white">{w.full_name}</p>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-0.5 text-xs text-white/40">
                        <span>{w.email}</span>
                        <span>•</span>
                        <span>{w.department} ({w.level ? `${w.level}L` : 'Undergrad'})</span>
                        {w.university && (
                          <>
                            <span>•</span>
                            <span>{w.university}</span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-xs text-white/35">
                        {w.created_at
                          ? formatDistanceToNow(new Date(w.created_at), { addSuffix: true })
                          : 'Recent'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
