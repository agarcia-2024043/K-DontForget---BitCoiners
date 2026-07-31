import { Outlet, useLocation } from 'react-router-dom'
import ParentSidebar from './ParentSidebar'
import ParentTopbar from './ParentTopbar'
import styles from './ParentLayout.module.css'

export default function ParentLayout() {
  const location = useLocation()

  return (
    <div className={styles.shell}>
      <ParentSidebar />
      <div className={styles.body}>
        <ParentTopbar />
        <main className={styles.main}>
          <div key={location.pathname} className="page-animate" style={{ height: '100%' }}>
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
