import { nodeClient } from './api'

export const getAppointments = async () => await nodeClient.get('/appointments')
export const getAppointmentsByStatus = async (status) => await nodeClient.get(`/appointments?status=${status}`)
export const createAppointment = async (data) => await nodeClient.post('/appointments', data)
export const rescheduleAppointment = async (id, data) => await nodeClient.patch(`/appointments/${id}/reschedule`, data)
export const updateAppointment = async (id, data) => await nodeClient.put(`/appointments/${id}`, data)
export const confirmAppointment = async (id) => await nodeClient.patch(`/appointments/confirm/${id}`)
export const cancelAppointment = async (id) => await nodeClient.patch(`/appointments/cancel/${id}`)
export const getAppointmentHistory = async (id) => await nodeClient.get(`/appointments/history/${id}`)
