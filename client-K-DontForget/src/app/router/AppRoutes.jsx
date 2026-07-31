import { Routes, Route, Navigate } from 'react-router-dom'
import ProtectedRoute from './ProtectedRoute'
import MainLayout from '../layouts/MainLayout'
import ParentLayout from '../layouts/ParentLayout'

// Auth pages
import { AuthPage as LoginPage } from '@/features/auth/pages/AuthPage'

// Dashboard pages (Coordinador)
import DashboardPage from '@/features/dashboard/pages/DashboardPage'
import CitasPage from '@/features/coordinator/pages/CitasPage'
import EstudiantesPage from '@/features/dashboard/pages/EstudiantesPage'
import ReportesPage from '@/features/dashboard/pages/ReportesPage'
import ConfiguracionPage from '@/features/dashboard/pages/ConfiguracionPage'
import HorariosPage from '@/features/coordinator/pages/HorariosPage'
import ProfesoresPage from '@/features/coordinator/pages/ProfesoresPage'

// Parent pages (Padre)
import ParentView from '@/features/parent/pages/ParentView'
import HistorialPage from '@/features/parent/pages/HistorialPage'
import CoordinadoresPage from '@/features/parent/pages/CoordinadoresPage'
import PerfilPage from '@/features/parent/pages/PerfilPage'
import ParentProfesoresPage from '@/features/parent/pages/ProfesoresPage'
import ConfiguracionParentPage from '@/features/parent/pages/ConfiguracionParentPage'

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<LoginPage />} />

      {/* Protected routes for Coordinador */}
      <Route element={<ProtectedRoute />}>
        <Route element={<MainLayout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard"      element={<DashboardPage />} />
          <Route path="/citas"          element={<CitasPage />} />
          <Route path="/estudiantes"    element={<EstudiantesPage />} />
          <Route path="/reportes"       element={<ReportesPage />} />
          <Route path="/configuracion"  element={<ConfiguracionPage />} />
          <Route path="/horarios"       element={<HorariosPage />} />
          <Route path="/profesores"     element={<ProfesoresPage />} />
        </Route>
      </Route>

      {/* Parent routes (Padre) */}
      <Route element={<ParentLayout />}>
        <Route path="/padre" element={<ParentView />} />
        <Route path="/padre/historial" element={<HistorialPage />} />
        <Route path="/padre/coordinadores" element={<CoordinadoresPage />} />
        <Route path="/padre/perfil" element={<PerfilPage />} />
        <Route path="/padre/profesores" element={<ParentProfesoresPage />} />
        <Route path="/padre/configuracion" element={<ConfiguracionParentPage />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}