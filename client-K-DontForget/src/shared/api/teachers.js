import { nodeClient } from './api'

export const getTeachers = async () => await nodeClient.get('/teachers')
export const getTeacherById = async (id) => await nodeClient.get(`/teachers/${id}`)
export const createTeacher = async (data) => await nodeClient.post('/teachers', data)
export const updateTeacher = async (id, data) => await nodeClient.put(`/teachers/${id}`, data)
export const deleteTeacher = async (id) => await nodeClient.delete(`/teachers/${id}`)
