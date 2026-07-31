import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { IconBell, IconSearch, IconMenu } from '@tabler/icons-react'
import { useAuthStore } from '@/features/auth/store/authStore'
import { useNotifications } from '@/features/parent/store/notificationsStore'
import { useTranslation } from '@/shared/utils/i18n'
import styles from '@/styles/Topbar.module.css'

export default function ParentTopbar() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { notifications, unreadCount, fetchNotifications, fetchUnreadCount, markAsRead, markAllAsRead } = useNotifications()
  const { t } = useTranslation()
  const [showNotifications, setShowNotifications] = useState(false)

  useEffect(() => {
    fetchNotifications()
    fetchUnreadCount()
  }, [fetchNotifications, fetchUnreadCount])

  const handleNotificationClick = async (notification, event) => {
    event.stopPropagation()
    if (!notification.read) {
      await markAsRead(notification.id)
    }
    navigate('/padre/historial')
    setShowNotifications(false)
  }

  const handleMarkAllAsRead = async () => {
    await markAllAsRead()
  }

  const ROUTE_TITLES = {
    '/padre': t('parentTopbar.misCitas'),
    '/padre/historial': t('parentTopbar.historial'),
    '/padre/coordinadores': t('parentTopbar.coordinadores'),
    '/padre/profesores': t('parentTopbar.profesores'),
    '/padre/perfil': t('parentTopbar.perfil'),
    '/padre/configuracion': t('parentTopbar.configuracion'),
  }

  const title = ROUTE_TITLES[pathname] ?? t('parentTopbar.default')

  const getInitials = (name) => {
    if (!name) return 'P'
    return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
  }

  return (
    <header className={styles.topbar}>
      <div className={styles.leftSection}>
        <button className={styles.menuBtn} aria-label="Menú">
          <IconMenu size={20} stroke={1.6} />
        </button>
        <h1 className={styles.title}>{title}</h1>
      </div>
      
      <div className={styles.centerSection}>
        <div className={styles.searchBox}>
          <span className={styles.searchIcon}>
            <IconSearch size={15} />
          </span>
          <input
            type="text"
            placeholder={t('topbar.searchPlaceholder')}
            className={styles.searchInput}
          />
        </div>
      </div>

      <div className={styles.actions}>
        <div style={{ position: 'relative' }}>
          <button 
            className={styles.iconBtn} 
            aria-label="Notificaciones"
            onClick={() => setShowNotifications(!showNotifications)}
          >
            <IconBell size={18} stroke={1.6} />
            {unreadCount > 0 && (
              <span className={styles.notificationBadge}>{unreadCount}</span>
            )}
          </button>

          {showNotifications && (
            <div className={styles.notificationPanel}>
              <div className={styles.notificationHeader}>
                <span className={styles.notificationTitle}>Notificaciones</span>
                {unreadCount > 0 && (
                  <button className={styles.markAllBtn} onClick={handleMarkAllAsRead}>
                    Marcar todo como leído
                  </button>
                )}
              </div>

              <div className={styles.notificationList}>
                {notifications.length === 0 ? (
                  <div className={styles.notificationEmpty}>
                    Sin notificaciones
                  </div>
                ) : (
                  notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={styles.notificationItem}
                      onClick={(e) => handleNotificationClick(notification, e)}
                      style={{ background: notification.read ? 'transparent' : 'rgba(240, 140, 43, 0.04)' }}
                    >
                      <div
                        className={styles.notificationDot}
                        style={{
                          background: notification.read ? 'var(--border-solid)' : 'var(--orange)',
                          boxShadow: notification.read ? 'none' : '0 0 6px rgba(240, 140, 43, 0.4)'
                        }}
                      />
                      <div className={styles.notificationContent}>
                        <p className={`${styles.notificationText} ${notification.read ? styles.notificationTextRead : ''}`}>
                          {notification.title}
                        </p>
                        <p className={styles.notificationMessage}>
                          {notification.message}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <button
                className={styles.notificationClose}
                onClick={() => setShowNotifications(false)}
              >
                Cerrar
              </button>
            </div>
          )}
        </div>

        <div className={styles.userChip}>
          <div className={styles.userAvatar}>
            {getInitials(user?.nombre)}
          </div>
          <span>{user?.nombre ?? 'Padre'}</span>
        </div>
      </div>
    </header>
  )
}
