import axios from 'axios'
import { useAuthStore } from '@/features/auth/store/authStore'

export const httpClient = axios.create({
  baseURL: import.meta.env.VITE_AUTH_URL || 'http://localhost:5065/api',
})

// Backward compatibility
export const axiosAuth = httpClient

// Attach auth token to every request automatically
httpClient.interceptors.request.use((config) => {
  const { token } = useAuthStore.getState()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Auto-logout on 401 responses
httpClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout()
    }
    return Promise.reject(error)
  }
)

export const nodeClient = axios.create({
  baseURL: import.meta.env.VITE_NODE_URL || 'http://localhost:4000/api',
})

nodeClient.interceptors.request.use((config) => {
  const { token } = useAuthStore.getState()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

nodeClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout()
    }
    return Promise.reject(error)
  }
)



