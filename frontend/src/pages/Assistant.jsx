import { useState } from 'react'
import { askAssistant } from '../api/client'

const SUGGESTIONS = [
  "How do I close the bar?",
  "How do I place an order?",
  "How do I make On a Little Wooden Bridge?",
  "How to make Mr. Tanaka's Vesper?",
]

export default function Assistant() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      text: "Hi! I'm your bar assistant. Ask me anything — recipes, procedures, VIP preferences, ordering, or general bartending questions.",
    }
  ])
  const [input, setInput]     = useState('')
  const [loading, setLoading] = useState(false)

  const handleSend = async (message) => {
    const text = message || input.trim()
    if (!text || loading) return

    setInput('')
    setMessages(prev => [...prev, { role: 'user', text }])
    setLoading(true)

    try {
      const res = await askAssistant(text)
      setMessages(prev => [...prev, { role: 'assistant', text: res.data.response }])
    } catch {
      setMessages(prev => [...prev, {
        role: 'assistant',
        text: 'Sorry, something went wrong. Please try again.',
      }])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Ask Masaru</h1>
      <p style={styles.subtitle}>
        Your bar's knowledge base, always at hand.
      </p>

      {/* Quick suggestion buttons */}
      {messages.length === 1 && (
        <div style={styles.suggestions}>
          {SUGGESTIONS.map((s, i) => (
            <button
              key={i}
              onClick={() => handleSend(s)}
              style={styles.suggestionBtn}
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Message thread */}
      <div style={styles.thread}>
        {messages.map((msg, i) => (
          <div
            key={i}
            style={{
              ...styles.bubble,
              ...(msg.role === 'user' ? styles.userBubble : styles.assistantBubble),
            }}
          >
            {msg.role === 'assistant' && (
              <span style={styles.label}>🍹 Ask Masaru</span>
            )}
            <p style={styles.bubbleText}>{msg.text}</p>
          </div>
        ))}

        {loading && (
          <div style={{ ...styles.bubble, ...styles.assistantBubble }}>
            <span style={styles.label}>🍹 Bar Assistant</span>
            <p style={styles.bubbleText}>Looking that up...</p>
          </div>
        )}
      </div>

      {/* Input area */}
      <div style={styles.inputArea}>
        <textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask anything about your bar..."
          style={styles.input}
          rows={2}
          disabled={loading}
        />
        <button
          onClick={() => handleSend()}
          style={{
            ...styles.sendButton,
            opacity: loading ? 0.6 : 1,
          }}
          disabled={loading}
        >
          Send
        </button>
      </div>
      <p style={styles.hint}>Press Enter to send, Shift+Enter for a new line</p>
    </div>
  )
}

const styles = {
  container: { maxWidth: '760px', margin: '0 auto' },
  title: { color: '#e2b96f', marginBottom: '0.5rem' },
  subtitle: { color: '#aaaaaa', fontSize: '0.9rem', marginBottom: '1.5rem' },
  suggestions: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.5rem',
    marginBottom: '1.5rem',
  },
  suggestionBtn: {
    backgroundColor: '#1e1e1e',
    color: '#e2b96f',
    border: '1px solid #e2b96f44',
    borderRadius: '20px',
    padding: '0.4rem 0.9rem',
    cursor: 'pointer',
    fontSize: '0.85rem',
  },
  thread: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    marginBottom: '1.5rem',
    minHeight: '300px',
  },
  bubble: {
    padding: '1rem 1.25rem',
    borderRadius: '12px',
    maxWidth: '85%',
  },
  assistantBubble: {
    backgroundColor: '#1e1e1e',
    border: '1px solid #333',
    alignSelf: 'flex-start',
  },
  userBubble: {
    backgroundColor: '#2a2a1a',
    border: '1px solid #e2b96f44',
    alignSelf: 'flex-end',
  },
  label: {
    fontSize: '0.75rem',
    color: '#e2b96f',
    fontWeight: 'bold',
    display: 'block',
    marginBottom: '0.4rem',
  },
  bubbleText: {
    color: '#cccccc',
    fontSize: '0.95rem',
    lineHeight: '1.6',
    margin: 0,
    whiteSpace: 'pre-wrap',
  },
  inputArea: {
    display: 'flex',
    gap: '0.75rem',
    alignItems: 'flex-end',
  },
  input: {
    flex: 1,
    padding: '0.75rem',
    backgroundColor: '#1e1e1e',
    border: '1px solid #444',
    borderRadius: '10px',
    color: '#ffffff',
    fontSize: '0.95rem',
    resize: 'none',
    fontFamily: 'sans-serif',
  },
  sendButton: {
    backgroundColor: '#e2b96f',
    color: '#111111',
    border: 'none',
    borderRadius: '10px',
    padding: '0.75rem 1.5rem',
    cursor: 'pointer',
    fontWeight: 'bold',
    fontSize: '0.95rem',
    height: 'fit-content',
  },
  hint: {
    color: '#555555',
    fontSize: '0.75rem',
    marginTop: '0.5rem',
  },
}