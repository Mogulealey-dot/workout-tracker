import { useState, useEffect, useRef } from 'react'
import styles from './Dashboard.module.css'
import {
  getWorkouts,
  getTemplates,
  computeStreak,
  computeMonthlyVolume,
  computePersonalRecords,
  getSettings,
  formatDate,
} from '../data/storage'

export default function Dashboard({ onNavigate }) {
  const [workouts, setWorkouts] = useState([])
  const [templates, setTemplates] = useState([])
  const [settings, setSettings] = useState({ unit: 'kg' })

  useEffect(() => {
    setWorkouts(getWorkouts())
    setTemplates(getTemplates())
    setSettings(getSettings())
  }, [])

  const streak = computeStreak(workouts)
  const monthlyVolume = computeMonthlyVolume(workouts, settings.unit)
  const prs = computePersonalRecords(workouts)
  const prCount = Object.keys(prs).length

  const now = new Date()
  const weekStart = new Date(now)
  weekStart.setDate(now.getDate() - now.getDay())
  const weekStartStr = weekStart.toISOString().split('T')[0]
  const workoutsThisWeek = workouts.filter(w => w.date >= weekStartStr).length

  const recentWorkouts = workouts
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 3)

  const formatVolume = (vol) => {
    if (vol >= 1000) return `${(vol / 1000).toFixed(1)}k`
    return Math.round(vol).toString()
  }

  const getTotalSets = (workout) =>
    workout.exercises.reduce((t, ex) => t + ex.sets.filter(s => s.completed).length, 0)

  return (
    <div className={styles.dashboard}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.greeting}>
            {getGreeting()}
          </h1>
          <p className={styles.subGreeting}>Let's crush it today</p>
        </div>
        <div className={styles.streakBadge}>
          <span className={styles.streakFire}>🔥</span>
          <span className={styles.streakNum}>{streak}</span>
          <span className={styles.streakLabel}>day streak</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">This Week</div>
          <div className="stat-value">
            {workoutsThisWeek}
            <span className="stat-unit">sessions</span>
          </div>
          <div className="stat-sub">workouts logged</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Monthly Volume</div>
          <div className="stat-value">
            {formatVolume(monthlyVolume)}
            <span className="stat-unit">{settings.unit}</span>
          </div>
          <div className="stat-sub">total lifted</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">All-Time PRs</div>
          <div className="stat-value">
            {prCount}
            <span className="stat-unit">records</span>
          </div>
          <div className="stat-sub">exercises tracked</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total Workouts</div>
          <div className="stat-value">
            {workouts.length}
            <span className="stat-unit">total</span>
          </div>
          <div className="stat-sub">sessions completed</div>
        </div>
      </div>

      {/* Quick Start Templates */}
      <div className="section-title">Quick Start</div>
      <div className={styles.templatesRow}>
        {templates.slice(0, 3).map(t => (
          <button
            key={t.id}
            className={styles.templateCard}
            onClick={() => onNavigate('log')}
          >
            <div className={styles.templateIcon}>{getTemplateEmoji(t.name)}</div>
            <div className={styles.templateName}>{t.name}</div>
            <div className={styles.templateMeta}>{t.exercises.length} exercises</div>
          </button>
        ))}
        <button
          className={styles.templateCardNew}
          onClick={() => onNavigate('log')}
        >
          <div className={styles.templateIcon}>＋</div>
          <div className={styles.templateName}>New</div>
          <div className={styles.templateMeta}>blank session</div>
        </button>
      </div>

      {/* Recent Workouts */}
      <div className="section-title">Recent Activity</div>
      {recentWorkouts.length === 0 ? (
        <div className="empty-state">
          <svg viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" /></svg>
          <h3>No workouts yet</h3>
          <p>Start logging your first session</p>
        </div>
      ) : (
        <div className={styles.recentList}>
          {recentWorkouts.map(w => {
            const totalSets = getTotalSets(w)
            const totalVol = w.exercises.reduce((t, ex) =>
              t + ex.sets.filter(s => s.completed).reduce((st, s) => st + s.reps * s.weight, 0), 0)
            return (
              <div key={w.id} className={styles.recentCard} onClick={() => onNavigate('history')}>
                <div className={styles.recentLeft}>
                  <div className={styles.recentName}>{w.name}</div>
                  <div className={styles.recentDate}>{formatDate(w.date)}</div>
                  <div className={styles.recentExercises}>
                    {w.exercises.slice(0, 3).map(e => e.name).join(' · ')}
                    {w.exercises.length > 3 && ` +${w.exercises.length - 3}`}
                  </div>
                </div>
                <div className={styles.recentRight}>
                  <div className={styles.recentStat}>{totalSets} sets</div>
                  {w.duration && (
                    <div className={styles.recentDuration}>{w.duration}m</div>
                  )}
                  {totalVol > 0 && (
                    <div className={styles.recentVol}>{formatVolume(totalVol)}{settings.unit}</div>
                  )}
                </div>
              </div>
            )
          })}
          <button className={styles.viewAllBtn} onClick={() => onNavigate('history')}>
            View all workouts →
          </button>
        </div>
      )}

      {/* Workout Calendar */}
      <div className="section-title">Workout Calendar</div>
      <WorkoutCalendar workouts={workouts} />

      {/* Top PRs */}
      {prCount > 0 && (
        <>
          <div className="section-title">Top Personal Records</div>
          <div className={styles.prList}>
            {Object.entries(prs)
              .sort((a, b) => b[1].weight - a[1].weight)
              .slice(0, 5)
              .map(([name, pr]) => (
                <div key={name} className={styles.prRow}>
                  <span className={styles.prName}>{name}</span>
                  <span className={styles.prWeight}>{pr.weight}{settings.unit}</span>
                </div>
              ))}
          </div>
        </>
      )}

      <div style={{ height: 12 }} />
    </div>
  )
}

// ─── Workout Calendar ────────────────────────────────────────────────────────
function WorkoutCalendar({ workouts }) {
  const today = new Date()
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth()) // 0-indexed
  const [tooltip, setTooltip] = useState(null) // { day, names, x, y }
  const tooltipRef = useRef(null)

  // Build a map: dateStr -> [workout names]
  const workoutMap = {}
  for (const w of workouts) {
    if (!workoutMap[w.date]) workoutMap[w.date] = []
    workoutMap[w.date].push(w.name)
  }

  const todayStr = today.toISOString().split('T')[0]

  const prevMonth = () => {
    if (month === 0) { setMonth(11); setYear(y => y - 1) }
    else setMonth(m => m - 1)
    setTooltip(null)
  }
  const nextMonth = () => {
    if (month === 11) { setMonth(0); setYear(y => y + 1) }
    else setMonth(m => m + 1)
    setTooltip(null)
  }

  // First day of month (0=Sun…6=Sat) — we want Mon-based grid
  const firstDay = new Date(year, month, 1)
  // Monday-based: 0=Mon … 6=Sun
  const startDow = (firstDay.getDay() + 6) % 7
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const monthName = firstDay.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

  // Cells: leading blanks + day numbers
  const cells = []
  for (let i = 0; i < startDow; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)

  const handleDayClick = (day, e) => {
    if (!day) return
    const mm = String(month + 1).padStart(2, '0')
    const dd = String(day).padStart(2, '0')
    const dateStr = `${year}-${mm}-${dd}`
    const names = workoutMap[dateStr]
    if (!names) return
    if (tooltip && tooltip.dateStr === dateStr) {
      setTooltip(null)
      return
    }
    const rect = e.currentTarget.getBoundingClientRect()
    setTooltip({ dateStr, names, top: rect.bottom + 4, left: rect.left })
  }

  // Close tooltip on outside click
  useEffect(() => {
    if (!tooltip) return
    const handler = (e) => {
      if (tooltipRef.current && !tooltipRef.current.contains(e.target)) {
        setTooltip(null)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [tooltip])

  const DOW = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

  return (
    <div className={styles.calendarWrap}>
      <div className={styles.calendarHeader}>
        <button className={styles.calNavBtn} onClick={prevMonth} aria-label="Previous month">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
        </button>
        <span className={styles.calMonthLabel}>{monthName}</span>
        <button className={styles.calNavBtn} onClick={nextMonth} aria-label="Next month">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
        </button>
      </div>

      <div className={styles.calGrid}>
        {DOW.map(d => (
          <div key={d} className={styles.calDowLabel}>{d}</div>
        ))}
        {cells.map((day, idx) => {
          if (!day) return <div key={`blank-${idx}`} className={styles.calCell} />
          const mm = String(month + 1).padStart(2, '0')
          const dd = String(day).padStart(2, '0')
          const dateStr = `${year}-${mm}-${dd}`
          const hasWorkout = !!workoutMap[dateStr]
          const isToday = dateStr === todayStr
          const isActive = tooltip && tooltip.dateStr === dateStr
          return (
            <div
              key={dateStr}
              className={[
                styles.calCell,
                isToday ? styles.calCellToday : '',
                hasWorkout ? styles.calCellHasWorkout : '',
                isActive ? styles.calCellActive : '',
              ].filter(Boolean).join(' ')}
              onClick={e => handleDayClick(day, e)}
            >
              <span className={styles.calDayNum}>{day}</span>
              {hasWorkout && <span className={styles.calDot} />}
            </div>
          )
        })}
      </div>

      {tooltip && (
        <div
          ref={tooltipRef}
          className={styles.calTooltip}
        >
          <div className={styles.calTooltipDate}>
            {new Date(tooltip.dateStr + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
          </div>
          {tooltip.names.map((name, i) => (
            <div key={i} className={styles.calTooltipName}>{name}</div>
          ))}
        </div>
      )}
    </div>
  )
}

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

function getTemplateEmoji(name) {
  const n = name.toLowerCase()
  if (n.includes('push')) return '💪'
  if (n.includes('pull')) return '🏋️'
  if (n.includes('leg')) return '🦵'
  if (n.includes('chest')) return '💪'
  if (n.includes('back')) return '🏋️'
  if (n.includes('cardio') || n.includes('run')) return '🏃'
  if (n.includes('core') || n.includes('ab')) return '⚡'
  return '🔥'
}
