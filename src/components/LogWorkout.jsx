import { useState, useEffect, useRef, useCallback } from 'react'
import styles from './LogWorkout.module.css'
import {
  getTemplates,
  saveWorkout,
  saveTemplate,
  getSettings,
  generateId,
  EXERCISES,
  getCustomExercises,
  saveCustomExercise,
} from '../data/storage'

function useTimer(running) {
  const [seconds, setSeconds] = useState(0)
  const ref = useRef(null)
  useEffect(() => {
    if (running) {
      ref.current = setInterval(() => setSeconds(s => s + 1), 1000)
    } else {
      clearInterval(ref.current)
    }
    return () => clearInterval(ref.current)
  }, [running])
  return seconds
}

function formatTime(s) {
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = s % 60
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
  return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
}

function formatRestTime(s) {
  const m = Math.floor(s / 60)
  const sec = s % 60
  return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
}

function playBeep(freq = 880, dur = 0.12) {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain); gain.connect(ctx.destination)
    osc.frequency.value = freq
    gain.gain.setValueAtTime(0.4, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur)
    osc.start(); osc.stop(ctx.currentTime + dur)
  } catch {}
}

const ALL_CATEGORIES = Object.keys(EXERCISES)

// ─── Rep Timer Modal ──────────────────────────────────────────────────────────
function RepTimerModal({ exerciseName, setNum, targetReps, onComplete, onClose }) {
  const [tempo, setTempo] = useState(2)
  const [currentRep, setCurrentRep] = useState(targetReps || 10)
  const [running, setRunning] = useState(false)
  const [started, setStarted] = useState(false)
  const intervalRef = useRef(null)
  const target = targetReps || 10

  // Reset currentRep when target changes (shouldn't happen but guard)
  useEffect(() => {
    setCurrentRep(target)
  }, [target])

  const clearTick = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }

  const handleStart = () => {
    setRunning(true)
    setStarted(true)
    intervalRef.current = setInterval(() => {
      setCurrentRep(prev => {
        const next = prev - 1
        if (next <= 0) {
          clearInterval(intervalRef.current)
          intervalRef.current = null
          setRunning(false)
          // play 3 beeps with slight delay between
          playBeep(880, 0.12)
          setTimeout(() => playBeep(880, 0.12), 180)
          setTimeout(() => {
            playBeep(1100, 0.2)
            onComplete()
          }, 360)
          return 0
        }
        return next
      })
    }, tempo * 1000)
  }

  const handlePause = () => {
    clearTick()
    setRunning(false)
  }

  const handleReset = () => {
    clearTick()
    setRunning(false)
    setStarted(false)
    setCurrentRep(target)
  }

  useEffect(() => {
    return () => clearTick()
  }, [])

  // When tempo changes and we are running, restart the interval
  useEffect(() => {
    if (running) {
      clearTick()
      intervalRef.current = setInterval(() => {
        setCurrentRep(prev => {
          const next = prev - 1
          if (next <= 0) {
            clearInterval(intervalRef.current)
            intervalRef.current = null
            setRunning(false)
            playBeep(880, 0.12)
            setTimeout(() => playBeep(880, 0.12), 180)
            setTimeout(() => {
              playBeep(1100, 0.2)
              onComplete()
            }, 360)
            return 0
          }
          return next
        })
      }, tempo * 1000)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tempo])

  const circumference = 2 * Math.PI * 52
  const progress = target > 0 ? currentRep / target : 0

  return (
    <div className="modal-overlay modal-centered" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title">{exerciseName} — Set {setNum}</span>
          <button className="modal-close" onClick={onClose}>
            <svg viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        {/* SVG ring */}
        <div className={styles.repRingWrap}>
          <svg width="120" height="120" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="52" fill="none" stroke="var(--border)" strokeWidth="6"/>
            <circle
              cx="60" cy="60" r="52"
              fill="none"
              stroke="var(--accent)"
              strokeWidth="6"
              strokeDasharray={`${circumference}`}
              strokeDashoffset={`${circumference * (1 - progress)}`}
              strokeLinecap="round"
              transform="rotate(-90 60 60)"
              style={{ transition: running ? 'none' : 'stroke-dashoffset 0.3s' }}
            />
          </svg>
          <div className={styles.repRingCount}>{currentRep}</div>
          <div className={styles.repRingLabel}>reps left</div>
        </div>

        {/* Tempo chips */}
        <div className={styles.tempoRow}>
          <span className={styles.tempoLabel}>Tempo</span>
          {[1, 1.5, 2, 3].map(t => (
            <button
              key={t}
              className={`${styles.tempoChip}${tempo === t ? ' ' + styles.tempoChipActive : ''}`}
              onClick={() => setTempo(t)}
              disabled={running}
            >
              {t}s
            </button>
          ))}
        </div>

        {/* Controls */}
        <div className={styles.repTimerBtns}>
          {!started || (!running && currentRep > 0) ? (
            <button className="btn btn-primary" style={{ flex: 2 }} onClick={handleStart} disabled={currentRep === 0}>
              {started && !running ? 'Resume' : 'Start'}
            </button>
          ) : running ? (
            <button className="btn btn-secondary" style={{ flex: 2 }} onClick={handlePause}>
              Pause
            </button>
          ) : null}
          <button className="btn btn-ghost" style={{ flex: 1 }} onClick={handleReset}>
            Reset
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Rest Timer Banner ────────────────────────────────────────────────────────
const REST_OPTIONS = [30, 60, 90, 120]

function RestTimerBanner({ onDismiss }) {
  const [duration, setDuration] = useState(90)
  const [remaining, setRemaining] = useState(90)
  const intervalRef = useRef(null)
  const durationRef = useRef(90)

  const startTimer = useCallback((dur) => {
    if (intervalRef.current) clearInterval(intervalRef.current)
    setRemaining(dur)
    durationRef.current = dur
    intervalRef.current = setInterval(() => {
      setRemaining(prev => {
        if (prev <= 1) {
          clearInterval(intervalRef.current)
          intervalRef.current = null
          playBeep(880, 0.15)
          setTimeout(() => playBeep(1100, 0.2), 250)
          setTimeout(onDismiss, 600)
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }, [onDismiss])

  useEffect(() => {
    startTimer(90)
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [startTimer])

  const handleSelectDuration = (d) => {
    setDuration(d)
    startTimer(d)
  }

  const progressPct = durationRef.current > 0 ? (remaining / durationRef.current) * 100 : 0

  return (
    <div className={styles.restBanner}>
      <div className={styles.restBannerInner}>
        <div className={styles.restBannerTop}>
          <div className={styles.restBannerLeft}>
            <span className={styles.restLabel}>Rest</span>
            <span className={styles.restCountdown}>{formatRestTime(remaining)}</span>
          </div>
          <div className={styles.restDurationChips}>
            {REST_OPTIONS.map(d => (
              <button
                key={d}
                className={`${styles.restChip}${duration === d ? ' ' + styles.restChipActive : ''}`}
                onClick={() => handleSelectDuration(d)}
              >
                {d}s
              </button>
            ))}
          </div>
          <button className={styles.restSkip} onClick={onDismiss}>Skip</button>
        </div>
        <div className={styles.restProgressTrack}>
          <div
            className={styles.restProgressBar}
            style={{ width: `${progressPct}%`, transition: 'width 1s linear' }}
          />
        </div>
      </div>
    </div>
  )
}

export default function LogWorkout({ onWorkoutSaved }) {
  const [phase, setPhase] = useState('start') // 'start' | 'active'
  const [workoutName, setWorkoutName] = useState('')
  const [exercises, setExercises] = useState([])
  const [timerRunning, setTimerRunning] = useState(false)
  const [startTime] = useState(Date.now())
  const seconds = useTimer(timerRunning)
  const [settings, setSettings] = useState({ unit: 'kg' })
  const [templates, setTemplates] = useState([])
  const [showExercisePicker, setShowExercisePicker] = useState(false)
  const [showFinishModal, setShowFinishModal] = useState(false)
  const [exerciseSearch, setExerciseSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [savingTemplate, setSavingTemplate] = useState(false)
  const [templateName, setTemplateName] = useState('')
  const [workoutNotes, setWorkoutNotes] = useState('')

  // Rep timer state
  const [repTimerTarget, setRepTimerTarget] = useState(null)
  // { exId, setId, exerciseName, setNum, targetReps }

  // Rest timer state
  const [showRestTimer, setShowRestTimer] = useState(false)
  // Debounce: track last completed set id to avoid re-triggering
  const lastCompletedRef = useRef(null)

  useEffect(() => {
    setSettings(getSettings())
    setTemplates(getTemplates())
  }, [])

  // Start from template
  const startFromTemplate = (template) => {
    setWorkoutName(template.name)
    const exs = template.exercises.map(ex => ({
      id: generateId(),
      name: ex.name,
      category: ex.category,
      sets: ex.sets.map(s => ({
        id: generateId(),
        reps: s.reps,
        weight: s.weight,
        completed: false,
        isWarmup: false,
      })),
    }))
    setExercises(exs)
    setTimerRunning(true)
    setPhase('active')
  }

  const startBlank = () => {
    setWorkoutName('My Workout')
    setExercises([])
    setTimerRunning(true)
    setPhase('active')
  }

  // Exercise management
  const addExercise = (name, category) => {
    setExercises(prev => [
      ...prev,
      {
        id: generateId(),
        name,
        category,
        sets: [{ id: generateId(), reps: 10, weight: 0, completed: false, isWarmup: false }],
      },
    ])
    setShowExercisePicker(false)
    setExerciseSearch('')
    setSelectedCategory('All')
  }

  const removeExercise = (exId) => {
    setExercises(prev => prev.filter(e => e.id !== exId))
  }

  const addSet = (exId) => {
    setExercises(prev => prev.map(ex => {
      if (ex.id !== exId) return ex
      const lastSet = ex.sets[ex.sets.length - 1]
      return {
        ...ex,
        sets: [
          ...ex.sets,
          { id: generateId(), reps: lastSet?.reps || 10, weight: lastSet?.weight || 0, completed: false, isWarmup: false },
        ],
      }
    }))
  }

  const removeSet = (exId, setId) => {
    setExercises(prev => prev.map(ex => {
      if (ex.id !== exId) return ex
      if (ex.sets.length <= 1) return ex
      return { ...ex, sets: ex.sets.filter(s => s.id !== setId) }
    }))
  }

  const updateSet = (exId, setId, field, value) => {
    setExercises(prev => prev.map(ex => {
      if (ex.id !== exId) return ex
      return {
        ...ex,
        sets: ex.sets.map(s => s.id !== setId ? s : { ...s, [field]: field === 'completed' ? value : parseFloat(value) || 0 }),
      }
    }))
  }

  const toggleSetComplete = (exId, setId) => {
    setExercises(prev => prev.map(ex => {
      if (ex.id !== exId) return ex
      return {
        ...ex,
        sets: ex.sets.map(s => {
          if (s.id !== setId) return s
          const newCompleted = !s.completed
          // Trigger rest timer when marking complete (not warmup, not unchecking)
          if (newCompleted && !s.isWarmup && lastCompletedRef.current !== setId) {
            lastCompletedRef.current = setId
            setShowRestTimer(true)
          }
          return { ...s, completed: newCompleted }
        }),
      }
    }))
  }

  const toggleWarmup = (exId, setId) => {
    setExercises(prev => prev.map(ex => {
      if (ex.id !== exId) return ex
      return {
        ...ex,
        sets: ex.sets.map(s => s.id !== setId ? s : { ...s, isWarmup: !s.isWarmup }),
      }
    }))
  }

  const finishWorkout = () => {
    const workout = {
      id: generateId(),
      date: new Date().toISOString().split('T')[0],
      name: workoutName,
      duration: Math.round(seconds / 60),
      notes: workoutNotes,
      exercises: exercises.map(ex => ({
        name: ex.name,
        category: ex.category,
        sets: ex.sets.map(s => ({ reps: s.reps, weight: s.weight, completed: s.completed, isWarmup: s.isWarmup || false })),
      })),
    }
    saveWorkout(workout)
    if (savingTemplate && templateName) {
      saveTemplate({
        id: generateId(),
        name: templateName,
        exercises: exercises.map(ex => ({
          name: ex.name,
          category: ex.category,
          sets: ex.sets.map(s => ({ reps: s.reps, weight: s.weight })),
        })),
      })
    }
    setShowFinishModal(false)
    onWorkoutSaved()
  }

  const discardWorkout = () => {
    setPhase('start')
    setTimerRunning(false)
    setExercises([])
    setWorkoutName('')
    setWorkoutNotes('')
  }

  // Filtered exercises for picker
  const customExercises = getCustomExercises()
  const allExerciseEntries = [
    ...Object.entries(EXERCISES).flatMap(([cat, names]) => names.map(n => ({ name: n, category: cat }))),
    ...customExercises,
  ]
  const existingNames = new Set(exercises.map(e => e.name))
  const filtered = allExerciseEntries.filter(ex => {
    const matchSearch = ex.name.toLowerCase().includes(exerciseSearch.toLowerCase())
    const matchCat = selectedCategory === 'All' || ex.category === selectedCategory
    return matchSearch && matchCat
  })

  const completedSets = exercises.reduce((t, ex) => t + ex.sets.filter(s => s.completed).length, 0)
  const totalSets = exercises.reduce((t, ex) => t + ex.sets.length, 0)

  if (phase === 'start') {
    return (
      <div className={styles.startPage}>
        <div className="page-header">
          <div>
            <div className="page-title">Log Workout</div>
            <div className="page-subtitle">Start a new session</div>
          </div>
        </div>

        <button className={styles.blankStart} onClick={startBlank}>
          <span className={styles.blankIcon}>＋</span>
          <div>
            <div className={styles.blankTitle}>Empty Workout</div>
            <div className={styles.blankSub}>Start from scratch</div>
          </div>
        </button>

        {templates.length > 0 && (
          <>
            <div className="section-title">Templates</div>
            <div className={styles.templatesList}>
              {templates.map(t => (
                <div key={t.id} className={styles.templateRow}>
                  <div className={styles.templateInfo}>
                    <div className={styles.templateRowName}>{t.name}</div>
                    <div className={styles.templateRowMeta}>
                      {t.exercises.length} exercises · {t.exercises.reduce((n, e) => n + e.sets.length, 0)} sets
                    </div>
                    <div className={styles.templateExercises}>
                      {t.exercises.map(e => e.name).join(', ')}
                    </div>
                  </div>
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => startFromTemplate(t)}
                  >
                    Start
                  </button>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    )
  }

  return (
    <div className={styles.activePage}>
      {/* Active workout header */}
      <div className={styles.activeHeader}>
        <div className={styles.activeLeft}>
          <input
            className={styles.workoutNameInput}
            value={workoutName}
            onChange={e => setWorkoutName(e.target.value)}
          />
          <div className={styles.timerRow}>
            <div className={styles.timer}>{formatTime(seconds)}</div>
            <button
              className={styles.timerToggle}
              onClick={() => setTimerRunning(r => !r)}
              title={timerRunning ? 'Pause' : 'Resume'}
            >
              {timerRunning ? (
                <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
              ) : (
                <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
              )}
            </button>
          </div>
        </div>
        <div className={styles.activeRight}>
          <div className={styles.progressPill}>
            {completedSets}/{totalSets} sets
          </div>
          <div className={styles.headerActions}>
            <button className="btn btn-danger btn-sm" onClick={discardWorkout}>Discard</button>
            <button
              className="btn btn-primary btn-sm"
              onClick={() => setShowFinishModal(true)}
            >
              Finish
            </button>
          </div>
        </div>
      </div>

      {/* Exercises */}
      <div className={styles.exerciseList}>
        {exercises.map((ex, exIdx) => (
          <div key={ex.id} className={styles.exerciseCard}>
            <div className={styles.exerciseHeader}>
              <div>
                <span className={styles.exName}>{ex.name}</span>
                <span className={styles.exCategory}>{ex.category}</span>
              </div>
              <button
                className="btn-icon"
                onClick={() => removeExercise(ex.id)}
                title="Remove exercise"
              >
                <svg viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>
              </button>
            </div>

            {/* Set headers */}
            <div className={styles.setHeader}>
              <span style={{ width: 28 }}>#</span>
              <span style={{ flex: 1, textAlign: 'center' }}>
                {settings.unit === 'kg' ? 'KG' : 'LBS'}
              </span>
              <span style={{ flex: 1, textAlign: 'center' }}>REPS</span>
              <span style={{ width: 28, textAlign: 'center' }}></span>
              <span style={{ width: 40, textAlign: 'center' }}>DONE</span>
              <span style={{ width: 24 }} />
            </div>

            {ex.sets.map((s, sIdx) => (
              <div
                key={s.id}
                className={[
                  styles.setRow,
                  s.completed ? styles.setCompleted : '',
                  s.isWarmup ? styles.setWarmup : '',
                ].filter(Boolean).join(' ')}
              >
                {/* Set number / warmup toggle */}
                <button
                  className={styles.setNumBtn}
                  onClick={() => toggleWarmup(ex.id, s.id)}
                  title={s.isWarmup ? 'Warmup set — click to make working set' : 'Working set — click to make warmup'}
                >
                  {s.isWarmup ? (
                    <span className={styles.warmupW}>W</span>
                  ) : (
                    <span className={styles.setNum}>{sIdx + 1}</span>
                  )}
                </button>

                <input
                  type="number"
                  className={styles.setInput}
                  value={s.weight === 0 ? '' : s.weight}
                  placeholder="0"
                  min="0"
                  step="0.5"
                  onChange={e => updateSet(ex.id, s.id, 'weight', e.target.value)}
                />
                <input
                  type="number"
                  className={styles.setInput}
                  value={s.reps === 0 ? '' : s.reps}
                  placeholder="0"
                  min="0"
                  onChange={e => updateSet(ex.id, s.id, 'reps', e.target.value)}
                />

                {/* Rep timer play button */}
                <button
                  className={styles.playRepBtn}
                  onClick={() => setRepTimerTarget({ exId: ex.id, setId: s.id, exerciseName: ex.name, setNum: sIdx + 1, targetReps: s.reps || 10 })}
                  title="Start rep timer"
                >
                  <svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor">
                    <polygon points="5 3 19 12 5 21 5 3"/>
                  </svg>
                </button>

                <button
                  className={[
                    styles.checkBtn,
                    s.completed ? styles.checkBtnDone : '',
                    s.isWarmup ? styles.checkBtnWarmup : '',
                  ].filter(Boolean).join(' ')}
                  onClick={() => !s.isWarmup && toggleSetComplete(ex.id, s.id)}
                  title={s.isWarmup ? 'Warmup sets are not tracked' : 'Mark complete'}
                  style={s.isWarmup ? { opacity: 0.35, cursor: 'default' } : {}}
                >
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </button>
                <button
                  className={styles.removeSetBtn}
                  onClick={() => removeSet(ex.id, s.id)}
                  disabled={ex.sets.length <= 1}
                  title="Remove set"
                >
                  <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
            ))}

            <button
              className={styles.addSetBtn}
              onClick={() => addSet(ex.id)}
            >
              + Add Set
            </button>
          </div>
        ))}
      </div>

      {/* Add exercise */}
      <div className={styles.addExerciseWrap}>
        <button
          className={`btn btn-secondary`}
          style={{ width: '100%' }}
          onClick={() => setShowExercisePicker(true)}
        >
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Add Exercise
        </button>
      </div>

      {/* Exercise picker modal */}
      {showExercisePicker && (
        <div className="modal-overlay" onClick={() => setShowExercisePicker(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">Add Exercise</span>
              <button className="modal-close" onClick={() => setShowExercisePicker(false)}>
                <svg viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <input
              className={styles.searchInput}
              placeholder="Search exercises..."
              value={exerciseSearch}
              onChange={e => setExerciseSearch(e.target.value)}
              autoFocus
            />
            <div className={styles.categoryTabs}>
              {['All', ...ALL_CATEGORIES].map(cat => (
                <button
                  key={cat}
                  className={`${styles.catTab}${selectedCategory === cat ? ' ' + styles.catTabActive : ''}`}
                  onClick={() => setSelectedCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
            <div className={styles.exercisePickerList}>
              {filtered.map(ex => (
                <button
                  key={ex.name}
                  className={`${styles.exercisePickerItem}${existingNames.has(ex.name) ? ' ' + styles.exercisePickerAdded : ''}`}
                  onClick={() => !existingNames.has(ex.name) && addExercise(ex.name, ex.category)}
                >
                  <div>
                    <div className={styles.pickerName}>{ex.name}</div>
                    <div className={styles.pickerCat}>{ex.category}</div>
                  </div>
                  {existingNames.has(ex.name) ? (
                    <span className={styles.addedTag}>Added</span>
                  ) : (
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                      <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                    </svg>
                  )}
                </button>
              ))}
              {filtered.length === 0 && exerciseSearch && (
                <div className={styles.noResults}>
                  <p>No exercise found for "{exerciseSearch}"</p>
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => {
                      saveCustomExercise({ name: exerciseSearch, category: selectedCategory === 'All' ? 'Other' : selectedCategory })
                      addExercise(exerciseSearch, selectedCategory === 'All' ? 'Other' : selectedCategory)
                    }}
                    style={{ marginTop: 8 }}
                  >
                    Add "{exerciseSearch}" as custom
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Finish workout modal */}
      {showFinishModal && (
        <div className="modal-overlay modal-centered" onClick={() => setShowFinishModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">Finish Workout</span>
              <button className="modal-close" onClick={() => setShowFinishModal(false)}>
                <svg viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>

            <div className={styles.finishSummary}>
              <div className={styles.finishStat}>
                <span className={styles.finishStatVal}>{formatTime(seconds)}</span>
                <span className={styles.finishStatLabel}>Duration</span>
              </div>
              <div className={styles.finishStat}>
                <span className={styles.finishStatVal}>{exercises.length}</span>
                <span className={styles.finishStatLabel}>Exercises</span>
              </div>
              <div className={styles.finishStat}>
                <span className={styles.finishStatVal}>{completedSets}</span>
                <span className={styles.finishStatLabel}>Sets Done</span>
              </div>
            </div>

            <div className="form-field" style={{ marginTop: 16 }}>
              <label className="form-label">Notes</label>
              <textarea
                rows={2}
                placeholder="How did it go?"
                value={workoutNotes}
                onChange={e => setWorkoutNotes(e.target.value)}
                style={{ width: '100%', resize: 'none' }}
              />
            </div>

            <div className={styles.saveTemplateRow}>
              <label className={styles.checkLabel}>
                <input
                  type="checkbox"
                  checked={savingTemplate}
                  onChange={e => setSavingTemplate(e.target.checked)}
                />
                Save as template
              </label>
              {savingTemplate && (
                <input
                  placeholder="Template name"
                  value={templateName}
                  onChange={e => setTemplateName(e.target.value)}
                  style={{ marginTop: 8, width: '100%' }}
                />
              )}
            </div>

            <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
              <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setShowFinishModal(false)}>
                Continue
              </button>
              <button
                className="btn btn-primary"
                style={{ flex: 2 }}
                onClick={finishWorkout}
              >
                Save Workout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rep Timer Modal */}
      {repTimerTarget && (
        <RepTimerModal
          exerciseName={repTimerTarget.exerciseName}
          setNum={repTimerTarget.setNum}
          targetReps={repTimerTarget.targetReps}
          onComplete={() => {
            toggleSetComplete(repTimerTarget.exId, repTimerTarget.setId)
            setRepTimerTarget(null)
          }}
          onClose={() => setRepTimerTarget(null)}
        />
      )}

      {/* Rest Timer Banner */}
      {showRestTimer && (
        <RestTimerBanner onDismiss={() => {
          setShowRestTimer(false)
          lastCompletedRef.current = null
        }} />
      )}
    </div>
  )
}
