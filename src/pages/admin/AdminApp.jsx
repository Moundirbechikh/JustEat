import { Navigate, Route, Routes } from 'react-router-dom'
import { useAdminAuth } from '../../context/AdminAuthContext'
import AdminLayout from './AdminLayout'
import AdminLogin from './AdminLogin'
import AvailabilityPage from './AvailabilityPage'
import OrdersPage from './OrdersPage'
import TablesPage from './TablesPage'
import SettingsPage from './SettingsPage'

function ProtectedAdmin({ children }) {
  const { isAuthenticated } = useAdminAuth()
  if (!isAuthenticated) return <Navigate to="/admin/login" replace />
  return children
}

export default function AdminApp() {
  return (
    <Routes>
      <Route path="login" element={<AdminLogin />} />
      <Route
        path="*"
        element={
          <ProtectedAdmin>
            <AdminLayout>
              <Routes>
                <Route index element={<Navigate to="/admin/commandes" replace />} />
                <Route path="commandes" element={<OrdersPage />} />
                <Route path="tables" element={<TablesPage />} />
                <Route path="disponibilites" element={<AvailabilityPage />} />
                <Route path="parametres" element={<SettingsPage />} />
              </Routes>
            </AdminLayout>
          </ProtectedAdmin>
        }
      />
    </Routes>
  )
}
