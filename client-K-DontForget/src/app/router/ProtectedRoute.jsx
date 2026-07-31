import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '@/features/auth/store/authStore'

export default function ProtectedRoute() {
  const { token, user } = useAuthStore()

  if (!token) {
    return <Navigate to="/login" replace />
  }

  // Redirect padres to their specific view
  if (user?.role === 'Padre') {
    return <Navigate to="/padre" replace />
  }

  return <Outlet />
}