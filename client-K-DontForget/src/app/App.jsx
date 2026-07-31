import { BrowserRouter } from 'react-router-dom'
import AppRoutes from './router/AppRoutes'
import { Toaster } from 'react-hot-toast'

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
      <Toaster position="top-right" reverseOrder={false} />
    </BrowserRouter>
  )
}