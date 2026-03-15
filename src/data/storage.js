// ─── Exercise Library ───────────────────────────────────────────────────────
export const EXERCISES = {
  Chest: ['Bench Press', 'Incline Press', 'Chest Fly', 'Push-Up', 'Cable Crossover'],
  Back: ['Deadlift', 'Pull-Up', 'Barbell Row', 'Lat Pulldown', 'Face Pull', 'Seated Row'],
  Legs: ['Squat', 'Leg Press', 'Romanian Deadlift', 'Leg Curl', 'Leg Extension', 'Calf Raise'],
  Shoulders: ['Overhead Press', 'Lateral Raise', 'Front Raise', 'Rear Delt Fly', 'Shrug'],
  Arms: ['Bicep Curl', 'Hammer Curl', 'Tricep Pushdown', 'Skull Crusher', 'Dips'],
  Core: ['Plank', 'Crunches', 'Russian Twist', 'Hanging Leg Raise', 'Ab Wheel'],
  Cardio: ['Running', 'Cycling', 'Jump Rope', 'Rowing', 'Stair Climber'],
}

export const ALL_EXERCISES = Object.entries(EXERCISES).flatMap(([cat, exs]) =>
  exs.map(name => ({ name, category: cat }))
)

// ─── Sample Data ─────────────────────────────────────────────────────────────
const today = new Date()
const d = (offsetDays) => {
  const dt = new Date(today)
  dt.setDate(dt.getDate() - offsetDays)
  return dt.toISOString().split('T')[0]
}

const SAMPLE_WORKOUTS = [
  {
    id: 'w1',
    date: d(1),
    name: 'Push Day',
    duration: 52,
    notes: 'Felt strong today. Hit a new bench PR!',
    exercises: [
      {
        name: 'Bench Press',
        category: 'Chest',
        sets: [
          { reps: 8, weight: 80, completed: true },
          { reps: 8, weight: 82.5, completed: true },
          { reps: 6, weight: 85, completed: true },
          { reps: 6, weight: 85, completed: true },
        ],
      },
      {
        name: 'Incline Press',
        category: 'Chest',
        sets: [
          { reps: 10, weight: 65, completed: true },
          { reps: 10, weight: 65, completed: true },
          { reps: 8, weight: 67.5, completed: true },
        ],
      },
      {
        name: 'Overhead Press',
        category: 'Shoulders',
        sets: [
          { reps: 8, weight: 52.5, completed: true },
          { reps: 8, weight: 55, completed: true },
          { reps: 6, weight: 57.5, completed: true },
        ],
      },
      {
        name: 'Tricep Pushdown',
        category: 'Arms',
        sets: [
          { reps: 12, weight: 30, completed: true },
          { reps: 12, weight: 32.5, completed: true },
          { reps: 10, weight: 35, completed: true },
        ],
      },
    ],
  },
  {
    id: 'w2',
    date: d(3),
    name: 'Pull Day',
    duration: 60,
    notes: 'Deadlift felt heavy. Focused on form.',
    exercises: [
      {
        name: 'Deadlift',
        category: 'Back',
        sets: [
          { reps: 5, weight: 120, completed: true },
          { reps: 5, weight: 130, completed: true },
          { reps: 3, weight: 140, completed: true },
        ],
      },
      {
        name: 'Pull-Up',
        category: 'Back',
        sets: [
          { reps: 8, weight: 0, completed: true },
          { reps: 8, weight: 0, completed: true },
          { reps: 6, weight: 0, completed: true },
        ],
      },
      {
        name: 'Barbell Row',
        category: 'Back',
        sets: [
          { reps: 10, weight: 70, completed: true },
          { reps: 10, weight: 72.5, completed: true },
          { reps: 8, weight: 75, completed: true },
        ],
      },
      {
        name: 'Bicep Curl',
        category: 'Arms',
        sets: [
          { reps: 12, weight: 20, completed: true },
          { reps: 12, weight: 22.5, completed: true },
          { reps: 10, weight: 22.5, completed: true },
        ],
      },
    ],
  },
  {
    id: 'w3',
    date: d(5),
    name: 'Leg Day',
    duration: 65,
    notes: '',
    exercises: [
      {
        name: 'Squat',
        category: 'Legs',
        sets: [
          { reps: 8, weight: 100, completed: true },
          { reps: 8, weight: 105, completed: true },
          { reps: 6, weight: 110, completed: true },
          { reps: 6, weight: 110, completed: true },
        ],
      },
      {
        name: 'Leg Press',
        category: 'Legs',
        sets: [
          { reps: 12, weight: 160, completed: true },
          { reps: 12, weight: 180, completed: true },
          { reps: 10, weight: 200, completed: true },
        ],
      },
      {
        name: 'Romanian Deadlift',
        category: 'Legs',
        sets: [
          { reps: 10, weight: 80, completed: true },
          { reps: 10, weight: 82.5, completed: true },
          { reps: 8, weight: 85, completed: true },
        ],
      },
      {
        name: 'Calf Raise',
        category: 'Legs',
        sets: [
          { reps: 15, weight: 60, completed: true },
          { reps: 15, weight: 60, completed: true },
          { reps: 12, weight: 65, completed: true },
        ],
      },
    ],
  },
  {
    id: 'w4',
    date: d(8),
    name: 'Push Day',
    duration: 48,
    notes: '',
    exercises: [
      {
        name: 'Bench Press',
        category: 'Chest',
        sets: [
          { reps: 8, weight: 77.5, completed: true },
          { reps: 8, weight: 80, completed: true },
          { reps: 6, weight: 82.5, completed: true },
        ],
      },
      {
        name: 'Overhead Press',
        category: 'Shoulders',
        sets: [
          { reps: 8, weight: 50, completed: true },
          { reps: 8, weight: 52.5, completed: true },
          { reps: 6, weight: 55, completed: true },
        ],
      },
      {
        name: 'Tricep Pushdown',
        category: 'Arms',
        sets: [
          { reps: 12, weight: 27.5, completed: true },
          { reps: 12, weight: 30, completed: true },
          { reps: 10, weight: 32.5, completed: true },
        ],
      },
    ],
  },
]

const SAMPLE_TEMPLATES = [
  {
    id: 't1',
    name: 'Push Day',
    exercises: [
      { name: 'Bench Press', category: 'Chest', sets: [{ reps: 8, weight: 80 }, { reps: 8, weight: 80 }, { reps: 6, weight: 85 }, { reps: 6, weight: 85 }] },
      { name: 'Incline Press', category: 'Chest', sets: [{ reps: 10, weight: 65 }, { reps: 10, weight: 65 }, { reps: 8, weight: 67.5 }] },
      { name: 'Overhead Press', category: 'Shoulders', sets: [{ reps: 8, weight: 52.5 }, { reps: 8, weight: 55 }, { reps: 6, weight: 57.5 }] },
      { name: 'Lateral Raise', category: 'Shoulders', sets: [{ reps: 15, weight: 12 }, { reps: 15, weight: 12 }, { reps: 12, weight: 14 }] },
      { name: 'Tricep Pushdown', category: 'Arms', sets: [{ reps: 12, weight: 30 }, { reps: 12, weight: 32.5 }, { reps: 10, weight: 35 }] },
    ],
  },
  {
    id: 't2',
    name: 'Pull Day',
    exercises: [
      { name: 'Deadlift', category: 'Back', sets: [{ reps: 5, weight: 120 }, { reps: 5, weight: 130 }, { reps: 3, weight: 140 }] },
      { name: 'Pull-Up', category: 'Back', sets: [{ reps: 8, weight: 0 }, { reps: 8, weight: 0 }, { reps: 6, weight: 0 }] },
      { name: 'Barbell Row', category: 'Back', sets: [{ reps: 10, weight: 70 }, { reps: 10, weight: 72.5 }, { reps: 8, weight: 75 }] },
      { name: 'Face Pull', category: 'Back', sets: [{ reps: 15, weight: 25 }, { reps: 15, weight: 25 }, { reps: 12, weight: 27.5 }] },
      { name: 'Bicep Curl', category: 'Arms', sets: [{ reps: 12, weight: 20 }, { reps: 12, weight: 22.5 }, { reps: 10, weight: 22.5 }] },
    ],
  },
  {
    id: 't3',
    name: 'Leg Day',
    exercises: [
      { name: 'Squat', category: 'Legs', sets: [{ reps: 8, weight: 100 }, { reps: 8, weight: 105 }, { reps: 6, weight: 110 }, { reps: 6, weight: 110 }] },
      { name: 'Leg Press', category: 'Legs', sets: [{ reps: 12, weight: 160 }, { reps: 12, weight: 180 }, { reps: 10, weight: 200 }] },
      { name: 'Romanian Deadlift', category: 'Legs', sets: [{ reps: 10, weight: 80 }, { reps: 10, weight: 82.5 }, { reps: 8, weight: 85 }] },
      { name: 'Leg Curl', category: 'Legs', sets: [{ reps: 12, weight: 40 }, { reps: 12, weight: 42.5 }, { reps: 10, weight: 45 }] },
      { name: 'Calf Raise', category: 'Legs', sets: [{ reps: 15, weight: 60 }, { reps: 15, weight: 60 }, { reps: 12, weight: 65 }] },
    ],
  },
]

const SAMPLE_BODY_STATS = [
  { date: d(30), weight: 79.5, bodyFat: 16.2, notes: 'Start of the month' },
  { date: d(25), weight: 79.1, bodyFat: 16.0, notes: '' },
  { date: d(20), weight: 78.8, bodyFat: 15.8, notes: 'Feeling leaner' },
  { date: d(15), weight: 78.6, bodyFat: 15.5, notes: '' },
  { date: d(10), weight: 78.2, bodyFat: 15.2, notes: '' },
  { date: d(5), weight: 78.0, bodyFat: 14.9, notes: 'Progress continues' },
  { date: d(1), weight: 77.8, bodyFat: 14.7, notes: '' },
]

// ─── Storage helpers ─────────────────────────────────────────────────────────
function get(key) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function set(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // ignore storage errors
  }
}

// ─── Initialize sample data ───────────────────────────────────────────────────
export function initSampleData() {
  if (!get('wt_workouts')) set('wt_workouts', SAMPLE_WORKOUTS)
  if (!get('wt_templates')) set('wt_templates', SAMPLE_TEMPLATES)
  if (!get('wt_body_stats')) set('wt_body_stats', SAMPLE_BODY_STATS)
  if (!get('wt_settings')) set('wt_settings', { unit: 'kg' })
  if (!get('wt_exercises')) set('wt_exercises', [])
}

// ─── Workouts ─────────────────────────────────────────────────────────────────
export function getWorkouts() {
  return get('wt_workouts') || []
}

export function saveWorkout(workout) {
  const workouts = getWorkouts()
  const idx = workouts.findIndex(w => w.id === workout.id)
  if (idx >= 0) {
    workouts[idx] = workout
  } else {
    workouts.unshift(workout)
  }
  set('wt_workouts', workouts)
}

export function deleteWorkout(id) {
  const workouts = getWorkouts().filter(w => w.id !== id)
  set('wt_workouts', workouts)
}

// ─── Templates ───────────────────────────────────────────────────────────────
export function getTemplates() {
  return get('wt_templates') || []
}

export function saveTemplate(template) {
  const templates = getTemplates()
  const idx = templates.findIndex(t => t.id === template.id)
  if (idx >= 0) {
    templates[idx] = template
  } else {
    templates.push(template)
  }
  set('wt_templates', templates)
}

export function deleteTemplate(id) {
  const templates = getTemplates().filter(t => t.id !== id)
  set('wt_templates', templates)
}

// ─── Body Stats ───────────────────────────────────────────────────────────────
export function getBodyStats() {
  return get('wt_body_stats') || []
}

export function saveBodyStat(stat) {
  const stats = getBodyStats()
  const idx = stats.findIndex(s => s.date === stat.date)
  if (idx >= 0) {
    stats[idx] = stat
  } else {
    stats.push(stat)
    stats.sort((a, b) => a.date.localeCompare(b.date))
  }
  set('wt_body_stats', stats)
}

export function deleteBodyStat(date) {
  const stats = getBodyStats().filter(s => s.date !== date)
  set('wt_body_stats', stats)
}

// ─── Settings ────────────────────────────────────────────────────────────────
export function getSettings() {
  return get('wt_settings') || { unit: 'kg' }
}

export function saveSettings(settings) {
  set('wt_settings', settings)
}

// ─── Custom Exercises ─────────────────────────────────────────────────────────
export function getCustomExercises() {
  return get('wt_exercises') || []
}

export function saveCustomExercise(ex) {
  const exercises = getCustomExercises()
  if (!exercises.find(e => e.name === ex.name)) {
    exercises.push(ex)
    set('wt_exercises', exercises)
  }
}

// ─── Stats helpers ────────────────────────────────────────────────────────────
export function computeStreak(workouts) {
  if (!workouts.length) return 0
  const dates = [...new Set(workouts.map(w => w.date))].sort().reverse()
  const today = new Date().toISOString().split('T')[0]
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]
  if (dates[0] !== today && dates[0] !== yesterday) return 0
  let streak = 0
  let current = dates[0] === today ? today : yesterday
  for (const date of dates) {
    if (date === current) {
      streak++
      const d = new Date(current)
      d.setDate(d.getDate() - 1)
      current = d.toISOString().split('T')[0]
    } else if (date < current) {
      break
    }
  }
  return streak
}

export function computeMonthlyVolume(workouts, unit) {
  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]
  return workouts
    .filter(w => w.date >= monthStart)
    .reduce((total, w) => {
      const vol = w.exercises.reduce((et, ex) => {
        return et + ex.sets.filter(s => s.completed && !s.isWarmup).reduce((st, s) => st + (s.reps * s.weight), 0)
      }, 0)
      return total + vol
    }, 0)
}

export function computePersonalRecords(workouts) {
  const prs = {}
  for (const workout of workouts) {
    for (const exercise of workout.exercises) {
      const maxWeight = Math.max(...exercise.sets.filter(s => s.completed && !s.isWarmup && s.weight > 0).map(s => s.weight), 0)
      if (maxWeight > 0) {
        if (!prs[exercise.name] || maxWeight > prs[exercise.name].weight) {
          prs[exercise.name] = { weight: maxWeight, date: workout.date }
        }
      }
    }
  }
  return prs
}

export function getExerciseHistory(workouts, exerciseName) {
  const history = []
  for (const workout of [...workouts].sort((a, b) => a.date.localeCompare(b.date))) {
    for (const ex of workout.exercises) {
      if (ex.name === exerciseName) {
        const maxWeight = Math.max(...ex.sets.filter(s => s.completed).map(s => s.weight), 0)
        const maxReps = Math.max(...ex.sets.filter(s => s.completed).map(s => s.reps), 0)
        if (maxWeight > 0 || maxReps > 0) {
          history.push({ date: workout.date, weight: maxWeight, reps: maxReps })
        }
      }
    }
  }
  return history
}

export function generateId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36)
}

export function formatDate(dateStr) {
  const d = new Date(dateStr + 'T12:00:00')
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
}

export function formatDateShort(dateStr) {
  const d = new Date(dateStr + 'T12:00:00')
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}
