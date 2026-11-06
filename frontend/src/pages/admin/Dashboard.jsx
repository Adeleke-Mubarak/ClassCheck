import { useState } from 'react'
import AdminNavbar from '../../components/AdminNavbar'
import Overview from './tabs/Overview'
import Senders from './tabs/Senders'
import Courses from './tabs/Courses'
import AllUpdates from './tabs/AllUpdates'
import Students from './tabs/Students'
import WaitlistDemand from './tabs/WaitlistDemand'

const TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'senders', label: 'Senders' },
  { id: 'courses', label: 'Courses' },
  { id: 'updates', label: 'All updates' },
  { id: 'students', label: 'Students' },
  { id: 'waitlist', label: 'Waitlist & Demand' },
]

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('overview')

  return (
    <div className="light-workspace min-h-screen bg-[#0A0A0A] text-white">
      <AdminNavbar />

      {/* Tab bar */}
      <div
        className="fixed left-0 right-0 z-40 bg-[#0A0A0A] border-b border-white/[0.08]"
        style={{ top: 'calc(3.5rem + env(safe-area-inset-top, 0px))' }}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex gap-1 py-2 overflow-x-auto no-scrollbar whitespace-nowrap">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`tab-btn shrink-0 ${activeTab === tab.id ? 'tab-btn-active' : 'tab-btn-inactive'}`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div
        style={{
          paddingTop: 'calc(7.25rem + env(safe-area-inset-top, 0px))',
          paddingBottom: 'calc(4rem + env(safe-area-inset-bottom, 0px))',
        }}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          {activeTab === 'overview' && <Overview />}
          {activeTab === 'senders' && <Senders />}
          {activeTab === 'courses' && <Courses />}
          {activeTab === 'updates' && <AllUpdates />}
          {activeTab === 'students' && <Students />}
          {activeTab === 'waitlist' && <WaitlistDemand />}
        </div>
      </div>
    </div>
  )
}
