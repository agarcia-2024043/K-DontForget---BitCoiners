import { nodeClient } from './api'

export const getNotifications = async () => await nodeClient.get(`/notifications`)
export const getUnreadCount = async () => await nodeClient.get(`/notifications/unread-count`)
export const markAsRead = async (notificationId) => await nodeClient.patch(`/notifications/${notificationId}/read`)
export const markAllAsRead = async () => await nodeClient.patch(`/notifications/mark-all-read`)
export const createNotification = async (data) => await nodeClient.post('/notifications', data)
