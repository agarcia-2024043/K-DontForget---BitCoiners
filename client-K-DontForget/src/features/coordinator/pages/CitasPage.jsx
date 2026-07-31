import { useState, useEffect } from 'react'
import { IconCheck, IconX, IconClock, IconUser, IconCalendar } from '@tabler/icons-react'
import { useAppointments } from '@/features/dashboard/hooks/useAppointments'
import { useNotifications } from '@/features/parent/store/notificationsStore'
import { useTranslation } from '@/shared/utils/i18n'
import { showSuccess, showError } from '@/shared/utils/toast'
import shared from '@/styles/shared.module.css'
import styles from './CitasPage.module.css'

function EstadoBadge({ estado }) {
  const map = {
    Pendiente:  styles.badgePending,
    Confirmada: styles.badgeConfirmed,
    Cancelada:  styles.badgeCancelled,
  }
  return <span className={`${styles.badge} ${map[estado] ?? ''}`}>{estado}</span>
}

export default function CitasPage() {
  const { citas, updateCita, fetchAppointments } = useAppointments()
  const { addNotification } = useNotifications()
  const { t } = useTranslation()
  const [filter, setFilter] = useState('todas')

  useEffect(() => {
    fetchAppointments()
  }, [fetchAppointments])

  const filteredCitas = citas.filter(cita => {
    if (filter === 'todas') return true
    if (filter === 'pendientes') return cita.estado === 'Pendiente'
    if (filter === 'confirmadas') return cita.estado === 'Confirmada'
    if (filter === 'canceladas') return cita.estado === 'Cancelada'
    return true
  })

  const pendingCitas = citas.filter(c => c.estado === 'Pendiente')
  const confirmedCitas = citas.filter(c => c.estado === 'Confirmada')
  const cancelledCitas = citas.filter(c => c.estado === 'Cancelada')

  async function handleConfirmarCita(id) {
    try {
      await updateCita(id, { estado: 'Confirmada' })
      addNotification({
        title: 'Cita confirmada',
        message: 'Has confirmado la cita exitosamente',
        type: 'Appointment',
      })
      showSuccess('Cita confirmada correctamente')
    } catch (err) {
      showError('Error al confirmar la cita en el servidor')
      throw err
    }
  }

  async function handleRechazarCita(id) {
    try {
      await updateCita(id, { estado: 'Cancelada' })
      addNotification({
        title: 'Cita rechazada',
        message: 'Has rechazado la cita',
        type: 'Appointment',
      })
      showSuccess('Cita rechazada')
    } catch (err) {
      showError('Error al rechazar la cita en el servidor')
    }
  }

  return (
    <div className={shared.page}>
      <div className={shared.pageHeader}>
        <h2 className={shared.sectionTitle}>{t('citas.title')}</h2>
      </div>

      {/* Estadísticas */}
      <div className={styles.statsGrid}>
        <div className={`${shared.card} ${shared.cardPad} ${styles.statCard}`}>
          <div className={styles.statIcon} style={{ color: '#d97706' }}>
            <IconClock size={24} />
          </div>
          <div className={styles.statContent}>
            <span className={styles.statValue}>{pendingCitas.length}</span>
            <span className={styles.statLabel}>{t('citas.pendientes')}</span>
          </div>
        </div>
        <div className={`${shared.card} ${shared.cardPad} ${styles.statCard}`}>
          <div className={styles.statIcon} style={{ color: '#0d9488' }}>
            <IconCheck size={24} />
          </div>
          <div className={styles.statContent}>
            <span className={styles.statValue}>{confirmedCitas.length}</span>
            <span className={styles.statLabel}>{t('citas.confirmadas')}</span>
          </div>
        </div>
        <div className={`${shared.card} ${shared.cardPad} ${styles.statCard}`}>
          <div className={styles.statIcon} style={{ color: '#e84c4c' }}>
            <IconX size={24} />
          </div>
          <div className={styles.statContent}>
            <span className={styles.statValue}>{cancelledCitas.length}</span>
            <span className={styles.statLabel}>{t('citas.canceladas')}</span>
          </div>
        </div>
        <div className={`${shared.card} ${shared.cardPad} ${styles.statCard}`}>
          <div className={styles.statIcon} style={{ color: 'var(--icon-dark)' }}>
            <IconCalendar size={24} />
          </div>
          <div className={styles.statContent}>
            <span className={styles.statValue}>{citas.length}</span>
            <span className={styles.statLabel}>{t('citas.total')}</span>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className={styles.filters}>
        <button className={`${styles.filterBtn} ${filter === 'todas' ? styles.active : ''}`} onClick={() => setFilter('todas')}>
          {t('citas.todas')} ({citas.length})
        </button>
        <button className={`${styles.filterBtn} ${filter === 'pendientes' ? styles.active : ''}`} onClick={() => setFilter('pendientes')}>
          {t('citas.pendientes')} ({pendingCitas.length})
        </button>
        <button className={`${styles.filterBtn} ${filter === 'confirmadas' ? styles.active : ''}`} onClick={() => setFilter('confirmadas')}>
          {t('citas.confirmadas')} ({confirmedCitas.length})
        </button>
        <button className={`${styles.filterBtn} ${filter === 'canceladas' ? styles.active : ''}`} onClick={() => setFilter('canceladas')}>
          {t('citas.canceladas')} ({cancelledCitas.length})
        </button>
      </div>

      {/* Lista de Citas */}
      <div className={`${shared.card} ${shared.cardPad} ${styles.citasContainer}`}>
        {filteredCitas.length === 0 ? (
          <div className={styles.emptyState}>
            <IconCalendar size={48} className={styles.emptyIcon} />
            <p>{t('citas.sinCitas')}</p>
          </div>
        ) : (
          <div className={styles.citasList}>
            {filteredCitas.map(cita => (
              <div key={cita.id} className={styles.citaCard}>
                <div className={styles.citaHeader}>
                  <div className={styles.citaInfo}>
                    <div className={styles.citaStudent}>
                      <IconUser size={18} />
                      <span>{cita.estudiante}</span>
                    </div>
                    <div className={styles.citaDetails}>
                      <span className={styles.citaDetail}>
                        <IconCalendar size={14} />
                        {cita.fecha}
                      </span>
                      <span className={styles.citaDetail}>
                        <IconClock size={14} />
                        {cita.hora}
                      </span>
                    </div>
                  </div>
                  <EstadoBadge estado={cita.estado} />
                </div>
                
                <div className={styles.citaMeta}>
                  <span className={styles.citaTutor}>{t('citas.coordinador')}: {cita.tutor}</span>
                  <span className={styles.citaTipo}>{cita.tipo}</span>
                </div>

                {cita.estado === 'Pendiente' && (
                  <div className={styles.citaActions}>
                    <button 
                      className={`${shared.btn} ${shared.btnPrimary} ${styles.actionBtn}`}
                      onClick={() => handleConfirmarCita(cita.id)}
                    >
                      <IconCheck size={16} />
                      {t('citas.confirmar')}
                    </button>
                    <button 
                      className={`${shared.btn} ${shared.btnSecondary} ${styles.actionBtn}`}
                      onClick={() => handleRechazarCita(cita.id)}
                    >
                      <IconX size={16} />
                      {t('citas.rechazar')}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
