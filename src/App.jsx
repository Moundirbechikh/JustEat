import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { MenuProvider } from './context/MenuContext'
import { CartProvider } from './context/CartContext'

import Navbar from './components/Navbar'
import Footer from './components/Footer'
import CartBar from './components/menu/CartBar'
import CartDrawer from './components/menu/CartDrawer'
import Home from './pages/Home'
import Menu from './pages/Menu'
import TableMenu from './pages/TableMenu'

// Remonte en haut de page à chaque changement de route
function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

function AppShell() {
  const { pathname } = useLocation()
  const isTableRoute = pathname.startsWith('/table')

  return (
    <>
      <ScrollToTop />
      {!isTableRoute && <Navbar />}

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/menu" element={<Menu />} />
        <Route path="/table" element={<TableMenu />} />
        <Route path="/table/:tableId" element={<TableMenu />} />
      </Routes>

      {!isTableRoute && <Footer />}

      {/* Panier global : disponible sur toutes les pages */}
      <CartBar />
      <CartDrawer />
    </>
  )
}

export default function App() {
  return (
    <MenuProvider>
      <CartProvider>
        <BrowserRouter>
          <AppShell />
        </BrowserRouter>
      </CartProvider>
    </MenuProvider>
  )
}