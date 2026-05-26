import { useEffect, useState } from 'react'
import { getCocktails, getIngredients, createCocktail, updateCocktail } from '../api/client'

export default function Cocktails() {
  const [cocktails, setCocktails]   = useState([])
  const [ingredients, setIngredients] = useState([])
  const [loading, setLoading]       = useState(true)
  const [error, setError]           = useState(null)
  const [selected, setSelected]     = useState(null)
  const [showForm, setShowForm]     = useState(false)
  const [adding, setAdding]         = useState(false)
  const [newCocktail, setNewCocktail] = useState({
    name: '', description: '', instructions: '',
    glass_type: '', garnish: '', category: 'classic',
    ingredients: [],
  })
  const [editing, setEditing]       = useState(null) // holds the cocktail being edited
  const [editData, setEditData]     = useState({
    name: '', description: '', instructions: '',
    glass_type: '', garnish: '', category: 'classic',
    ingredients: [],
  }) // holds the edit form data
  const [editIngRow, setEditIngRow] = useState({ ingredient_id: '', amount: '', unit: 'ml', is_optional: false })
  const [saving, setSaving]         = useState(false)
  const [newIngRow, setNewIngRow] = useState({
    ingredient_id: '', amount: '', unit: 'ml', is_optional: false,
  })

  useEffect(() => {
    Promise.all([getCocktails(), getIngredients()])
      .then(([cRes, iRes]) => {
        setCocktails(cRes.data.sort((a, b) => a.name.localeCompare(b.name)))
        setIngredients(iRes.data.sort((a, b) => a.name.localeCompare(b.name)))
      })
      .catch(() => setError('Failed to load cocktails'))
      .finally(() => setLoading(false))
  }, [])

  const addIngRow = () => {
    if (!newIngRow.ingredient_id || !newIngRow.amount) return
    setNewCocktail(prev => ({
      ...prev,
      ingredients: [...prev.ingredients, { ...newIngRow, amount: parseFloat(newIngRow.amount) }],
    }))
    setNewIngRow({ ingredient_id: '', amount: '', unit: 'ml', is_optional: false })
  }

  const removeIngRow = (index) => {
    setNewCocktail(prev => ({
      ...prev,
      ingredients: prev.ingredients.filter((_, i) => i !== index),
    }))
  }

  const handleAddCocktail = async () => {
    if (!newCocktail.name.trim() || newCocktail.ingredients.length === 0) {
      alert('Name and at least one ingredient are required')
      return
    }
    setAdding(true)
    try {
      const res = await createCocktail(newCocktail)
      setCocktails(prev => [...prev, res.data].sort((a, b) => a.name.localeCompare(b.name)))
      setNewCocktail({
        name: '', description: '', instructions: '',
        glass_type: '', garnish: '', category: 'classic',
        ingredients: [],
      })
      setShowForm(false)
    } catch {
      alert('Failed to add cocktail — it may already exist')
    } finally {
      setAdding(false)
    }
  }
  const startEdit = (cocktail, e) => {
    e.stopPropagation() // prevent card toggle
    setEditing(cocktail.id)
    setEditData({
      name:         cocktail.name,
      description:  cocktail.description,
      instructions: cocktail.instructions,
      glass_type:   cocktail.glass_type,
      garnish:      cocktail.garnish,
      category:     cocktail.category,
      ingredients:  cocktail.cocktail_ingredients.map(ci => ({
        ingredient_id: ci.ingredients?.id || '',
        amount:        ci.amount,
        unit:          ci.unit,
        is_optional:   ci.is_optional,
      })),
    })
  }
  
  const addEditIngRow = () => {
    if (!editIngRow.ingredient_id || !editIngRow.amount) return
    setEditData(prev => ({
      ...prev,
      ingredients: [...prev.ingredients, { ...editIngRow, amount: parseFloat(editIngRow.amount) }],
    }))
    setEditIngRow({ ingredient_id: '', amount: '', unit: 'ml', is_optional: false })
  }
  
  const removeEditIngRow = (index) => {
    setEditData(prev => ({
      ...prev,
      ingredients: prev.ingredients.filter((_, i) => i !== index),
    }))
  }
  
  const handleUpdate = async (cocktailId) => {
    if (!editData.name.trim() || editData.ingredients.length === 0) {
      alert('Name and at least one ingredient are required')
      return
    }
    setSaving(true)
    try {
      const res = await updateCocktail(cocktailId, editData)
      setCocktails(prev =>
        [...prev.map(c => c.id === cocktailId ? res.data : c)]
          .sort((a, b) => a.name.localeCompare(b.name))
      )
      setEditing(null)
      setEditData(null)
      setSelected(null)
    } catch {
      alert('Failed to update cocktail')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <p style={styles.message}>Loading cocktails...</p>
  if (error)   return <p style={styles.message}>{error}</p>

  return (
    <div>
      <h1 style={styles.title}>Cocktails</h1>

      {/* Add cocktail button */}
      <div style={{ marginBottom: '1rem' }}>
        <button
          onClick={() => setShowForm(prev => !prev)}
          style={styles.addButton}
        >
          {showForm ? 'Cancel' : '+ Add Cocktail'}
        </button>
      </div>

      {/* Add cocktail form */}
      {showForm && (
        <div style={styles.form}>
          <h3 style={styles.formTitle}>New Cocktail</h3>

          <div style={styles.formGrid}>
            <input
              placeholder="Name"
              value={newCocktail.name}
              onChange={e => setNewCocktail(p => ({ ...p, name: e.target.value }))}
              style={styles.formInput}
            />
            <input
              placeholder="Description"
              value={newCocktail.description}
              onChange={e => setNewCocktail(p => ({ ...p, description: e.target.value }))}
              style={styles.formInput}
            />
            <input
              placeholder="Glass type (e.g. coupe, rocks)"
              value={newCocktail.glass_type}
              onChange={e => setNewCocktail(p => ({ ...p, glass_type: e.target.value }))}
              style={styles.formInput}
            />
            <input
              placeholder="Garnish"
              value={newCocktail.garnish}
              onChange={e => setNewCocktail(p => ({ ...p, garnish: e.target.value }))}
              style={styles.formInput}
            />
            <select
              value={newCocktail.category}
              onChange={e => setNewCocktail(p => ({ ...p, category: e.target.value }))}
              style={styles.formInput}
            >
              <option value="classic">Classic</option>
              <option value="modern">Modern</option>
              <option value="sour">Sour</option>
              <option value="tiki">Tiki</option>
              <option value="stirred">Stirred</option>
              <option value="other">Other</option>
            </select>
          </div>

          <textarea
            placeholder="Instructions — describe the steps to make this cocktail"
            value={newCocktail.instructions}
            onChange={e => setNewCocktail(p => ({ ...p, instructions: e.target.value }))}
            style={styles.textarea}
            rows={3}
          />

          {/* Ingredient rows */}
          <h4 style={styles.formSubtitle}>Ingredients</h4>
          {newCocktail.ingredients.map((row, i) => {
            const ing = ingredients.find(x => x.id === row.ingredient_id)
            return (
              <div key={i} style={styles.ingRow}>
                <span style={styles.ingRowText}>
                  {ing?.name} — {row.amount} {row.unit}
                  {row.is_optional ? ' (optional)' : ''}
                </span>
                <button onClick={() => removeIngRow(i)} style={styles.removeButton}>✕</button>
              </div>
            )
          })}

          {/* Add ingredient row */}
          <div style={styles.ingInputRow}>
            <select
              value={newIngRow.ingredient_id}
              onChange={e => setNewIngRow(p => ({ ...p, ingredient_id: e.target.value }))}
              style={styles.formInput}
            >
              <option value="">Select ingredient</option>
              {ingredients.map(ing => (
                <option key={ing.id} value={ing.id}>{ing.name}</option>
              ))}
            </select>
            <input
              type="number"
              placeholder="Amount"
              value={newIngRow.amount}
              onChange={e => setNewIngRow(p => ({ ...p, amount: e.target.value }))}
              style={{ ...styles.formInput, width: '80px' }}
            />
            <select
              value={newIngRow.unit}
              onChange={e => setNewIngRow(p => ({ ...p, unit: e.target.value }))}
              style={styles.formInput}
            >
              <option value="ml">ml</option>
              <option value="dash">dash</option>
              <option value="oz">oz</option>
              <option value="piece">piece</option>
            </select>
            <label style={styles.checkLabel}>
              <input
                type="checkbox"
                checked={newIngRow.is_optional}
                onChange={e => setNewIngRow(p => ({ ...p, is_optional: e.target.checked }))}
              />
              Optional
            </label>
            <button onClick={addIngRow} style={styles.addButton}>+ Add</button>
          </div>

          <button
            onClick={handleAddCocktail}
            style={{ ...styles.addButton, marginTop: '1rem' }}
            disabled={adding}
          >
            {adding ? 'Saving...' : 'Save Cocktail'}
          </button>
        </div>
      )}

      {/* Cocktail grid */}
      <div style={styles.grid}>
      {cocktails.map(cocktail => (
  <div
    key={cocktail.id}
    style={styles.card}
    onClick={() => {
      if (editing === cocktail.id) return
      setSelected(selected?.id === cocktail.id ? null : cocktail)
    }}
  >
    <div style={styles.cardHeader}>
      <h2 style={styles.cardTitle}>{cocktail.name}</h2>
      <button
        onClick={(e) => startEdit(cocktail, e)}
        style={styles.editButton}
      >
        ✏️
      </button>
    </div>
    <span style={styles.badge}>{cocktail.category}</span>
    <p style={styles.description}>{cocktail.description}</p>

    {/* View mode */}
    {selected?.id === cocktail.id && editing !== cocktail.id && (
      <div style={styles.detail}>
        <p><strong>Glass:</strong> {cocktail.glass_type}</p>
        <p><strong>Garnish:</strong> {cocktail.garnish}</p>
        <div style={{ marginTop: '0.75rem' }}>
          <strong>Recipe:</strong>
          <ul style={styles.recipeList}>
            {cocktail.cocktail_ingredients?.map((ci, i) => (
              <li key={i} style={styles.recipeItem}>
                {ci.amount} {ci.unit} {ci.ingredients?.name}
                {ci.is_optional && <span style={styles.optional}> (optional)</span>}
              </li>
            ))}
          </ul>
        </div>
        <p style={{ marginTop: '0.75rem' }}>
          <strong>Instructions:</strong><br />
          {cocktail.instructions}
        </p>
      </div>
    )}

    {/* Edit mode */}
    {editing === cocktail.id && editData && (
      <div style={styles.detail} onClick={e => e.stopPropagation()}>
        <div style={styles.formGrid}>
          <input
            placeholder="Name"
            value={editData.name}
            onChange={e => setEditData(p => ({ ...p, name: e.target.value }))}
            style={styles.formInput}
          />
          <input
            placeholder="Description"
            value={editData.description}
            onChange={e => setEditData(p => ({ ...p, description: e.target.value }))}
            style={styles.formInput}
          />
          <input
            placeholder="Glass type"
            value={editData.glass_type}
            onChange={e => setEditData(p => ({ ...p, glass_type: e.target.value }))}
            style={styles.formInput}
          />
          <input
            placeholder="Garnish"
            value={editData.garnish}
            onChange={e => setEditData(p => ({ ...p, garnish: e.target.value }))}
            style={styles.formInput}
          />
          <select
            value={editData.category}
            onChange={e => setEditData(p => ({ ...p, category: e.target.value }))}
            style={styles.formInput}
          >
            <option value="classic">Classic</option>
            <option value="modern">Modern</option>
            <option value="sour">Sour</option>
            <option value="tiki">Tiki</option>
            <option value="stirred">Stirred</option>
            <option value="other">Other</option>
          </select>
        </div>

        <textarea
          placeholder="Instructions"
          value={editData.instructions}
          onChange={e => setEditData(p => ({ ...p, instructions: e.target.value }))}
          style={styles.textarea}
          rows={3}
        />

        <h4 style={styles.formSubtitle}>Ingredients</h4>
        {editData.ingredients.map((row, i) => {
          const ing = ingredients.find(x => x.id === row.ingredient_id)
          return (
            <div key={i} style={styles.ingRow}>
              <span style={styles.ingRowText}>
                {ing?.name} — {row.amount} {row.unit}
                {row.is_optional ? ' (optional)' : ''}
              </span>
              <button onClick={() => removeEditIngRow(i)} style={styles.removeButton}>✕</button>
            </div>
          )
        })}

        <div style={styles.ingInputRow}>
          <select
            value={editIngRow.ingredient_id}
            onChange={e => setEditIngRow(p => ({ ...p, ingredient_id: e.target.value }))}
            style={styles.formInput}
          >
            <option value="">Select ingredient</option>
            {ingredients.map(ing => (
              <option key={ing.id} value={ing.id}>{ing.name}</option>
            ))}
          </select>
          <input
            type="number"
            placeholder="Amount"
            value={editIngRow.amount}
            onChange={e => setEditIngRow(p => ({ ...p, amount: e.target.value }))}
            style={{ ...styles.formInput, width: '80px' }}
          />
          <select
            value={editIngRow.unit}
            onChange={e => setEditIngRow(p => ({ ...p, unit: e.target.value }))}
            style={styles.formInput}
          >
            <option value="ml">ml</option>
            <option value="dash">dash</option>
            <option value="oz">oz</option>
            <option value="piece">piece</option>
          </select>
          <label style={styles.checkLabel}>
            <input
              type="checkbox"
              checked={editIngRow.is_optional}
              onChange={e => setEditIngRow(p => ({ ...p, is_optional: e.target.checked }))}
            />
            Optional
          </label>
          <button onClick={addEditIngRow} style={styles.addButton}>+ Add</button>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
          <button
            onClick={() => handleUpdate(cocktail.id)}
            style={styles.addButton}
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
          <button
            onClick={() => { setEditing(null); setEditData(null) }}
            style={styles.cancelButton}
          >
            Cancel
          </button>
        </div>
      </div>
    )}
  </div>
))}
      </div>
    </div>
  )
}

const styles = {
  title: {
    color: '#e2b96f',
    marginBottom: '1rem',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '1.5rem',
  },
  card: {
    backgroundColor: '#1e1e1e',
    border: '1px solid #333',
    borderRadius: '12px',
    padding: '1.5rem',
    cursor: 'pointer',
  },
  cardTitle: {
    color: '#ffffff',
    margin: '0 0 0.5rem 0',
  },
  badge: {
    backgroundColor: '#2d2d2d',
    color: '#e2b96f',
    padding: '0.2rem 0.6rem',
    borderRadius: '20px',
    fontSize: '0.75rem',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  description: {
    color: '#aaaaaa',
    fontSize: '0.9rem',
    marginTop: '0.75rem',
  },
  detail: {
    marginTop: '1rem',
    paddingTop: '1rem',
    borderTop: '1px solid #333',
    color: '#cccccc',
    fontSize: '0.9rem',
    lineHeight: '1.6',
  },
  recipeList: {
    margin: '0.5rem 0 0 0',
    paddingLeft: '1.2rem',
  },
  recipeItem: {
    marginBottom: '0.25rem',
  },
  optional: {
    color: '#888',
    fontSize: '0.8rem',
  },
  message: {
    color: '#aaaaaa',
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
  formTitle: {
    color: '#e2b96f',
    marginTop: 0,
    marginBottom: '1rem',
  },
  formSubtitle: {
    color: '#aaaaaa',
    marginBottom: '0.5rem',
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gap: '0.75rem',
    marginBottom: '0.75rem',
  },
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
    padding: '0.4rem 0.6rem',
    backgroundColor: '#2d2d2d',
    border: '1px solid #444',
    borderRadius: '6px',
    color: '#ffffff',
    fontSize: '0.9rem',
    resize: 'vertical',
    boxSizing: 'border-box',
    marginBottom: '0.75rem',
  },
  ingRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#2d2d2d',
    padding: '0.4rem 0.75rem',
    borderRadius: '6px',
    marginBottom: '0.4rem',
  },
  ingRowText: {
    color: '#cccccc',
    fontSize: '0.9rem',
  },
  removeButton: {
    background: 'none',
    border: 'none',
    color: '#f44336',
    cursor: 'pointer',
    fontSize: '0.9rem',
  },
  ingInputRow: {
    display: 'flex',
    gap: '0.5rem',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginTop: '0.5rem',
  },
  checkLabel: {
    color: '#aaaaaa',
    fontSize: '0.85rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.3rem',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '0.5rem',
  },
  editButton: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: '1rem',
    padding: '0',
  },
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
}