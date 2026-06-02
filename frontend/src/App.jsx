import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import ProtectedRoute from './components/ProtectedRoute'
import Home from './pages/Home'
import Cocktails from './pages/Cocktails'
import Inventory from './pages/Inventory'
import Assistant from './pages/Assistant'
import KnowledgeBase from './pages/KnowledgeBase'
import Login from './pages/Login'
import useWindowWidth from './hooks/useWindowWidth'

export default function App() {
  const width = useWindowWidth()
  return (
    <BrowserRouter>
      <Navbar />
      <main style={{
        padding: width < 768 ? '1rem' : '2rem',
        maxWidth: '1200px',
        margin: '0 auto',
      }}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<Home />} />
            <Route path="/cocktails" element={<Cocktails />} />
            <Route path="/inventory" element={<Inventory />} />
            <Route path="/assistant" element={<Assistant />} />
            <Route path="/knowledge" element={<KnowledgeBase />} />
          </Route>
        </Routes>
      </main>
    </BrowserRouter>
  )
}