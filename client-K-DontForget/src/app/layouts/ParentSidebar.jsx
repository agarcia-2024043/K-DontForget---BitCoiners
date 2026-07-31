import { NavLink, useNavigate } from 'react-router-dom'
import {
  IconLayoutDashboard,
  IconCalendarEvent,
  IconUser,
  IconUsers,
  IconChalkboardTeacher,
  IconSettings,
  IconDoorExit,
} from '@tabler/icons-react'
import { useAuthStore } from '@/features/auth/store/authStore'
import { useTranslation } from '@/shared/utils/i18n'
import styles from '@/styles/Sidebar.module.css'

export default function ParentSidebar() {
  const { logout } = useAuthStore()
  const navigate = useNavigate()
  const { t } = useTranslation()

  const NAV_ITEMS = [
    { 
      section: t('parentSidebar.principal'),
      items: [
        { to: '/padre', label: t('parentSidebar.misCitas'), Icon: IconLayoutDashboard },
        { to: '/padre/historial', label: t('parentSidebar.historial'), Icon: IconCalendarEvent },
      ]
    },
    { 
      section: t('parentSidebar.contacto'),
      items: [
        { to: '/padre/coordinadores', label: t('parentSidebar.coordinadores'), Icon: IconUsers },
        { to: '/padre/profesores', label: t('parentSidebar.profesores'), Icon: IconChalkboardTeacher },
      ]
    },
    { 
      section: t('parentSidebar.cuenta'),
      items: [
        { to: '/padre/perfil', label: t('parentSidebar.miPerfil'), Icon: IconUser },
        { to: '/padre/configuracion', label: t('parentSidebar.configuracion'), Icon: IconSettings },
      ]
    },
  ]

  function handleLogout() {
    logout()
    navigate('/login')
  }

  return (
    <aside className={styles.sidebar}>
      {/* Brand */}
      <div className={styles.brand}>
        <div className={styles.brandLogo}>KF</div>
        <div>
          <p className={styles.brandName}>K-Don'tForget</p>
          <p className={styles.brandSub}>{t('parentSidebar.brandSub')}</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className={styles.nav}>
        {NAV_ITEMS.map((section, sectionIndex) => (
          <div key={sectionIndex} className={styles.navSection}>
            <span className={styles.navSectionLabel}>{section.section}</span>
            {section.items.map(({ to, label, Icon }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/padre'}
                className={({ isActive }) =>
                  `${styles.navItem} ${isActive ? styles.active : ''}` 
                }
              >
                <span className={styles.navIcon}>
                  <Icon size={17} stroke={1.8} />
                </span>
                <span>{label}</span>
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      {/* Logout */}
      <div className={styles.footer}>
        <button className={styles.logoutBtn} onClick={handleLogout}>
          <span className={styles.navIcon}>
            <IconDoorExit size={17} stroke={1.8} />
          </span>
          <span>{t('parentSidebar.cerrarSesion')}</span>
        </button>
      </div>
    </aside>
  )
}
