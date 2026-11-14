import { Suspense, lazy, useEffect } from 'react'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { MenuProvider } from './context/MenuContext'
import { CartProvider } from './context/CartContext'
import { AdminAuthProvider } from './context/AdminAuthContext'

import Navbar from './components/Navbar'
import Footer from './components/Footer'
import CartBar from './components/menu/CartBar'
import CartDrawer from './components/menu/CartDrawer'
import Home from './pages/Home'
import Menu from './pages/Menu'
import TableMenu from './pages/TableMenu'
import OrderTrackingPage from './pages/OrderTrackingPage'

const AdminApp = lazy(() => import('./pages/admin/AdminApp'))

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
  const isAdminRoute = pathname.startsWith('/admin')

  useEffect(() => {
    const meta = document.querySelector('meta[name="robots"]')
    if (!meta) {
      const tag = document.createElement('meta')
      tag.setAttribute('name', 'robots')
      tag.setAttribute('content', isAdminRoute ? 'noindex, nofollow' : 'index, follow')
      document.head.appendChild(tag)
      return
    }
    meta.setAttribute('content', isAdminRoute ? 'noindex, nofollow' : 'index, follow')
  }, [isAdminRoute])

  return (
    <>
      <ScrollToTop />
      {!isTableRoute && !isAdminRoute && <Navbar />}

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/menu" element={<Menu />} />
        <Route path="/table" element={<TableMenu />} />
        <Route path="/table/:tableId" element={<TableMenu />} />
        <Route path="/suivi" element={<OrderTrackingPage />} />
        <Route
          path="/admin/*"
          element={
            <Suspense
              fallback={
                <div className="flex min-h-screen items-center justify-center bg-[#F5F2EE] text-lg font-semibold text-neutral-700">
                  Chargement de l’administration…
                </div>
              }
            >
              <AdminApp />
            </Suspense>
          }
        />
      </Routes>

      {!isTableRoute && !isAdminRoute && <Footer />}

      {!isAdminRoute && <CartBar />}
      {!isAdminRoute && <CartDrawer />}
    </>
  )
}

export default function App() {
  return (
    <MenuProvider>
      <CartProvider>
        <AdminAuthProvider>
          <BrowserRouter>
            <AppShell />
          </BrowserRouter>
        </AdminAuthProvider>
      </CartProvider>
    </MenuProvider>
  )
}