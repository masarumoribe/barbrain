import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import useWindowWidth from '../hooks/useWindowWidth'

const links = [
  { to: '/', label: 'Home' },
  { to: '/cocktails', label: 'Cocktails' },
  { to: '/inventory', label: 'Inventory' },
  { to: '/knowledge', label: 'Knowledge Base' },
  { to: '/assistant', label: 'Assistant' },
]

export default function Navbar() {
  const location = useLocation()
  const width = useWindowWidth()
  const isMobile = width < 768
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <nav style={styles.nav}>
      <span style={styles.logo}>🍹 BarBrain</span>

      {isMobile ? (
        <>
          <button
            onClick={() => setMenuOpen(prev => !prev)}
            style={styles.menuButton}
          >
            {menuOpen ? '✕' : '☰'}
          </button>
          {menuOpen && (
            <div style={styles.mobileMenu}>
              {links.map(link => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMenuOpen(false)}
                  style={{
                    ...styles.mobileLink,
                    ...(location.pathname === link.to ? styles.mobileLinkActive : {}),
                  }}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          )}
        </>
      ) : (
        <div style={styles.links}>
          {links.map(link => (
            <Link
              key={link.to}
              to={link.to}
              style={{
                ...styles.link,
                ...(location.pathname === link.to ? styles.activeLink : {}),
              }}
            >
              {link.label}
              {location.pathname === link.to && <span style={styles.activeDot} />}
            </Link>
          ))}
        </div>
      )}
    </nav>
  )
}

const styles = {
  nav: {
    display: 'flex',
    alignItems: 'center',
    padding: '0 1.5rem',
    height: '64px',
    backgroundColor: '#161616',
    borderBottom: '1px solid #2a2a2a',
    position: 'sticky',
    top: 0,
    zIndex: 100,
    flexWrap: 'wrap',
  },
  logo: {
    color: '#e2b96f',
    fontWeight: 'bold',
    fontSize: '1.3rem',
    marginRight: 'auto',
    letterSpacing: '-0.02em',
  },
  links: {
    display: 'flex',
    gap: '0.25rem',
  },
  link: {
    color: '#888888',
    textDecoration: 'none',
    fontSize: '0.9rem',
    padding: '0.4rem 0.75rem',
    borderRadius: '6px',
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '4px',
  },
  activeLink: {
    color: '#e2b96f',
    backgroundColor: '#1e1e1e',
  },
  activeDot: {
    width: '4px',
    height: '4px',
    borderRadius: '50%',
    backgroundColor: '#e2b96f',
  },
  menuButton: {
    background: 'none',
    border: 'none',
    color: '#ffffff',
    fontSize: '1.4rem',
    cursor: 'pointer',
    padding: '0.4rem',
  },
  mobileMenu: {
    width: '100%',
    backgroundColor: '#161616',
    borderTop: '1px solid #2a2a2a',
    display: 'flex',
    flexDirection: 'column',
    paddingBottom: '0.75rem',
  },
  mobileLink: {
    color: '#888888',
    textDecoration: 'none',
    fontSize: '1rem',
    padding: '0.75rem 1rem',
    borderBottom: '1px solid #1e1e1e',
  },
  mobileLinkActive: {
    color: '#e2b96f',
    backgroundColor: '#1a1a1a',
  },
}