import { httpClient } from './api'

export const login = async (data) => await httpClient.post('/auth/login', {
  Email: data.email,
  Password: data.password
})
export const forgotPassword = async (email) => await httpClient.post('/auth/forgot-password', { email })
export const verifyEmail = async (token) => await httpClient.get(`/auth/verify?token=${token}`)
export const loginWithGoogle = async (token) => await httpClient.post('/auth/google', { Token: token })
export const loginWithMicrosoft = async (token) => await httpClient.post('/auth/microsoft', { Token: token })