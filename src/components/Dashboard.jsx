import { useState, useEffect } from 'react'
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
