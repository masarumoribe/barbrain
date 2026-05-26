import { Link } from 'react-router-dom'

export default function Navbar() {
  return (
    <nav style={{
      display: 'flex',
      gap: '2rem',
      padding: '1rem 2rem',
      backgroundColor: '#1a1a1a',
      alignItems: 'center',
    }}>
      <span style={{
        color: '#e2b96f',
        fontWeight: 'bold',
        fontSize: '1.3rem',
        marginRight: 'auto',
      }}>
        🍹 Ask Masaru
      </span>
      <Link to="/" style={linkStyle}>Home</Link>
      <Link to="/cocktails" style={linkStyle}>Cocktails</Link>
      <Link to="/inventory" style={linkStyle}>Inventory</Link>
      <Link to="/assistant" style={linkStyle}>Assistant</Link>
      <Link to="/knowledge" style={linkStyle}>Knowledge Base</Link>
    </nav>
  )
}

const linkStyle = {
  color: '#ffffff',
  textDecoration: 'none',
  fontSize: '0.95rem',
}