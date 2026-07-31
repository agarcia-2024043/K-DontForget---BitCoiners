import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from './Sidebar'
import Topbar from './Topbar'
import styles from '@/styles/MainLayout.module.css'

export default function MainLayout() {
  const location = useLocation()

  return (
    <div className={styles.shell}>
      <Sidebar />
      <div className={styles.body}>
        <Topbar />
        <main className={styles.main}>
          <div key={location.pathname} className="page-animate" style={{ height: '100%' }}>
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
