import { NavLink, useNavigate } from 'react-router-dom'
import {
  IconLayoutDashboard,
  IconCalendarEvent,
  IconUsers,
  IconChartBar,
  IconSettings,
  IconChalkboardTeacher,
  IconDoorExit,
} from '@tabler/icons-react'
import { useAuthStore } from '@/features/auth/store/authStore'
import { useTranslation } from '@/shared/utils/i18n'
import styles from '@/styles/Sidebar.module.css'

export default function Sidebar() {
  const { logout } = useAuthStore()
  const navigate = useNavigate()
  const { t } = useTranslation()

  const NAV_ITEMS = [
    { 
      section: t('sidebar.principal'),
      items: [
        { to: '/dashboard',     label: t('sidebar.dashboard'),     Icon: IconLayoutDashboard },
        { to: '/citas',         label: t('sidebar.citas'),         Icon: IconCalendarEvent },
      ]
    },
    { 
      section: t('sidebar.gestion'),
      items: [
        { to: '/estudiantes',   label: t('sidebar.estudiantes'),   Icon: IconUsers },
        { to: '/profesores',    label: t('sidebar.profesores'),    Icon: IconChalkboardTeacher },
      ]
    },
    { 
      section: t('sidebar.sistema'),
      items: [
        { to: '/reportes',      label: t('sidebar.reportes'),      Icon: IconChartBar },
        { to: '/configuracion', label: t('sidebar.configuracion'), Icon: IconSettings },
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
          <p className={styles.brandSub}>{t('sidebar.brandSub')}</p>
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
          <span>{t('sidebar.cerrarSesion')}</span>
        </button>
      </div>
    </aside>
  )
}
