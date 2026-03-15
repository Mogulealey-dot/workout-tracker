import { useState, useEffect } from 'react'
import styles from './Progress.module.css'
import {
  getWorkouts,
  getSettings,
  computePersonalRecords,
  getExerciseHistory,
  formatDateShort,
  EXERCISES,
} from '../data/storage'

function LineChart({ data, unit }) {
  if (!data || data.length < 2) {
    return (
      <div className={styles.chartEmpty}>
        <p>Need at least 2 data points to display chart</p>
      </div>
    )
  }

  const points = data.slice(-10)
  const width = 320
  const height = 160
  const paddingLeft = 42
  const paddingRight = 16
  const paddingTop = 16
  const paddingBottom = 32

  const chartW = width - paddingLeft - paddingRight
  const chartH = height - paddingTop - paddingBottom

  const weights = points.map(p => p.weight)
  const minW = Math.max(0, Math.min(...weights) - 5)
  const maxW = Math.max(...weights) + 5

  const toX = (i) => paddingLeft + (i / (points.length - 1)) * chartW
  const toY = (w) => paddingTop + chartH - ((w - minW) / (maxW - minW)) * chartH

  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${toX(i).toFixed(1)} ${toY(p.weight).toFixed(1)}`).join(' ')

  // Area fill
  const areaD = `${pathD} L ${toX(points.length - 1).toFixed(1)} ${(paddingTop + chartH).toFixed(1)} L ${toX(0).toFixed(1)} ${(paddingTop + chartH).toFixed(1)} Z`

  // Y axis labels
  const ySteps = 4
  const yLabels = Array.from({ length: ySteps + 1 }, (_, i) => {
    const val = minW + (i / ySteps) * (maxW - minW)
    return { val: Math.round(val), y: toY(val) }
  })

  // X axis labels (show first, middle, last)
  const xIndices = [0, Math.floor((points.length - 1) / 2), points.length - 1].filter((v, i, a) => a.indexOf(v) === i)

  return (
    <div className={styles.chartWrap}>
      <svg viewBox={`0 0 ${width} ${height}`} className={styles.chart}>
        <defs>
          <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#7c6af7" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#7c6af7" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#7c6af7" />
            <stop offset="100%" stopColor="#9580ff" />
          </linearGradient>
        </defs>

        {/* Grid lines */}
        {yLabels.map(({ val, y }) => (
          <g key={val}>
            <line
              x1={paddingLeft} y1={y.toFixed(1)}
              x2={width - paddingRight} y2={y.toFixed(1)}
              stroke="#1e1e2e" strokeWidth="1"
            />
            <text
              x={paddingLeft - 6} y={y.toFixed(1)}
              textAnchor="end" dominantBaseline="middle"
              fontSize="10" fill="#8888a8"
            >
              {val}
            </text>
          </g>
        ))}

        {/* Area */}
        <path d={areaD} fill="url(#areaGrad)" />

        {/* Line */}
        <path d={pathD} fill="none" stroke="url(#lineGrad)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

        {/* Data points */}
        {points.map((p, i) => (
          <g key={i}>
            <circle
              cx={toX(i).toFixed(1)}
              cy={toY(p.weight).toFixed(1)}
              r="4"
              fill="#7c6af7"
              stroke="#0a0a0f"
              strokeWidth="2"
            />
            <title>{formatDateShort(p.date)}: {p.weight}{unit}</title>
          </g>
        ))}

        {/* X axis labels */}
        {xIndices.map(i => (
          <text
            key={i}
            x={toX(i).toFixed(1)}
            y={height - 6}
            textAnchor="middle"
            fontSize="10"
            fill="#8888a8"
          >
            {formatDateShort(points[i].date)}
          </text>
        ))}
      </svg>
    </div>
  )
}

export default function Progress() {
  const [workouts, setWorkouts] = useState([])
  const [settings, setSettings] = useState({ unit: 'kg' })
  const [selectedExercise, setSelectedExercise] = useState(null)
  const [activeTab, setActiveTab] = useState('chart') // 'chart' | 'prs'

  useEffect(() => {
    const ws = getWorkouts()
    setWorkouts(ws)
    setSettings(getSettings())

    // Default: pick exercise with most history
    const allNames = ws.flatMap(w => w.exercises.map(e => e.name))
    const counts = {}
    allNames.forEach(n => { counts[n] = (counts[n] || 0) + 1 })
    const mostCommon = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]
    if (mostCommon) setSelectedExercise(mostCommon[0])
  }, [])

  const prs = computePersonalRecords(workouts)
  const exerciseHistory = selectedExercise ? getExerciseHistory(workouts, selectedExercise) : []

  // Exercises that appear in workouts (for the selector)
  const trackedExercises = [...new Set(workouts.flatMap(w => w.exercises.map(e => e.name)))]
    .map(name => {
      const cat = Object.entries(EXERCISES).find(([, names]) => names.includes(name))?.[0] || 'Other'
      return { name, category: cat }
    })
    .sort((a, b) => a.name.localeCompare(b.name))

  const prEntries = Object.entries(prs).sort((a, b) => b[1].date.localeCompare(a[1].date))

  const getCategoryColor = (cat) => {
    const colors = {
      Chest: '#f05a5a',
      Back: '#f0a84a',
      Legs: '#34c972',
      Shoulders: '#7c6af7',
      Arms: '#60bffa',
      Core: '#f0e74a',
      Cardio: '#f05ac8',
    }
    return colors[cat] || '#8888a8'
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Progress</div>
          <div className="page-subtitle">Track your gains over time</div>
        </div>
      </div>

      <div style={{ padding: '0 16px 8px' }}>
        <div className="toggle-group">
          <button
            className={`toggle-btn${activeTab === 'chart' ? ' active' : ''}`}
            onClick={() => setActiveTab('chart')}
          >
            Charts
          </button>
          <button
            className={`toggle-btn${activeTab === 'prs' ? ' active' : ''}`}
            onClick={() => setActiveTab('prs')}
          >
            Personal Records
          </button>
        </div>
      </div>

      {activeTab === 'chart' && (
        <>
          {trackedExercises.length === 0 ? (
            <div className="empty-state">
              <svg viewBox="0 0 24 24"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
              <h3>No data yet</h3>
              <p>Log workouts to see progress charts</p>
            </div>
          ) : (
            <>
              {/* Exercise selector */}
              <div className={styles.exerciseSelector}>
                {trackedExercises.map(ex => (
                  <button
                    key={ex.name}
                    className={`${styles.exChip}${selectedExercise === ex.name ? ' ' + styles.exChipActive : ''}`}
                    style={selectedExercise === ex.name ? { background: getCategoryColor(ex.category) + '22', borderColor: getCategoryColor(ex.category) + '66', color: getCategoryColor(ex.category) } : {}}
                    onClick={() => setSelectedExercise(ex.name)}
                  >
                    {ex.name}
                  </button>
                ))}
              </div>

              {selectedExercise && (
                <div className={styles.chartSection}>
                  <div className={styles.chartHeader}>
                    <div className={styles.chartTitle}>{selectedExercise}</div>
                    {prs[selectedExercise] && (
                      <div className={styles.prBadge}>
                        <span>🏆</span>
                        <span>PR: {prs[selectedExercise].weight}{settings.unit}</span>
                      </div>
                    )}
                  </div>
                  <LineChart data={exerciseHistory} unit={settings.unit} />
                  {exerciseHistory.length > 0 && (
                    <div className={styles.chartStats}>
                      <div className={styles.cStat}>
                        <span className={styles.cStatVal}>{exerciseHistory.length}</span>
                        <span className={styles.cStatLabel}>Sessions</span>
                      </div>
                      <div className={styles.cStat}>
                        <span className={styles.cStatVal}>{Math.min(...exerciseHistory.map(p => p.weight))}{settings.unit}</span>
                        <span className={styles.cStatLabel}>Min Weight</span>
                      </div>
                      <div className={styles.cStat}>
                        <span className={styles.cStatVal}>{Math.max(...exerciseHistory.map(p => p.weight))}{settings.unit}</span>
                        <span className={styles.cStatLabel}>Max Weight</span>
                      </div>
                      {exerciseHistory.length >= 2 && (
                        <div className={styles.cStat}>
                          <span className={styles.cStatVal} style={{ color: exerciseHistory[exerciseHistory.length - 1].weight > exerciseHistory[0].weight ? 'var(--success)' : 'var(--danger)' }}>
                            {exerciseHistory[exerciseHistory.length - 1].weight > exerciseHistory[0].weight ? '+' : ''}
                            {(exerciseHistory[exerciseHistory.length - 1].weight - exerciseHistory[0].weight).toFixed(1)}{settings.unit}
                          </span>
                          <span className={styles.cStatLabel}>Overall</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </>
      )}

      {activeTab === 'prs' && (
        <>
          {prEntries.length === 0 ? (
            <div className="empty-state">
              <svg viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
              <h3>No PRs yet</h3>
              <p>Log workouts with weights to track personal records</p>
            </div>
          ) : (
            <div className={styles.prGrid}>
              {prEntries.map(([name, pr]) => {
                const cat = Object.entries(EXERCISES).find(([, names]) => names.includes(name))?.[0] || 'Other'
                const color = getCategoryColor(cat)
                return (
                  <div key={name} className={styles.prCard}>
                    <div className={styles.prCardTop}>
                      <span className={styles.prTrophy}>🏆</span>
                      <span className={styles.prCat} style={{ color, background: color + '22' }}>{cat}</span>
                    </div>
                    <div className={styles.prCardName}>{name}</div>
                    <div className={styles.prCardWeight}>{pr.weight}<span className={styles.prCardUnit}>{settings.unit}</span></div>
                    <div className={styles.prCardDate}>{formatDateShort(pr.date)}</div>
                  </div>
                )
              })}
            </div>
          )}
        </>
      )}
    </div>
  )
}
