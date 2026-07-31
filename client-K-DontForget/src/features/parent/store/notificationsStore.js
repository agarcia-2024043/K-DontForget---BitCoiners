import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { getNotifications, getUnreadCount } from '@/shared/api/notifications'

export const useNotifications = create(
  persist(
    (set, get) => ({
      notifications: [],
      unreadCount: 0,
      loading: false,

      fetchNotifications: async () => {
        try {
          set({ loading: true })
          const response = await getNotifications()
          const notificationsData = Array.isArray(response.data) ? response.data : []
          set({ 
            notifications: notificationsData,
            loading: false
          })
        } catch (error) {
          console.error('Error fetching notifications:', error)
          set({ loading: false }) // Keep localStorage notifications if backend fails
        }
      },

      fetchUnreadCount: async () => {
        try {
          const response = await getUnreadCount()
          set({ unreadCount: response.data?.count || 0 })
        } catch (error) {
          console.error('Error fetching unread count:', error)
        }
      },

      addNotification: (notification) => set((state) => {
        const currentNotifications = Array.isArray(state.notifications) ? state.notifications : []
        return {
          notifications: [{ ...notification, id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, read: false }, ...currentNotifications],
          unreadCount: (state.unreadCount || 0) + 1
        }
      }),

      markAsRead: (id) => set((state) => {
        const currentNotifications = Array.isArray(state.notifications) ? state.notifications : []
        return {
          notifications: currentNotifications.map(n => n.id === id ? { ...n, read: true } : n),
          unreadCount: Math.max(0, (state.unreadCount || 0) - 1)
        }
      }),

      markAllAsRead: () => set((state) => {
        const currentNotifications = Array.isArray(state.notifications) ? state.notifications : []
        return {
          notifications: currentNotifications.map(n => ({ ...n, read: true })),
          unreadCount: 0
        }
      }),

      clearNotifications: () => set({ notifications: [], unreadCount: 0 }),
    }),
    { name: 'kdf-notifications-store' }
  )
)
