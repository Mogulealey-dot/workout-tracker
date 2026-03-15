import { useState, useEffect } from 'react'
import './App.css'
import { initSampleData } from './data/storage'
import Dashboard from './components/Dashboard'
import LogWorkout from './components/LogWorkout'
import History from './components/History'
import Progress from './components/Progress'
import Profile from './components/Profile'

initSampleData()

// SVG icons for bottom nav
const Icons = {
  dashboard: (
    <svg viewBox="0 0 24 24">
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </svg>
  ),
  log: (
    <svg viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="9" />
      <line x1="12" y1="8" x2="12" y2="16" />
      <line x1="8" y1="12" x2="16" y2="12" />
    </svg>
  ),
  history: (
    <svg viewBox="0 0 24 24">
      <polyline points="1 4 1 10 7 10" />
      <path d="M3.51 15a9 9 0 1 0 .49-3" />
      <polyline points="12 7 12 12 15 15" />
    </svg>
  ),
  progress: (
    <svg viewBox="0 0 24 24">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>
  ),
  profile: (
    <svg viewBox="0 0 24 24">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  ),
}

const TABS = [
  { id: 'dashboard', label: 'Dashboard', icon: Icons.dashboard },
  { id: 'log', label: 'Log', icon: Icons.log },
  { id: 'history', label: 'History', icon: Icons.history },
  { id: 'progress', label: 'Progress', icon: Icons.progress },
  { id: 'profile', label: 'Profile', icon: Icons.profile },
]

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [refreshKey, setRefreshKey] = useState(0)

  const onWorkoutSaved = () => {
    setRefreshKey(k => k + 1)
    setActiveTab('dashboard')
  }

  const renderTab = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard key={refreshKey} onNavigate={setActiveTab} />
      case 'log':
        return <LogWorkout onWorkoutSaved={onWorkoutSaved} />
      case 'history':
        return <History key={refreshKey} />
      case 'progress':
        return <Progress key={refreshKey} />
      case 'profile':
        return <Profile key={refreshKey} />
      default:
        return null
    }
  }

  return (
    <div className="app">
      <main className="main-content">
        {renderTab()}
      </main>
      <nav className="bottom-nav">
        {TABS.map(tab => (
          <button
            key={tab.id}
            className={`nav-btn${activeTab === tab.id ? ' active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
            aria-label={tab.label}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </nav>
    </div>
  )
}
