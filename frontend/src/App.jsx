import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Cocktails from './pages/Cocktails'
import Inventory from './pages/Inventory'
import Assistant from './pages/Assistant'
import KnowledgeBase from './pages/KnowledgeBase'

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <main style={{ padding: '2rem' }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/cocktails" element={<Cocktails />} />
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/assistant" element={<Assistant />} />
          <Route path="/knowledge" element={<KnowledgeBase />} />
        </Routes>
      </main>
    </BrowserRouter>
  )
}