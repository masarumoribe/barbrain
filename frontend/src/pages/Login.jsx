import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const { user } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  if (user) {
    return <Navigate to="/" replace />
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setLoading(true)
    setError('')

    const { error: authError } = await supabase.auth.signInWithPassword({ email, password })

    if (authError) {
      setError(authError.message)
    }

    setLoading(false)
  }

  return (
    <div style={styles.page}>
      <form style={styles.card} onSubmit={handleSubmit}>
        <h1 style={styles.title}>Sign in</h1>
        <p style={styles.subtitle}>
          Sign in with the email and password provided by your bar manager.
        </p>

        <label style={styles.label}>
          Email
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            autoComplete="email"
            style={styles.input}
          />
        </label>

        <label style={styles.label}>
          Password
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            autoComplete="current-password"
            style={styles.input}
          />
        </label>

        {error && <p style={styles.error}>{error}</p>}

        <button type="submit" style={styles.button} disabled={loading}>
          {loading ? 'Please wait...' : 'Sign in'}
        </button>
      </form>
    </div>
  )
}

const styles = {
  page: {
    minHeight: 'calc(100vh - 64px)',
    display: 'grid',
    placeItems: 'center',
    padding: '1rem',
  },
  card: {
    width: '100%',
    maxWidth: '420px',
    backgroundColor: '#161616',
    border: '1px solid #2a2a2a',
    borderRadius: '12px',
    padding: '1.5rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.85rem',
  },
  title: {
    margin: 0,
    color: '#ffffff',
    fontSize: '1.5rem',
  },
  subtitle: {
    margin: 0,
    color: '#888888',
    fontSize: '0.95rem',
  },
  label: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.35rem',
    color: '#e5e5e5',
    fontSize: '0.9rem',
  },
  input: {
    borderRadius: '8px',
    border: '1px solid #2f2f2f',
    backgroundColor: '#111111',
    color: '#f5f5f5',
    padding: '0.65rem 0.75rem',
  },
  button: {
    marginTop: '0.5rem',
    border: 'none',
    borderRadius: '8px',
    backgroundColor: '#e2b96f',
    color: '#111111',
    fontWeight: 600,
    padding: '0.7rem',
    cursor: 'pointer',
  },
  error: {
    margin: 0,
    color: '#ff7e7e',
    fontSize: '0.9rem',
  },
}
