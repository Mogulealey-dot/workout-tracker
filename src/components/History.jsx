import { useState, useEffect } from 'react'
import styles from './History.module.css'
import { getWorkouts, deleteWorkout, getSettings, formatDate } from '../data/storage'

export default function History() {
  const [workouts, setWorkouts] = useState([])
  const [settings, setSettings] = useState({ unit: 'kg' })
  const [expanded, setExpanded] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(null)
  const [search, setSearch] = useState('')

  useEffect(() => {
    setWorkouts(getWorkouts().sort((a, b) => b.date.localeCompare(a.date)))
    setSettings(getSettings())
  }, [])

  const handleDelete = (id) => {
    deleteWorkout(id)
    setWorkouts(prev => prev.filter(w => w.id !== id))
    setConfirmDelete(null)
    if (expanded === id) setExpanded(null)
  }

  const filtered = search
    ? workouts.filter(w =>
        w.name.toLowerCase().includes(search.toLowerCase()) ||
        w.exercises.some(e => e.name.toLowerCase().includes(search.toLowerCase()))
      )
    : workouts

  // Group by date
  const groups = {}
  for (const w of filtered) {
    const key = w.date
    if (!groups[key]) groups[key] = []
    groups[key].push(w)
  }
  const sortedDates = Object.keys(groups).sort().reverse()

  const getVolume = (workout) =>
    workout.exercises.reduce((t, ex) =>
      t + ex.sets.filter(s => s.completed).reduce((st, s) => st + s.reps * s.weight, 0), 0)

  const formatVol = (v) => {
    if (v >= 1000) return `${(v / 1000).toFixed(1)}k`
    return Math.round(v).toString()
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">History</div>
          <div className="page-subtitle">{workouts.length} workouts logged</div>
        </div>
      </div>

      <div style={{ padding: '0 16px 12px' }}>
        <input
          placeholder="Search workouts or exercises..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ width: '100%', borderRadius: 10 }}
        />
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <svg viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
          <h3>{search ? 'No workouts match' : 'No workouts yet'}</h3>
          <p>{search ? 'Try a different search term' : 'Log your first workout to see it here'}</p>
        </div>
      ) : (
        <div className={styles.historyList}>
          {sortedDates.map(date => (
            <div key={date}>
              <div className={styles.dateLabel}>{formatDate(date)}</div>
              {groups[date].map(w => {
                const isOpen = expanded === w.id
                const vol = getVolume(w)
                const totalSets = w.exercises.reduce((t, ex) => t + ex.sets.filter(s => s.completed).length, 0)
                return (
                  <div key={w.id} className={styles.workoutCard}>
                    <div
                      className={styles.workoutHeader}
                      onClick={() => setExpanded(isOpen ? null : w.id)}
                    >
                      <div className={styles.workoutLeft}>
                        <div className={styles.workoutName}>{w.name}</div>
                        <div className={styles.workoutMeta}>
                          {w.exercises.length} exercises
                          {totalSets > 0 && ` · ${totalSets} sets`}
                          {w.duration > 0 && ` · ${w.duration}m`}
                          {vol > 0 && ` · ${formatVol(vol)}${settings.unit}`}
                        </div>
                      </div>
                      <div className={styles.workoutActions}>
                        <button
                          className="btn-icon"
                          onClick={e => { e.stopPropagation(); setConfirmDelete(w.id) }}
                          title="Delete workout"
                        >
                          <svg viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>
                        </button>
                        <div className={`${styles.chevron}${isOpen ? ' ' + styles.chevronOpen : ''}`}>
                          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="6 9 12 15 18 9"/>
                          </svg>
                        </div>
                      </div>
                    </div>

                    {isOpen && (
                      <div className={styles.workoutDetail}>
                        {w.notes && (
                          <div className={styles.notesRow}>
                            <span className={styles.notesIcon}>📝</span>
                            <span className={styles.notesText}>{w.notes}</span>
                          </div>
                        )}
                        {w.exercises.map((ex, i) => (
                          <div key={i} className={styles.exDetail}>
                            <div className={styles.exDetailHeader}>
                              <span className={styles.exDetailName}>{ex.name}</span>
                              <span className={styles.exDetailCat}>{ex.category}</span>
                            </div>
                            <div className={styles.setsGrid}>
                              {ex.sets.map((s, si) => (
                                <div
                                  key={si}
                                  className={`${styles.setChip}${s.completed ? ' ' + styles.setChipDone : ''}`}
                                >
                                  <span className={styles.setChipNum}>Set {si + 1}</span>
                                  {s.weight > 0 ? (
                                    <span>{s.weight}{settings.unit} × {s.reps}</span>
                                  ) : (
                                    <span>{s.reps} reps</span>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      )}

      {/* Delete confirmation */}
      {confirmDelete && (
        <div className="modal-overlay modal-centered" onClick={() => setConfirmDelete(null)}>
          <div className="modal" style={{ maxWidth: 340 }} onClick={e => e.stopPropagation()}>
            <div className={styles.deleteModal}>
              <div className={styles.deleteIcon}>🗑️</div>
              <h3 style={{ fontSize: 16, marginBottom: 8 }}>Delete Workout?</h3>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20 }}>
                This action cannot be undone.
              </p>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setConfirmDelete(null)}>
                  Cancel
                </button>
                <button className="btn btn-danger" style={{ flex: 1 }} onClick={() => handleDelete(confirmDelete)}>
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
