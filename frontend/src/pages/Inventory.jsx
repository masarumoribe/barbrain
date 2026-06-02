import { useEffect, useState } from 'react'
import { getIngredients, getInventory, upsertInventory, createIngredient } from '../api/client'

export default function Inventory() {
  const [ingredients, setIngredients] = useState([])
  const [inventory, setInventory] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [saving, setSaving] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [newIng, setNewIng] = useState({ name: '', category: 'spirit', unit: 'ml' })
  const [adding, setAdding] = useState(false)

  useEffect(() => {
    Promise.all([getIngredients(), getInventory()])
      .then(([ingRes, invRes]) => {
        setIngredients(ingRes.data)

        // Convert inventory array into a map keyed by ingredient_id
        // so we can look up quantities easily: inventory[id]
        const invMap = {}
        invRes.data.forEach(row => {
          invMap[row.ingredient_id] = {
            quantity: row.quantity_on_hand,
            low_threshold: row.low_threshold,
          }
        })
        setInventory(invMap)
      })
      .catch(() => setError('Failed to load inventory'))
      .finally(() => setLoading(false))
  }, [])

  const handleQuantityChange = (ingredientId, value) => {
    setInventory(prev => ({
      ...prev,
      [ingredientId]: {
        ...prev[ingredientId],
        quantity: value,
      }
    }))
  }

  const handleThresholdChange = (ingredientId, value) => {
    setInventory(prev => ({
      ...prev,
      [ingredientId]: {
        ...prev[ingredientId],
        low_threshold: value,
      }
    }))
  }

  const handleSave = async (ingredientId) => {
    setSaving(ingredientId)
    const current = {
      quantity: parseFloat(inventory[ingredientId]?.quantity) || 0,
      low_threshold: inventory[ingredientId]?.low_threshold || 50,
    }
    try {
      await upsertInventory(ingredientId, current.quantity, current.low_threshold)
      // Update local state with the saved values so subsequent saves work
      setInventory(prev => ({
        ...prev,
        [ingredientId]: current,
      }))
    } catch {
      alert('Failed to save')
    } finally {
      setSaving(null)
    }
  }

  const handleAddIngredient = async () => {
    if (!newIng.name.trim()) return
    setAdding(true)
    try {
      const res = await createIngredient(newIng.name, newIng.category, newIng.unit)
      // Add new ingredient to local state immediately
      setIngredients(prev => [...prev, res.data])
      setNewIng({ name: '', category: 'spirit', unit: 'ml' })
      setShowForm(false)
    } catch {
      alert('Failed to add ingredient — it may already exist')
    } finally {
      setAdding(false)
    }
  }

  const getStatus = (ingredientId) => {
    const inv = inventory[ingredientId]
    const qty = parseFloat(inv?.quantity) 
    if (!inv || isNaN(qty) || qty === 0) return 'out'
    if (qty <= (inv.low_threshold ?? 50)) return 'low'
    return 'ok'
  }

  if (loading) return <p style={styles.message}>Loading inventory...</p>
  if (error)   return <p style={styles.message}>{error}</p>

  // Group ingredients by category
  const CATEGORY_ORDER = ['spirit', 'liqueur', 'beer', 'wine', 'juice', 'syrup', 'bitter', 'other']

  const grouped = CATEGORY_ORDER.reduce((acc, cat) => {
    const items = ingredients.filter(ing => ing.category === cat).sort((a, b) => a.name.localeCompare(b.name))
    if (items.length > 0) acc[cat] = items
    return acc
  }, {})

  return (
    <div>
      <h1 style={styles.title}>Inventory</h1>
      <div style={styles.formRow}>
        <button
          onClick={() => setShowForm(prev => !prev)}
          style={styles.addButton}
        >
          {showForm ? 'Cancel' : '+ Add Ingredient'}
        </button>
      </div>

      {showForm && (
        <div style={styles.form}>
          <input
            type="text"
            placeholder="Ingredient name"
            value={newIng.name}
            onChange={e => setNewIng(prev => ({ ...prev, name: e.target.value }))}
            style={styles.formInput}
          />
          <select
            value={newIng.category}
            onChange={e => setNewIng(prev => ({ ...prev, category: e.target.value }))}
            style={styles.formInput}
          >
            <option value="spirit">Spirit</option>
            <option value="liqueur">Liqueur</option>
            <option value="beer">Beer</option>
            <option value="wine">Wine</option>
            <option value="juice">Juice</option>
            <option value="syrup">Syrup</option>
            <option value="bitter">Bitter</option>
            <option value="other">Other</option>
          </select>
          <select
            value={newIng.unit}
            onChange={e => setNewIng(prev => ({ ...prev, unit: e.target.value }))}
            style={styles.formInput}
          >
            <option value="ml">ml</option>
            <option value="bottle">bottle</option>
            <option value="can">can</option>
            <option value="other">other</option>
            <option value="dash">dash</option>
            <option value="piece">piece</option>
            <option value="oz">oz</option>
          </select>
          <button
            onClick={handleAddIngredient}
            style={styles.addButton}
            disabled={adding}
          >
            {adding ? 'Adding...' : 'Add'}
          </button>
        </div>
      )}

      <p style={styles.subtitle}>
        Track what's behind your bar. Green means stocked, yellow means running low, red means out.
      </p>

      {Object.entries(grouped).map(([category, items]) => (
        <div key={category} style={styles.section}>
          <h2 style={styles.category}>{category}</h2>
          <div style={styles.grid}>
            {items.map(ing => {
              const status = getStatus(ing.id)
              const qty = inventory[ing.id]?.quantity ?? ''
              return (
                <div key={ing.id} style={{
                  ...styles.card,
                  borderColor: statusColor[status],
                }}>
                  <div style={styles.cardHeader}>
                    <span style={styles.ingName}>{ing.name}</span>
                    <span style={{
                      ...styles.dot,
                      backgroundColor: statusColor[status],
                    }} />
                  </div>
                  <div style={styles.inputRow}>
                    <input
                      type="number"
                      min="0"
                      value={qty}
                      onChange={e => handleQuantityChange(ing.id, e.target.value)}
                      style={styles.input}
                      placeholder="0"
                    />
                    <span style={styles.unit}>{ing.unit}</span>
                  </div>
                  <div style={styles.thresholdRow}>
                    <span style={styles.thresholdLabel}>Low at</span>
                    <input
                      type="number"
                      min="0"
                      value={inventory[ing.id]?.low_threshold ?? 50}
                      onChange={e => handleThresholdChange(ing.id, e.target.value)}
                      style={{ ...styles.input, width: '60px' }}
                      placeholder="50"
                    />
                    <span style={styles.unit}>{ing.unit}</span>
                    <button
                      onClick={() => handleSave(ing.id)}
                      style={styles.button}
                      disabled={saving === ing.id}
                    >
                      {saving === ing.id ? '...' : 'Save'}
                    </button>
</div>
                </div>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}

const statusColor = {
  ok:  '#4caf50',
  low: '#ff9800',
  out: '#f44336',
}

const styles = {
  title: {
    color: '#e2b96f',
    marginBottom: '0.5rem',
  },
  subtitle: {
    color: '#aaaaaa',
    marginBottom: '2rem',
    fontSize: '0.9rem',
  },
  section: {
    marginBottom: '2rem',
  },
  category: {
    color: '#e2b96f',
    fontSize: '1rem',
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    marginBottom: '1rem',
    borderBottom: '1px solid #333',
    paddingBottom: '0.5rem',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
    gap: '1rem',
  },
  card: {
    backgroundColor: '#1e1e1e',
    border: '1px solid',
    borderRadius: '10px',
    padding: '1rem',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '0.75rem',
  },
  ingName: {
    color: '#ffffff',
    fontWeight: '500',
  },
  dot: {
    width: '10px',
    height: '10px',
    borderRadius: '50%',
  },
  inputRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  input: {
    width: '70px',
    padding: '0.3rem 0.5rem',
    backgroundColor: '#2d2d2d',
    border: '1px solid #444',
    borderRadius: '6px',
    color: '#ffffff',
    fontSize: '0.9rem',
  },
  unit: {
    color: '#aaaaaa',
    fontSize: '0.85rem',
    flex: 1,
  },
  button: {
    backgroundColor: '#e2b96f',
    color: '#111111',
    border: 'none',
    borderRadius: '6px',
    padding: '0.3rem 0.7rem',
    cursor: 'pointer',
    fontWeight: 'bold',
    fontSize: '0.8rem',
  },
  message: {
    color: '#aaaaaa',
  },
  formRow: {
    marginBottom: '1rem',
  },
  form: {
    display: 'flex',
    gap: '0.75rem',
    alignItems: 'center',
    backgroundColor: '#1e1e1e',
    padding: '1rem',
    borderRadius: '10px',
    marginBottom: '1.5rem',
    flexWrap: 'wrap',
  },
  formInput: {
    padding: '0.4rem 0.6rem',
    backgroundColor: '#2d2d2d',
    border: '1px solid #444',
    borderRadius: '6px',
    color: '#ffffff',
    fontSize: '0.9rem',
  },
  thresholdRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    marginTop: '0.4rem',
  },
  thresholdLabel: {
    color: '#888888',
    fontSize: '0.75rem',
    whiteSpace: 'nowrap',
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
}