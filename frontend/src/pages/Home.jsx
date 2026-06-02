import { useEffect, useState, memo } from 'react'
import { useNavigate } from 'react-router-dom'
import { getStats } from '../api/client'
import CocktailGlass from '../components/CocktailGlass'
import useWindowWidth from '../hooks/useWindowWidth'

const MemoizedCocktailGlass = memo(CocktailGlass)

export default function Home() {
  const [stats, setStats]     = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  const width = useWindowWidth()
  const isMobile = width < 768

  useEffect(() => {
    getStats()
      .then(res => setStats(res.data))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div style={styles.page}>

      {/* Hero */}
      <div style={{
  ...styles.hero,
  flexDirection: isMobile ? 'column' : 'row',
  textAlign: isMobile ? 'center' : 'left',
}}>
  <div style={styles.heroText}>
    <h1 style={{
      ...styles.heroTitle,
      fontSize: isMobile ? '2rem' : '2.8rem',
    }}>
      Your bar,<br />always at hand.
    </h1>
    <p style={{
      ...styles.heroSubtitle,
      maxWidth: isMobile ? '100%' : '380px',
    }}>
      Recipes, inventory, procedures, and AI assistance — everything your team needs in one place.
    </p>
    <button
      onClick={() => navigate('/assistant')}
      style={styles.heroButton}
    >
      Ask the Assistant →
    </button>
  </div>
  {!isMobile && (
    <div style={styles.heroVisual}>
      <MemoizedCocktailGlass />
    </div>
  )}
</div>

      {/* Stats */}
      {!loading && stats && (
        <div style={{
          ...styles.statsRow,
          gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
          gap: isMobile ? '0.5rem' : '1rem',
        }}>
          {[
            { label: 'Cocktails', value: stats.total_cocktails },
            { label: 'Ingredients', value: stats.total_ingredients },
            { label: 'Knowledge Entries', value: stats.total_knowledge },
          ].map(stat => (
            <div key={stat.label} style={styles.statCard}>
              <span style={styles.statNumber}>{stat.value}</span>
              <span style={styles.statLabel}>{stat.label}</span>
            </div>
          ))}
        </div>
      )}

      {/* Stock alerts */}
      {!loading && stats && (stats.low_stock.length > 0 || stats.out_of_stock.length > 0) && (
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>⚠️ Stock Alerts</h2>
          <div style={styles.alertGrid}>
            {stats.out_of_stock.map((item, i) => (
              <div key={i} style={{ ...styles.alertCard, borderLeftColor: '#f44336' }}>
                <div style={{ ...styles.alertIndicator, backgroundColor: '#f44336' }} />
                <div>
                  <p style={styles.alertName}>{item.name}</p>
                  <p style={styles.alertStatus}>Out of stock</p>
                </div>
              </div>
            ))}
            {stats.low_stock.map((item, i) => (
              <div key={i} style={{ ...styles.alertCard, borderLeftColor: '#ff9800' }}>
                <div style={{ ...styles.alertIndicator, backgroundColor: '#ff9800' }} />
                <div>
                  <p style={styles.alertName}>{item.name}</p>
                  <p style={styles.alertStatus}>Low — {item.quantity} remaining</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {!loading && stats && stats.low_stock.length === 0 && stats.out_of_stock.length === 0 && (
        <div style={styles.allGood}>
          ✅ All stocked ingredients are above their low threshold
        </div>
      )}

      {/* Quick access */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Quick Access</h2>
        <div style={{
          ...styles.quickGrid,
          gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(auto-fill, minmax(200px, 1fr))',
        }}>
          {quickLinks.map(link => (
            <div
              key={link.path}
              style={styles.quickCard}
              onClick={() => navigate(link.path)}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = '#e2b96f44'
                e.currentTarget.style.transform = 'translateY(-2px)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = '#2a2a2a'
                e.currentTarget.style.transform = 'translateY(0)'
              }}
            >
              <span style={styles.quickIcon}>{link.icon}</span>
              <h3 style={styles.quickTitle}>{link.title}</h3>
              <p style={styles.quickDesc}>{link.desc}</p>
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}

const quickLinks = [
  {
    path: '/assistant',
    icon: '🤖',
    title: 'Ask the Assistant',
    desc: 'Instant answers about recipes, procedures, and VIP preferences',
  },
  {
    path: '/cocktails',
    icon: '🍸',
    title: 'Cocktails',
    desc: 'Browse and manage your full cocktail menu',
  },
  {
    path: '/inventory',
    icon: '📦',
    title: 'Inventory',
    desc: 'Track stock levels and update quantities',
  },
  {
    path: '/knowledge',
    icon: '📋',
    title: 'Knowledge Base',
    desc: 'Procedures, VIP profiles, and bar information',
  },
]

const styles = {
  page: {
    maxWidth: '960px',
    margin: '0 auto',
  },
  hero: {
    display: 'flex',
    alignItems: 'center',
    gap: '2rem',
    marginBottom: '3rem',
    minHeight: '320px',
  },
  heroText: {
    flex: 1,
  },
  heroTitle: {
    color: '#ffffff',
    fontSize: '2.8rem',
    fontWeight: '700',
    lineHeight: '1.15',
    marginBottom: '1rem',
    letterSpacing: '-0.03em',
  },
  heroSubtitle: {
    color: '#888888',
    fontSize: '1rem',
    lineHeight: '1.6',
    marginBottom: '1.5rem',
    maxWidth: '380px',
  },
  heroButton: {
    backgroundColor: '#e2b96f',
    color: '#111111',
    border: 'none',
    borderRadius: '8px',
    padding: '0.7rem 1.4rem',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '0.95rem',
    letterSpacing: '-0.01em',
  },
  heroVisual: {
    flex: 1,
    minWidth: '280px',
  },
  statsRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '1rem',
    marginBottom: '2.5rem',
  },
  statCard: {
    backgroundColor: '#1a1a1a',
    border: '1px solid #2a2a2a',
    borderRadius: '12px',
    padding: '1.25rem 1.5rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem',
  },
  statNumber: {
    color: '#e2b96f',
    fontSize: '2rem',
    fontWeight: '700',
    letterSpacing: '-0.03em',
  },
  statLabel: {
    color: '#666666',
    fontSize: '0.8rem',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
  },
  section: {
    marginBottom: '2.5rem',
  },
  sectionTitle: {
    color: '#ffffff',
    fontSize: '0.8rem',
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    marginBottom: '1rem',
    paddingBottom: '0.5rem',
    borderBottom: '1px solid #2a2a2a',
  },
  alertGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
    gap: '0.75rem',
  },
  alertCard: {
    backgroundColor: '#1a1a1a',
    border: '1px solid #2a2a2a',
    borderLeft: '3px solid',
    borderRadius: '8px',
    padding: '0.9rem 1rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  alertIndicator: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    flexShrink: 0,
  },
  alertName: {
    color: '#ffffff',
    margin: 0,
    fontSize: '0.9rem',
    fontWeight: '500',
  },
  alertStatus: {
    color: '#666666',
    margin: 0,
    fontSize: '0.8rem',
    marginTop: '0.15rem',
  },
  allGood: {
    backgroundColor: '#111811',
    border: '1px solid #2a3a2a',
    borderRadius: '8px',
    padding: '0.9rem 1rem',
    color: '#4caf50',
    fontSize: '0.875rem',
    marginBottom: '2.5rem',
  },
  quickGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gap: '1rem',
  },
  quickCard: {
    backgroundColor: '#1a1a1a',
    border: '1px solid #2a2a2a',
    borderRadius: '12px',
    padding: '1.5rem',
    cursor: 'pointer',
    transition: 'border-color 0.15s, transform 0.15s',
  },
  quickIcon: {
    fontSize: '1.5rem',
    display: 'block',
    marginBottom: '0.75rem',
  },
  quickTitle: {
    color: '#ffffff',
    margin: '0 0 0.4rem 0',
    fontSize: '0.95rem',
    fontWeight: '600',
  },
  quickDesc: {
    color: '#666666',
    fontSize: '0.82rem',
    margin: 0,
    lineHeight: '1.5',
  },
}