import { useState, useMemo } from 'react'
import { IconCalendar, IconClock, IconUser, IconChevronLeft, IconChevronRight, IconAlertCircle, IconPlus, IconList, IconChartBar, IconSettings, IconSearch } from '@tabler/icons-react'
import { useAppointments } from '@/features/dashboard/hooks/useAppointments'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from '@/shared/utils/i18n'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts'
import shared from '@/styles/shared.module.css'
import styles from './DashboardPage.module.css'

function EstadoBadge({ estado }) {
  const map = {
    Pendiente:  styles.badgePending,
    Confirmada: styles.badgeConfirmed,
    Cancelada:  styles.badgeCancelled,
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

export default function DashboardPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [searchTerm, setSearchTerm] = useState('')
  const { citas } = useAppointments()

  const chartData = useMemo(() => {
    const counts = {
      Confirmadas: citas.filter(c => c.estado === 'Confirmada').length,
      Pendientes: citas.filter(c => c.estado === 'Pendiente').length,
      Canceladas: citas.filter(c => c.estado === 'Cancelada').length,
      Completadas: citas.filter(c => c.estado === 'Completada').length,
    }
    return [
      { name: 'Confirmadas', cantidad: counts.Confirmadas, color: '#0d9488' },
      { name: 'Pendientes', cantidad: counts.Pendientes, color: '#d97706' },
      { name: 'Canceladas', cantidad: counts.Canceladas, color: '#e84c4c' },
      { name: 'Completadas', cantidad: counts.Completadas, color: '#3b82f6' },
    ]
  }, [citas])

  const typesData = useMemo(() => {
    const total = citas.length || 1
    const counts = {
      Individual: citas.filter(c => c.tipo === 'Individual').length,
      Grupal: citas.filter(c => c.tipo === 'Grupal').length,
      Otros: citas.filter(c => c.tipo !== 'Individual' && c.tipo !== 'Grupal').length,
    }
    return [
      { name: 'Citas Individuales', cantidad: counts.Individual, percentage: Math.round((counts.Individual / total) * 100), color: '#3b82f6' },
      { name: 'Citas Grupales', cantidad: counts.Grupal, percentage: Math.round((counts.Grupal / total) * 100), color: '#a855f7' },
      { name: 'Otras Consultas', cantidad: counts.Otros, percentage: Math.round((counts.Otros / total) * 100), color: '#64748b' },
    ]
  }, [citas])

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate()
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay()

  // Calculate real statistics
  const confirmed = citas.filter(c => c.estado === 'Confirmada').length
  const pending = citas.filter(c => c.estado === 'Pendiente').length
  const cancelled = citas.filter(c => c.estado === 'Cancelada').length
  const total = citas.length

  // Get pending appointments that need attention
  const pendingAppointments = citas.filter(c => c.estado === 'Pendiente')

  const ESTADISTICAS = [
    { label: t('dashboard.totalCitas'), value: total, color: 'var(--navy)', bg: 'rgba(41,64,104,0.08)', icon: <IconCalendar size={22} /> },
    { label: t('dashboard.confirmadas'), value: confirmed, color: '#0d9488', bg: 'rgba(13,148,136,0.1)', icon: <IconClock size={22} /> },
    { label: t('dashboard.pendientes'), value: pending, color: '#d97706', bg: 'rgba(217,119,6,0.1)', icon: <IconUser size={22} /> },
    { label: t('dashboard.canceladas'), value: cancelled, color: '#e84c4c', bg: 'rgba(232,76,76,0.1)', icon: <IconCalendar size={22} /> },
  ]

  // Get appointments for selected date
  const citasDelDia = citas.filter(cita => {
    const citaDate = parseDate(cita.fecha)
    return citaDate.toDateString() === selectedDate.toDateString()
  })

  const filteredCitas = citasDelDia.filter(cita =>
    cita.estudiante.toLowerCase().includes(searchTerm.toLowerCase())
  )

  function previousMonth() {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
  }

  function nextMonth() {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
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
        <h2 className={shared.sectionTitle}>{t('dashboard.title')}</h2>
        <div style={{ display: 'flex', gap: 12 }}>
          <button className={shared.primaryBtn} onClick={() => navigate('/citas')}>
            <IconPlus size={16} />
            <span>{t('dashboard.nuevaCita')}</span>
          </button>
          <button className={shared.primaryBtn} onClick={() => navigate('/reportes')} style={{ background: 'var(--orange)' }}>
            <IconChartBar size={16} />
            <span>{t('dashboard.verReportes')}</span>
          </button>
        </div>
      </div>

      {/* Estadísticas del Día */}
      <div className={styles.statsGrid}>
        {ESTADISTICAS.map((stat, index) => (
          <div key={index} className={`${shared.card} ${styles.statCard}`}>
            <div className={styles.statIcon} style={{ color: stat.color, background: stat.bg }}>
              {stat.icon}
            </div>
            <div className={styles.statContent}>
              <span className={styles.statValue} style={{ color: stat.color }}>{stat.value}</span>
              <span className={styles.statLabel}>{stat.label}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Citas Pendientes de Aprobación */}
      {pendingAppointments.length > 0 && (
        <div className={`${shared.card} ${shared.cardPad} ${styles.pendingCard}`}>
          <h3 className={styles.sectionTitle}>
            <IconAlertCircle size={16} style={{ color: '#d97706' }} />
            {t('dashboard.citasPendientesAprobacion')} ({pendingAppointments.length})
          </h3>
          <div className={styles.pendingList}>
            {pendingAppointments.slice(0, 3).map(cita => {
              const date = parseDate(cita.fecha)
              return (
                <div key={cita.id} className={styles.pendingItem}>
                  <div className={styles.pendingDate}>
                    <span className={styles.pendingDay}>{date.getDate()}</span>
                    <span className={styles.pendingMonth}>{t(`month.${date.getMonth()}`).substring(0, 3)}</span>
                  </div>
                  <div className={styles.pendingInfo}>
                    <span className={styles.pendingStudent}>{cita.estudiante}</span>
                    <span className={styles.pendingTime}>{cita.hora}</span>
                  </div>
                  <EstadoBadge estado={cita.estado} />
                </div>
              )
            })}
            {pendingAppointments.length > 3 && (
              <p className={styles.morePending}>+{pendingAppointments.length - 3} {t('dashboard.mas')}</p>
            )}
          </div>
        </div>
      )}

      <div className={styles.mainGrid}>
        {/* Calendario - Compacto */}
        <div className={`${shared.card} ${shared.cardPad} ${styles.calendarCardCompact}`}>
          <div className={styles.calendarHeader}>
            <button className={styles.calendarNavBtn} onClick={previousMonth}>
              <IconChevronLeft size={16} />
            </button>
            <h3 className={styles.calendarTitle}>
              {t(`month.${currentDate.getMonth()}`)} {currentDate.getFullYear()}
            </h3>
            <button className={styles.calendarNavBtn} onClick={nextMonth}>
              <IconChevronRight size={16} />
            </button>
          </div>
          <div className={styles.calendarWeekdays}>
            {weekdays.map(d => <span key={d}>{d}</span>)}
          </div>
          <div className={styles.calendarDays}>
            {getCalendarDays()}
          </div>
        </div>

        {/* Lista de Citas del día - Compacto */}
        <div className={`${shared.card} ${shared.cardPad} ${styles.appointmentsCardCompact}`}>
          <h3 className={styles.sectionTitle}>
            {t('dashboard.citasPara')} {selectedDate.toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}
          </h3>

          {/* Buscador interno para el listado del día */}
          {citasDelDia.length > 0 && (
            <div className={styles.searchContainer}>
              <div className={styles.searchIcon}>
                <IconSearch size={14} />
              </div>
              <input
                type="text"
                placeholder="Buscar estudiante..."
                className={styles.searchInput}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          )}

          <div className={styles.appointmentsListCompact}>
            {citasDelDia.length === 0 ? (
              <p className={styles.emptyStateCompact}>{t('dashboard.sinCitas')}</p>
            ) : filteredCitas.length === 0 ? (
              <p className={styles.emptyStateCompact}>No hay citas que coincidan con la búsqueda.</p>
            ) : (
              filteredCitas.map(cita => (
                <div key={cita.id} className={styles.appointmentItemCompact}>
                  <span className={styles.appointmentTimeCompact}>{cita.hora}</span>
                  <span className={styles.appointmentStudentCompact}>{cita.estudiante}</span>
                  <EstadoBadge estado={cita.estado} />
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Panel de Gráficos y Análisis */}
      <div className={styles.chartsGrid}>
        {/* Gráfico de Barras: Distribución de Citas */}
        <div className={`${shared.card} ${shared.cardPad} ${styles.chartCard}`}>
          <h3 className={styles.sectionTitle}>Distribución General de Citas</h3>
          <div style={{ width: '100%', height: 220, marginTop: '1rem' }}>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} />
                <Tooltip cursor={{ fill: 'rgba(0, 0, 0, 0.02)' }} />
                <Bar dataKey="cantidad" radius={[4, 4, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Resumen Tipo de Citas / Rendimiento */}
        <div className={`${shared.card} ${shared.cardPad} ${styles.chartCard}`}>
          <h3 className={styles.sectionTitle}>Distribución por Tipo de Cita</h3>
          <div className={styles.typesList}>
            {typesData.map((item, idx) => (
              <div key={idx} className={styles.typeItem}>
                <div className={styles.typeHeader}>
                  <span className={styles.typeName}>{item.name}</span>
                  <span className={styles.typeValue}>{item.percentage}% ({item.cantidad})</span>
                </div>
                <div className={styles.progressBarBg}>
                  <div className={styles.progressBarFill} style={{ width: `${item.percentage}%`, backgroundColor: item.color }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
