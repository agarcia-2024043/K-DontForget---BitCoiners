import { useLocation, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { IconBell, IconUserCircle, IconSearch, IconMenu, IconX, IconCheck, IconCalendar, IconClock } from '@tabler/icons-react'
import { useAuthStore } from '@/features/auth/store/authStore'
import { useNotifications } from '@/features/parent/store/notificationsStore'
import { useTranslation } from '@/shared/utils/i18n'
import styles from '@/styles/Topbar.module.css'

export default function Topbar() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { notifications, unreadCount, fetchNotifications, fetchUnreadCount, markAsRead, markAllAsRead } = useNotifications()
  const { t } = useTranslation()
  const [showNotifications, setShowNotifications] = useState(false)
  const [selectedNotification, setSelectedNotification] = useState(null)
  const [showQuickMenu, setShowQuickMenu] = useState(false)

  useEffect(() => {
    fetchNotifications()
    fetchUnreadCount()
  }, [fetchNotifications, fetchUnreadCount])

  const ROUTE_TITLES = {
    '/dashboard':     t('topbar.dashboard'),
    '/citas':         t('topbar.citas'),
    '/estudiantes':   t('topbar.estudiantes'),
    '/profesores':    t('topbar.profesores'),
    '/reportes':      t('topbar.reportes'),
    '/configuracion': t('topbar.configuracion'),
    '/horarios':      t('topbar.horarios'),
  }

  const title = ROUTE_TITLES[pathname] ?? 'K-Don\'tForget'

  const handleNotificationClick = async (notification, event) => {
    event.stopPropagation()
    
    if (!notification.read) {
      await markAsRead(notification.id)
    }

    // Si es coordinador, mostrar menú rápido
    if (user?.role === 'Coordinador' && notification.type === 'Appointment') {
      setSelectedNotification(notification)
      setShowQuickMenu(true)
    } else {
      // Para padres, navegar a la página de historial
      navigate('/historial')
      setShowNotifications(false)
    }
  }

  const handleQuickAction = (action) => {
    setShowQuickMenu(false)
    setShowNotifications(false)
    
    switch (action) {
      case 'view-appointments':
        navigate('/citas')
        break
      case 'view-calendar':
        navigate('/horarios')
        break
      case 'view-dashboard':
        navigate('/dashboard')
        break
      default:
        break
    }
  }

  const handleMarkAllAsRead = async () => {
    await markAllAsRead()
  }

  // Get user initials for avatar
  const getInitials = (name) => {
    if (!name) return 'U'
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
            id="notifications-btn"
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
                  <button 
                    className={styles.markAllBtn}
                    onClick={handleMarkAllAsRead}
                  >
                    Marcar todas como leídas
                  </button>
                )}
              </div>

              <div className={styles.notificationList}>
                {notifications.length === 0 ? (
                  <div className={styles.notificationEmpty}>
                    No tienes notificaciones
                  </div>
                ) : (
                  notifications.map(notification => (
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
                        <p className={styles.notificationTime}>
                          {new Date(notification.createdAt).toLocaleDateString('es-ES', { 
                            hour: '2-digit', 
                            minute: '2-digit',
                            day: 'numeric',
                            month: 'short'
                          })}
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
          <span>{user?.nombre ?? 'Usuario'}</span>
        </div>
      </div>

      {/* Menú rápido para coordinadores */}
      {showQuickMenu && selectedNotification && (
        <div className={styles.quickMenuOverlay} onClick={() => setShowQuickMenu(false)}>
          <div className={styles.quickMenuCard} onClick={e => e.stopPropagation()}>
            <div className={styles.quickMenuHeader}>
              <div>
                <h3 className={styles.quickMenuTitle}>Acciones Rápidas</h3>
                <p className={styles.quickMenuSub}>{selectedNotification.title}</p>
              </div>
              <button 
                className={styles.quickMenuCloseBtn}
                onClick={() => setShowQuickMenu(false)} 
              >
                <IconX size={20} />
              </button>
            </div>
            
            <div className={styles.quickMenuBody}>
              <p className={styles.quickMenuMessage}>
                {selectedNotification.message}
              </p>
              
              <div className={styles.quickMenuActions}>
                <button
                  className={styles.quickActionBtn}
                  onClick={() => handleQuickAction('view-appointments')}
                >
                  <span className={styles.quickActionIcon}>
                    <IconCalendar size={18} />
                  </span>
                  <span>Ver Citas</span>
                </button>

                <button
                  className={styles.quickActionBtn}
                  onClick={() => handleQuickAction('view-calendar')}
                >
                  <span className={styles.quickActionIcon}>
                    <IconClock size={18} />
                  </span>
                  <span>Ver Horarios</span>
                </button>

                <button
                  className={styles.quickActionBtn}
                  onClick={() => handleQuickAction('view-dashboard')}
                >
                  <span className={styles.quickActionIcon}>
                    <IconCheck size={18} />
                  </span>
                  <span>Ir al Dashboard</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
