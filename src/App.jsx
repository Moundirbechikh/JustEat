
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { CartProvider } from './context/CartContext'

import Navbar from './components/Navbar'
import Home from './pages/Home'
import Menu from './pages/Menu'

export default function App() {
  return (
    <CartProvider>
      <BrowserRouter>
        {/* Navbar globale présente sur toutes les pages */}
        <Navbar />

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/menu" element={<Menu />} />
        </Routes>
      </BrowserRouter>
    </CartProvider>
  )
}
