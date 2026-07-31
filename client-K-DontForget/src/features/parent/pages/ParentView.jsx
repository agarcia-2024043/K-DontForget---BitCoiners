import { useState } from 'react'
import { IconCalendar, IconClock, IconUser, IconChevronLeft, IconChevronRight, IconPlus, IconX, IconSearch } from '@tabler/icons-react'
import { useTranslation } from '@/shared/utils/i18n'
import shared from '@/styles/shared.module.css'
import styles from './ParentView.module.css'
import { useAuthStore } from '@/features/auth/store/authStore'
import { useAppointments } from '@/features/dashboard/hooks/useAppointments'
import RequestAppointmentModal from '../components/RequestAppointmentModal'

function EstadoBadge({ estado }) {
  const map = {
    Pendiente: styles.badgePending,
    Confirmada: styles.badgeConfirmed,
    Cancelada: styles.badgeCancelled,
  }
  return <span className={`${styles.badge} ${map[estado] ?? ''}`}>{estado}</span>
}

function parseDate(fechaStr) {
  if (!fechaStr) return new Date();
  const parts = fechaStr.split('-');
  if (parts.length === 3) {
    if (parts[0].length === 4) {
      // YYYY-MM-DD
      return new Date(parts[0], parts[1] - 1, parts[2]);
    } else {
      // DD-MM-YYYY
      return new Date(parts[2], parts[1] - 1, parts[0]);
    }
  }
  return new Date(fechaStr);
}

export default function ParentView() {
  const { user } = useAuthStore()
  const { citas, addCita } = useAppointments()
  const { t } = useTranslation()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [searchTerm, setSearchTerm] = useState('')
  const [modalOpen, setModalOpen] = useState(false)

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate()
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay()

  // Calculate real statistics
  const confirmed = citas.filter(c => c.estado === 'Confirmada').length
  const pending = citas.filter(c => c.estado === 'Pendiente').length
  const total = citas.length

  // Get next appointment
  const upcomingAppointments = citas
    .filter(c => c.estado === 'Confirmada' || c.estado === 'Pendiente')
    .sort((a, b) => new Date(a.fecha) - new Date(b.fecha))
  const nextAppointment = upcomingAppointments[0]

  const ESTADISTICAS = [
    { label: t('parentView.proximaCita'), value: nextAppointment ? new Date(nextAppointment.fecha).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }) : 'N/A', color: '#f97316', icon: <IconCalendar size={20} /> },
    { label: t('parentView.citasEsteMes'), value: total, color: '#0d9488', icon: <IconClock size={20} /> },
    { label: t('parentView.pendientes'), value: pending, color: '#d97706', icon: <IconUser size={20} /> },
  ]

  // Get appointments for selected date
  const citasDelDia = citas.filter(cita => {
    const citaDate = parseDate(cita.fecha)
    return citaDate.toDateString() === selectedDate.toDateString()
  })

  const filteredCitas = citasDelDia.filter(cita =>
    cita.tutor.toLowerCase().includes(searchTerm.toLowerCase())
  )

  function previousMonth() {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
  }

  function nextMonth() {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
  }

  function handleRequestAppointment(data) {
    addCita(data)
  }

  function getCalendarDays() {
    const days = []
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className={styles.calendarDayEmpty}></div>)
    }
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
      const isToday = day === new Date().getDate() &&
        currentDate.getMonth() === new Date().getMonth() &&
        currentDate.getFullYear() === new Date().getFullYear()
      const isSelected = day === selectedDate.getDate() &&
        currentDate.getMonth() === selectedDate.getMonth() &&
        currentDate.getFullYear() === selectedDate.getFullYear()

      // Check if this day has appointments
      const dayAppointments = citas.filter(cita => {
        const citaDate = parseDate(cita.fecha)
        return citaDate.toDateString() === date.toDateString()
      })
      const hasAppointments = dayAppointments.length > 0

      days.push(
        <div
          key={`${currentDate.getFullYear()}-${currentDate.getMonth()}-${day}`}
          className={`${styles.calendarDay} ${isToday ? styles.calendarDayToday : ''} ${isSelected ? styles.calendarDaySelected : ''} ${hasAppointments ? styles.calendarDayHasAppointments : ''}`}
          onClick={() => setSelectedDate(date)}
        >
          {day}
          {hasAppointments && <span className={styles.appointmentIndicator}>{dayAppointments.length}</span>}
        </div>
      )
    }
    return days
  }

  const weekdays = [t('cal.dom'), t('cal.lun'), t('cal.mar'), t('cal.mie'), t('cal.jue'), t('cal.vie'), t('cal.sab')]

  return (
    <div className={shared.page}>
      <div className={shared.pageHeader}>
        <div>
          <h2 className={shared.sectionTitle}>{t('parentView.bienvenido')} {user?.nombre || t('perfil.padreFamilia')}</h2>
          <p className={styles.welcomeText}>{t('parentView.gestionaCitas')}</p>
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <button className={shared.primaryBtn} onClick={() => setModalOpen(true)}>
            <IconPlus size={16} />
            {t('parentView.solicitarCita')}
          </button>
        </div>
      </div>

      {/* Estadísticas del Padre */}
      <div className={styles.statsGrid}>
        {ESTADISTICAS.map((stat, index) => (
          <div key={index} className={`${shared.card} ${styles.statCard}`}>
            <div className={styles.statIcon} style={{ color: stat.color }}>
              {stat.icon}
            </div>
            <div className={styles.statContent}>
              <span className={styles.statValue} style={{ color: stat.color }}>{stat.value}</span>
              <span className={styles.statLabel}>{stat.label}</span>
            </div>
          </div>
        ))}
      </div>

      <div className={styles.mainGrid}>
        {/* Calendario simplificado */}
        <div className={`${shared.card} ${shared.cardPad} ${styles.calendarCard}`}>
          <div className={styles.calendarHeader}>
            <button className={styles.calendarNavBtn} onClick={previousMonth}>
              <IconChevronLeft size={18} />
            </button>
            <h3 className={styles.calendarTitle}>
              {t(`month.${currentDate.getMonth()}`)} {currentDate.getFullYear()}
            </h3>
            <button className={styles.calendarNavBtn} onClick={nextMonth}>
              <IconChevronRight size={18} />
            </button>
          </div>
          <div className={styles.calendarWeekdays}>
            {weekdays.map(d => <span key={d}>{d}</span>)}
          </div>
          <div className={styles.calendarDays}>
            {getCalendarDays()}
          </div>
        </div>

        {/* Mis Citas del día - Compacto */}
        <div className={`${shared.card} ${shared.cardPad} ${styles.appointmentsCardCompact}`}>
          <h3 className={styles.sectionTitle}>
            {t('parentView.citasPara')} {selectedDate.toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}
          </h3>

          {/* Buscador interno para el listado del día */}
          {citasDelDia.length > 0 && (
            <div className={styles.searchContainer}>
              <div className={styles.searchIcon}>
                <IconSearch size={14} />
              </div>
              <input
                type="text"
                placeholder="Buscar coordinador..."
                className={styles.searchInput}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          )}

          <div className={styles.appointmentsListCompact}>
            {citasDelDia.length === 0 ? (
              <p className={styles.emptyStateCompact}>{t('parentView.sinCitas')}</p>
            ) : filteredCitas.length === 0 ? (
              <p className={styles.emptyStateCompact}>No hay citas que coincidan con la búsqueda.</p>
            ) : (
              filteredCitas.map(cita => (
                <div key={cita.id} className={styles.appointmentItemCompact}>
                  <span className={styles.appointmentTimeCompact}>{cita.hora}</span>
                  <span className={styles.appointmentTutorCompact}>{cita.tutor}</span>
                  <EstadoBadge estado={cita.estado} />
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Próximas Citas */}
      <div className={`${shared.card} ${shared.cardPad} ${styles.upcomingCard}`}>
        <h3 className={styles.sectionTitle}>{t('parentView.proximasCitas')}</h3>
        {upcomingAppointments.length === 0 ? (
          <p className={styles.emptyState}>{t('parentView.sinProximasCitas')}</p>
        ) : (
          <div className={styles.upcomingList}>
            {upcomingAppointments.slice(0, 3).map(cita => {
              const date = parseDate(cita.fecha)
              return (
                <div key={cita.id} className={styles.upcomingItem}>
                  <div className={styles.upcomingDate}>
                    <span className={styles.upcomingDay}>{date.getDate()}</span>
                    <span className={styles.upcomingMonth}>{t(`month.${date.getMonth()}`).substring(0, 3)}</span>
                  </div>
                  <div className={styles.upcomingInfo}>
                    <span className={styles.upcomingTime}>{cita.hora}</span>
                    <span className={styles.upcomingCoordinator}>{cita.tutor}</span>
                  </div>
                  <EstadoBadge estado={cita.estado} />
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Información importante */}
      <div className={`${shared.card} ${shared.cardPad} ${styles.infoCard}`}>
        <h3 className={styles.infoTitle}>{t('parentView.infoImportante')}</h3>
        <ul className={styles.infoList}>
          <li>{t('parentView.info1')}</li>
          <li>{t('parentView.info2')}</li>
          <li>{t('parentView.info3')}</li>
        </ul>
      </div>

      {modalOpen && (
        <RequestAppointmentModal
          onClose={() => setModalOpen(false)}
          onRequest={handleRequestAppointment}
        />
      )}
    </div>
  )
}
