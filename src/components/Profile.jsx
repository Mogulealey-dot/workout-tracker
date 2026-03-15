import { useState, useEffect } from 'react'
import styles from './Profile.module.css'
import {
  getBodyStats,
  saveBodyStat,
  deleteBodyStat,
  getSettings,
  saveSettings,
  formatDateShort,
} from '../data/storage'

function BodyStatsChart({ stats }) {
  if (stats.length < 2) return null

  const points = stats.slice(-10)
  const width = 320
  const height = 120
  const paddingLeft = 38
  const paddingRight = 12
  const paddingTop = 12
  const paddingBottom = 24

  const chartW = width - paddingLeft - paddingRight
  const chartH = height - paddingTop - paddingBottom

  const weights = points.map(p => p.weight).filter(Boolean)
  if (weights.length < 2) return null

  const minW = Math.min(...weights) - 1
  const maxW = Math.max(...weights) + 1

  const toX = (i) => paddingLeft + (i / (points.length - 1)) * chartW
  const toY = (w) => paddingTop + chartH - ((w - minW) / (maxW - minW)) * chartH

  const pathD = points.filter(p => p.weight).map((p, i) =>
    `${i === 0 ? 'M' : 'L'} ${toX(i).toFixed(1)} ${toY(p.weight).toFixed(1)}`
  ).join(' ')

  const areaD = `${pathD} L ${toX(points.length - 1).toFixed(1)} ${(paddingTop + chartH).toFixed(1)} L ${toX(0).toFixed(1)} ${(paddingTop + chartH).toFixed(1)} Z`

  const yLabels = [minW, (minW + maxW) / 2, maxW].map(v => ({ val: v.toFixed(1), y: toY(v) }))
  const xIndices = [0, points.length - 1]

  return (
    <div className={styles.chartWrap}>
      <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height: 'auto', display: 'block' }}>
        <defs>
          <linearGradient id="bodyAreaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#34c972" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#34c972" stopOpacity="0" />
          </linearGradient>
        </defs>
        {yLabels.map(({ val, y }) => (
          <g key={val}>
            <line x1={paddingLeft} y1={y.toFixed(1)} x2={width - paddingRight} y2={y.toFixed(1)} stroke="#1e1e2e" strokeWidth="1" />
            <text x={paddingLeft - 4} y={y.toFixed(1)} textAnchor="end" dominantBaseline="middle" fontSize="9" fill="#8888a8">{val}</text>
          </g>
        ))}
        <path d={areaD} fill="url(#bodyAreaGrad)" />
        <path d={pathD} fill="none" stroke="#34c972" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        {points.map((p, i) => p.weight ? (
          <circle key={i} cx={toX(i).toFixed(1)} cy={toY(p.weight).toFixed(1)} r="3.5" fill="#34c972" stroke="#0a0a0f" strokeWidth="2" />
        ) : null)}
        {xIndices.map(i => (
          <text key={i} x={toX(i).toFixed(1)} y={height - 4} textAnchor="middle" fontSize="9" fill="#8888a8">
            {formatDateShort(points[i].date)}
          </text>
        ))}
      </svg>
    </div>
  )
}

export default function Profile() {
  const [stats, setStats] = useState([])
  const [settings, setSettings] = useState({ unit: 'kg' })
  const [showAddForm, setShowAddForm] = useState(false)
  const [form, setForm] = useState({ weight: '', bodyFat: '', notes: '' })
  const [activeSection, setActiveSection] = useState('body')

  useEffect(() => {
    const s = getBodyStats()
    setStats([...s].sort((a, b) => a.date.localeCompare(b.date)))
    setSettings(getSettings())
  }, [])

  const handleSaveStat = () => {
    if (!form.weight) return
    const today = new Date().toISOString().split('T')[0]
    const stat = {
      date: today,
      weight: parseFloat(form.weight) || 0,
      bodyFat: parseFloat(form.bodyFat) || 0,
      notes: form.notes,
    }
    saveBodyStat(stat)
    setStats(prev => {
      const updated = prev.filter(s => s.date !== today)
      return [...updated, stat].sort((a, b) => a.date.localeCompare(b.date))
    })
    setForm({ weight: '', bodyFat: '', notes: '' })
    setShowAddForm(false)
  }

  const handleDeleteStat = (date) => {
    deleteBodyStat(date)
    setStats(prev => prev.filter(s => s.date !== date))
  }

  const toggleUnit = () => {
    const newUnit = settings.unit === 'kg' ? 'lbs' : 'kg'
    const updated = { ...settings, unit: newUnit }
    setSettings(updated)
    saveSettings(updated)
  }

  const latestStat = stats.length > 0 ? stats[stats.length - 1] : null
  const prevStat = stats.length > 1 ? stats[stats.length - 2] : null
  const weightChange = latestStat && prevStat ? (latestStat.weight - prevStat.weight).toFixed(1) : null

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Profile</div>
          <div className="page-subtitle">Body stats & settings</div>
        </div>
      </div>

      {/* Section Tabs */}
      <div style={{ padding: '0 16px 8px' }}>
        <div className="toggle-group">
          <button
            className={`toggle-btn${activeSection === 'body' ? ' active' : ''}`}
            onClick={() => setActiveSection('body')}
          >
            Body Stats
          </button>
          <button
            className={`toggle-btn${activeSection === 'settings' ? ' active' : ''}`}
            onClick={() => setActiveSection('settings')}
          >
            Settings
          </button>
        </div>
      </div>

      {activeSection === 'body' && (
        <>
          {/* Latest stats */}
          {latestStat && (
            <div className={styles.latestCard}>
              <div className={styles.latestRow}>
                <div className={styles.latestStat}>
                  <span className={styles.latestVal}>{latestStat.weight}</span>
                  <span className={styles.latestUnit}>{settings.unit}</span>
                  {weightChange !== null && (
                    <span className={`${styles.weightChange}${parseFloat(weightChange) < 0 ? ' ' + styles.weightDown : ' ' + styles.weightUp}`}>
                      {parseFloat(weightChange) > 0 ? '+' : ''}{weightChange}
                    </span>
                  )}
                  <span className={styles.latestLabel}>Body Weight</span>
                </div>
                {latestStat.bodyFat > 0 && (
                  <div className={styles.latestStat}>
                    <span className={styles.latestVal}>{latestStat.bodyFat}</span>
                    <span className={styles.latestUnit}>%</span>
                    <span className={styles.latestLabel}>Body Fat</span>
                  </div>
                )}
                <div className={styles.latestStat}>
                  <span className={styles.latestVal}>{stats.length}</span>
                  <span className={styles.latestLabel}>Entries</span>
                </div>
              </div>
              <div className={styles.latestDate}>Last updated: {formatDateShort(latestStat.date)}</div>
            </div>
          )}

          {/* Chart */}
          {stats.length >= 2 && (
            <div className={styles.chartCard}>
              <div className={styles.chartCardTitle}>Weight Trend</div>
              <BodyStatsChart stats={stats} />
            </div>
          )}

          {/* Add today's stats */}
          <div style={{ padding: '0 16px 12px' }}>
            {!showAddForm ? (
              <button
                className="btn btn-primary"
                style={{ width: '100%' }}
                onClick={() => setShowAddForm(true)}
              >
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
                Log Today's Stats
              </button>
            ) : (
              <div className={styles.addForm}>
                <div className={styles.addFormTitle}>Today's Measurements</div>
                <div className={styles.formRow}>
                  <div className="form-field" style={{ flex: 1 }}>
                    <label className="form-label">Weight ({settings.unit})</label>
                    <input
                      type="number"
                      step="0.1"
                      placeholder="75.0"
                      value={form.weight}
                      onChange={e => setForm(f => ({ ...f, weight: e.target.value }))}
                      autoFocus
                    />
                  </div>
                  <div className="form-field" style={{ flex: 1 }}>
                    <label className="form-label">Body Fat %</label>
                    <input
                      type="number"
                      step="0.1"
                      placeholder="15.0"
                      value={form.bodyFat}
                      onChange={e => setForm(f => ({ ...f, bodyFat: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="form-field">
                  <label className="form-label">Notes (optional)</label>
                  <input
                    placeholder="How are you feeling?"
                    value={form.notes}
                    onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                  />
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setShowAddForm(false)}>
                    Cancel
                  </button>
                  <button
                    className="btn btn-primary"
                    style={{ flex: 2 }}
                    onClick={handleSaveStat}
                    disabled={!form.weight}
                  >
                    Save
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* History list */}
          {stats.length > 0 && (
            <>
              <div className="section-title">History</div>
              <div className={styles.statsList}>
                {[...stats].reverse().map(s => (
                  <div key={s.date} className={styles.statRow}>
                    <div className={styles.statRowLeft}>
                      <span className={styles.statRowDate}>{formatDateShort(s.date)}</span>
                      {s.notes && <span className={styles.statRowNotes}>{s.notes}</span>}
                    </div>
                    <div className={styles.statRowRight}>
                      <span className={styles.statRowWeight}>{s.weight}{settings.unit}</span>
                      {s.bodyFat > 0 && <span className={styles.statRowBf}>{s.bodyFat}%</span>}
                    </div>
                    <button
                      className="btn-icon"
                      onClick={() => handleDeleteStat(s.date)}
                      style={{ flexShrink: 0 }}
                      title="Delete"
                    >
                      <svg viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}
        </>
      )}

      {activeSection === 'settings' && (
        <div style={{ padding: '0 16px' }}>
          <div className={styles.settingsCard}>
            <div className={styles.settingRow}>
              <div className={styles.settingInfo}>
                <div className={styles.settingLabel}>Weight Unit</div>
                <div className={styles.settingDesc}>
                  Currently showing in <strong>{settings.unit}</strong>
                </div>
              </div>
              <div className="toggle-group" style={{ background: 'var(--bg)' }}>
                <button
                  className={`toggle-btn${settings.unit === 'kg' ? ' active' : ''}`}
                  onClick={() => settings.unit !== 'kg' && toggleUnit()}
                >
                  kg
                </button>
                <button
                  className={`toggle-btn${settings.unit === 'lbs' ? ' active' : ''}`}
                  onClick={() => settings.unit !== 'lbs' && toggleUnit()}
                >
                  lbs
                </button>
              </div>
            </div>
          </div>

          <div className={styles.settingsCard} style={{ marginTop: 12 }}>
            <div className={styles.settingRow} style={{ flexDirection: 'column', gap: 12 }}>
              <div className={styles.settingInfo}>
                <div className={styles.settingLabel}>About</div>
              </div>
              <div className={styles.aboutContent}>
                <div className={styles.aboutLogo}>💪</div>
                <div className={styles.aboutName}>WorkoutTracker</div>
                <div className={styles.aboutDesc}>
                  Track your workouts, monitor progress, and reach your fitness goals.
                  All data is stored locally on your device.
                </div>
                <div className={styles.aboutVersion}>Version 1.0.0 · By Mogulealey</div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div style={{ height: 12 }} />
    </div>
  )
}
