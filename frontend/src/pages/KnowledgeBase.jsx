import { useEffect, useState } from 'react'
import { getKnowledge, createKnowledge, updateKnowledge, deleteKnowledge } from '../api/client'

const CATEGORIES = ['recipes', 'procedures', 'vip', 'menu', 'general']

const emptyForm = { title: '', category: 'procedures', content: '' }

export default function KnowledgeBase() {
  const [entries, setEntries]     = useState([])
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState(null)
  const [showForm, setShowForm]   = useState(false)
  const [form, setForm]           = useState(emptyForm)
  const [editing, setEditing]     = useState(null)
  const [saving, setSaving]       = useState(false)
  const [expanded, setExpanded]   = useState(null)
  const [filter, setFilter]       = useState('all')

  useEffect(() => {
    getKnowledge()
      .then(res => setEntries(res.data))
      .catch(() => setError('Failed to load knowledge base'))
      .finally(() => setLoading(false))
  }, [])

  const handleSave = async () => {
    if (!form.title.trim() || !form.content.trim()) {
      alert('Title and content are required')
      return
    }
    setSaving(true)
    try {
      if (editing) {
        const res = await updateKnowledge(editing, form)
        setEntries(prev => prev.map(e => e.id === editing ? res.data : e))
        setEditing(null)
      } else {
        const res = await createKnowledge(form)
        setEntries(prev => [...prev, res.data])
      }
      setForm(emptyForm)
      setShowForm(false)
    } catch {
      alert('Failed to save entry')
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = (entry) => {
    setEditing(entry.id)
    setForm({ title: entry.title, category: entry.category, content: entry.content })
    setShowForm(true)
    setExpanded(null)
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this entry?')) return
    try {
      await deleteKnowledge(id)
      setEntries(prev => prev.filter(e => e.id !== id))
    } catch {
      alert('Failed to delete entry')
    }
  }

  const handleCancel = () => {
    setShowForm(false)
    setEditing(null)
    setForm(emptyForm)
  }

  const filtered = filter === 'all'
    ? entries
    : entries.filter(e => e.category === filter)

  const grouped = filtered.reduce((acc, entry) => {
    if (!acc[entry.category]) acc[entry.category] = []
    acc[entry.category].push(entry)
    return acc
  }, {})

  if (loading) return <p style={styles.message}>Loading knowledge base...</p>
  if (error)   return <p style={styles.message}>{error}</p>

  return (
    <div>
      <h1 style={styles.title}>Knowledge Base</h1>
      <p style={styles.subtitle}>
        Your bar's central information hub — recipes, procedures, VIP profiles, and more.
      </p>

      {/* Controls */}
      <div style={styles.controls}>
        <div style={styles.filters}>
          {['all', ...CATEGORIES].map(cat => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              style={{
                ...styles.filterBtn,
                ...(filter === cat ? styles.filterBtnActive : {}),
              }}
            >
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
        </div>
        <button
          onClick={() => { setShowForm(prev => !prev); setEditing(null); setForm(emptyForm) }}
          style={styles.addButton}
        >
          {showForm && !editing ? 'Cancel' : '+ Add Entry'}
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div style={styles.form}>
          <h3 style={styles.formTitle}>
            {editing ? 'Edit Entry' : 'New Entry'}
          </h3>
          <div style={styles.formRow}>
            <input
              placeholder="Title (e.g. Closing Procedure, Mr. Smith VIP)"
              value={form.title}
              onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
              style={{ ...styles.formInput, flex: 2 }}
            />
            <select
              value={form.category}
              onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
              style={{ ...styles.formInput, flex: 1 }}
            >
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </option>
              ))}
            </select>
          </div>
          <textarea
            placeholder="Write the full content here — be as detailed as possible. The AI will use this verbatim when answering staff questions."
            value={form.content}
            onChange={e => setForm(p => ({ ...p, content: e.target.value }))}
            style={styles.textarea}
            rows={8}
          />
          <div style={styles.formActions}>
            <button onClick={handleSave} style={styles.addButton} disabled={saving}>
              {saving ? 'Saving...' : editing ? 'Save Changes' : 'Save Entry'}
            </button>
            <button onClick={handleCancel} style={styles.cancelButton}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Entries grouped by category */}
      {Object.entries(grouped).map(([category, items]) => (
        <div key={category} style={styles.section}>
          <h2 style={styles.categoryTitle}>
            {categoryIcon[category]} {category.charAt(0).toUpperCase() + category.slice(1)}
            <span style={styles.count}>{items.length}</span>
          </h2>
          <div style={styles.entryList}>
            {items.map(entry => (
              <div key={entry.id} style={styles.entry}>
                <div
                  style={styles.entryHeader}
                  onClick={() => setExpanded(expanded === entry.id ? null : entry.id)}
                >
                  <span style={styles.entryTitle}>{entry.title}</span>
                  <div style={styles.entryActions}>
                    <button
                      onClick={e => { e.stopPropagation(); handleEdit(entry) }}
                      style={styles.iconButton}
                    >
                      ✏️
                    </button>
                    <button
                      onClick={e => { e.stopPropagation(); handleDelete(entry.id) }}
                      style={styles.iconButton}
                    >
                      🗑️
                    </button>
                    <span style={styles.chevron}>
                      {expanded === entry.id ? '▲' : '▼'}
                    </span>
                  </div>
                </div>
                {expanded === entry.id && (
                  <div style={styles.entryContent}>
                    <p style={styles.contentText}>{entry.content}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}

      {filtered.length === 0 && (
        <p style={styles.message}>
          No entries in this category yet. Add one above.
        </p>
      )}
    </div>
  )
}

const categoryIcon = {
  recipes:    '🍹',
  procedures: '📋',
  vip:        '⭐',
  menu:       '📄',
  general:    '💡',
}

const styles = {
  title: { color: '#e2b96f', marginBottom: '0.5rem' },
  subtitle: { color: '#aaaaaa', fontSize: '0.9rem', marginBottom: '1.5rem' },
  controls: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1.5rem',
    flexWrap: 'wrap',
    gap: '1rem',
  },
  filters: { display: 'flex', gap: '0.5rem', flexWrap: 'wrap' },
  filterBtn: {
    backgroundColor: '#1e1e1e',
    color: '#aaaaaa',
    border: '1px solid #333',
    borderRadius: '20px',
    padding: '0.3rem 0.8rem',
    cursor: 'pointer',
    fontSize: '0.85rem',
  },
  filterBtnActive: {
    backgroundColor: '#e2b96f',
    color: '#111111',
    border: '1px solid #e2b96f',
  },
  addButton: {
    backgroundColor: '#e2b96f',
    color: '#111111',
    border: 'none',
    borderRadius: '6px',
    padding: '0.4rem 0.9rem',
    cursor: 'pointer',
    fontWeight: 'bold',
    fontSize: '0.85rem',
  },
  form: {
    backgroundColor: '#1e1e1e',
    border: '1px solid #333',
    borderRadius: '12px',
    padding: '1.5rem',
    marginBottom: '2rem',
  },
  formTitle: { color: '#e2b96f', marginTop: 0, marginBottom: '1rem' },
  formRow: { display: 'flex', gap: '0.75rem', marginBottom: '0.75rem' },
  formInput: {
    padding: '0.4rem 0.6rem',
    backgroundColor: '#2d2d2d',
    border: '1px solid #444',
    borderRadius: '6px',
    color: '#ffffff',
    fontSize: '0.9rem',
  },
  textarea: {
    width: '100%',
    padding: '0.6rem',
    backgroundColor: '#2d2d2d',
    border: '1px solid #444',
    borderRadius: '6px',
    color: '#ffffff',
    fontSize: '0.9rem',
    resize: 'vertical',
    boxSizing: 'border-box',
    fontFamily: 'sans-serif',
    lineHeight: '1.6',
    marginBottom: '0.75rem',
  },
  formActions: { display: 'flex', gap: '0.75rem' },
  cancelButton: {
    backgroundColor: '#2d2d2d',
    color: '#ffffff',
    border: '1px solid #444',
    borderRadius: '6px',
    padding: '0.4rem 0.9rem',
    cursor: 'pointer',
    fontWeight: 'bold',
    fontSize: '0.85rem',
  },
  section: { marginBottom: '2rem' },
  categoryTitle: {
    color: '#e2b96f',
    fontSize: '1rem',
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    marginBottom: '0.75rem',
    borderBottom: '1px solid #333',
    paddingBottom: '0.5rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  count: {
    backgroundColor: '#2d2d2d',
    color: '#aaaaaa',
    borderRadius: '20px',
    padding: '0.1rem 0.5rem',
    fontSize: '0.75rem',
    fontWeight: 'normal',
    marginLeft: 'auto',
  },
  entryList: { display: 'flex', flexDirection: 'column', gap: '0.5rem' },
  entry: {
    backgroundColor: '#1e1e1e',
    border: '1px solid #333',
    borderRadius: '10px',
    overflow: 'hidden',
  },
  entryHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0.9rem 1rem',
    cursor: 'pointer',
  },
  entryTitle: { color: '#ffffff', fontWeight: '500' },
  entryActions: { display: 'flex', alignItems: 'center', gap: '0.5rem' },
  iconButton: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: '0.9rem',
    padding: '0.2rem',
  },
  chevron: { color: '#aaaaaa', fontSize: '0.75rem', marginLeft: '0.25rem' },
  entryContent: {
    padding: '0 1rem 1rem 1rem',
    borderTop: '1px solid #333',
  },
  contentText: {
    color: '#cccccc',
    fontSize: '0.9rem',
    lineHeight: '1.7',
    whiteSpace: 'pre-wrap',
    margin: '0.75rem 0 0 0',
  },
  message: { color: '#aaaaaa' },
}