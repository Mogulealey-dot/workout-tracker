import { useState } from 'react'
import styles from './ExerciseLibrary.module.css'
import { EXERCISES, getCustomExercises, saveCustomExercise, generateId } from '../data/storage'

const CATEGORY_EMOJIS = {
  Chest: '💪',
  Back: '🏋️',
  Legs: '🦵',
  Shoulders: '🔝',
  Arms: '💪',
  Core: '⚡',
  Cardio: '🏃',
}

export default function ExerciseLibrary({ onSelectExercise }) {
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [showAddCustom, setShowAddCustom] = useState(false)
  const [customName, setCustomName] = useState('')
  const [customCategory, setCustomCategory] = useState('Chest')

  const customExercises = getCustomExercises()
  const allExercises = [
    ...Object.entries(EXERCISES).flatMap(([cat, names]) => names.map(n => ({ name: n, category: cat, custom: false }))),
    ...customExercises.map(e => ({ ...e, custom: true })),
  ]

  const filtered = allExercises.filter(ex => {
    const matchSearch = ex.name.toLowerCase().includes(search.toLowerCase())
    const matchCat = selectedCategory === 'All' || ex.category === selectedCategory
    return matchSearch && matchCat
  })

  const grouped = {}
  for (const ex of filtered) {
    if (!grouped[ex.category]) grouped[ex.category] = []
    grouped[ex.category].push(ex)
  }

  const handleAddCustom = () => {
    if (!customName.trim()) return
    const ex = { name: customName.trim(), category: customCategory }
    saveCustomExercise(ex)
    setCustomName('')
    setShowAddCustom(false)
  }

  const cats = ['All', ...Object.keys(EXERCISES), ...(customExercises.length ? ['Custom'] : [])]

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Exercise Library</div>
          <div className="page-subtitle">{allExercises.length} exercises</div>
        </div>
        <button className="btn btn-secondary btn-sm" onClick={() => setShowAddCustom(true)}>
          + Custom
        </button>
      </div>

      <div style={{ padding: '0 16px 8px' }}>
        <input
          placeholder="Search exercises..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ width: '100%', borderRadius: 10 }}
        />
      </div>

      <div className={styles.categoryScroll}>
        {cats.map(cat => (
          <button
            key={cat}
            className={`${styles.catBtn}${selectedCategory === cat ? ' ' + styles.catBtnActive : ''}`}
            onClick={() => setSelectedCategory(cat)}
          >
            {cat !== 'All' && cat !== 'Custom' && <span>{CATEGORY_EMOJIS[cat]}</span>}
            {cat}
          </button>
        ))}
      </div>

      <div className={styles.exerciseListWrap}>
        {Object.entries(grouped).map(([category, exercises]) => (
          <div key={category}>
            <div className={styles.catLabel}>
              <span>{CATEGORY_EMOJIS[category]}</span>
              <span>{category}</span>
              <span className={styles.catCount}>{exercises.length}</span>
            </div>
            {exercises.map(ex => (
              <div
                key={ex.name}
                className={styles.exerciseItem}
                onClick={() => onSelectExercise && onSelectExercise(ex)}
              >
                <div>
                  <div className={styles.exerciseName}>{ex.name}</div>
                  {ex.custom && <span className={styles.customBadge}>Custom</span>}
                </div>
                {onSelectExercise && (
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                  </svg>
                )}
              </div>
            ))}
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="empty-state">
            <svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <h3>No exercises found</h3>
            <p>Try a different search or category</p>
          </div>
        )}
      </div>

      {showAddCustom && (
        <div className="modal-overlay modal-centered" onClick={() => setShowAddCustom(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">Add Custom Exercise</span>
              <button className="modal-close" onClick={() => setShowAddCustom(false)}>
                <svg viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <div className="form-field">
              <label className="form-label">Exercise Name</label>
              <input
                placeholder="e.g. Cable Fly"
                value={customName}
                onChange={e => setCustomName(e.target.value)}
                autoFocus
              />
            </div>
            <div className="form-field">
              <label className="form-label">Category</label>
              <select value={customCategory} onChange={e => setCustomCategory(e.target.value)}>
                {Object.keys(EXERCISES).map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setShowAddCustom(false)}>Cancel</button>
              <button className="btn btn-primary" style={{ flex: 2 }} onClick={handleAddCustom} disabled={!customName.trim()}>
                Add Exercise
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
