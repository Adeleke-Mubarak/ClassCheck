import { useState } from 'react'
import AdminNavbar from '../../components/AdminNavbar'
import Overview from './tabs/Overview'
import Senders from './tabs/Senders'
import Courses from './tabs/Courses'
import AllUpdates from './tabs/AllUpdates'

const TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'senders', label: 'Senders' },
  { id: 'courses', label: 'Courses' },
  { id: 'updates', label: 'All updates' },
]

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('overview')

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNavbar />

      {/* Tab bar */}
      <div className="fixed top-14 left-0 right-0 z-40 bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex gap-1 py-2">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`tab-btn ${activeTab === tab.id ? 'tab-btn-active' : 'tab-btn-inactive'}`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="pt-[108px] pb-12">
        <div className="max-w-6xl mx-auto px-6">
          {activeTab === 'overview' && <Overview />}
          {activeTab === 'senders' && <Senders />}
          {activeTab === 'courses' && <Courses />}
          {activeTab === 'updates' && <AllUpdates />}
        </div>
      </div>
    </div>
  )
}
