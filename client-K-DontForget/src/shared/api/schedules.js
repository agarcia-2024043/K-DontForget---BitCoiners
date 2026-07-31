import { nodeClient } from './api'

export const getCoordinatorSchedules = async (userId) => await nodeClient.get(`/schedules/${userId}`)
export const getAvailableSlots = async (userId, date) => await nodeClient.get(`/schedules/${userId}/available?date=${date}`)
export const checkAvailability = async (userId, date, time) => await nodeClient.get(`/schedules/${userId}/check-availability?date=${date}&time=${time}`)
export const createSchedule = async (data) => await nodeClient.post('/schedules', data)
export const updateSchedule = async (id, data) => await nodeClient.put(`/schedules/${id}`, data)
export const deleteSchedule = async (id) => await nodeClient.delete(`/schedules/${id}`)
