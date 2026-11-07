import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { CartProvider } from './context/CartContext'

import Navbar from './components/Navbar'
import Footer from './components/Footer'
import CartBar from './components/menu/CartBar'
import CartDrawer from './components/menu/CartDrawer'
import Home from './pages/Home'
import Menu from './pages/Menu'

// Remonte en haut de page à chaque changement de route
function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

export default function App() {
  return (
    <CartProvider>
      <BrowserRouter>
        <ScrollToTop />
        <Navbar />

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/menu" element={<Menu />} />
        </Routes>

        <Footer />

        {/* Panier global : disponible sur toutes les pages */}
        <CartBar />
        <CartDrawer />
      </BrowserRouter>
    </CartProvider>
  )
}