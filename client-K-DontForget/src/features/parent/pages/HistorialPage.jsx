import { useState, useMemo } from 'react'
import { IconSearch, IconFilter, IconCalendar, IconCheck, IconBrandGoogle, IconDownload } from '@tabler/icons-react'
import { useTranslation } from '@/shared/utils/i18n'
import shared from '@/styles/shared.module.css'
import styles from './HistorialPage.module.css'
import { useAppointments } from '@/features/dashboard/hooks/useAppointments'
import { rescheduleAppointment } from '@/shared/api/appointments'
import { showSuccess } from '@/shared/utils/toast'
import { getGoogleCalendarLink, downloadICSFile } from '@/shared/utils/calendarExport'

function EstadoBadge({ estado }) {
  const map = {
    Pendiente:  styles.badgePending,
    Confirmada:  styles.badgeConfirmed,
    Cancelada:  styles.badgeCancelled,
    Completada: styles.badgeCompleted,
  }
  return <span className={`${styles.badge} ${map[estado] ?? ''}`}>{estado}</span>
}

export default function HistorialPage() {
  const { citas, updateCita } = useAppointments()
  const { t } = useTranslation()
  const [search, setSearch] = useState('')
  const [estadoFilter, setEstadoFilter] = useState('Todos')
  const [showRescheduleModal, setShowRescheduleModal] = useState(false)
  const [selectedCita, setSelectedCita] = useState(null)
  const [rescheduleForm, setRescheduleForm] = useState({ fecha: '', hora: '', motivo: '' })

  const ESTADOS = [t('historial.todos'), 'Pendiente', 'Confirmada', 'Cancelada', 'Completada']

  const handleRescheduleClick = (cita) => {
    setSelectedCita(cita)
    setRescheduleForm({ 
      fecha: cita.fecha, 
      hora: cita.hora, 
      motivo: cita.descripcion || '' 
    })
    setShowRescheduleModal(true)
  }

  const handleRescheduleSubmit = async (e) => {
    e.preventDefault()
    if (!selectedCita) return

    try {
      const isMongoId = /^[0-9a-fA-F]{24}$/.test(String(selectedCita.id))

      if (isMongoId) {
        const startTime = new Date(`${rescheduleForm.fecha}T${rescheduleForm.hora}`)
        const endTime = new Date(startTime.getTime() + 30 * 60000) // 30 minutos por defecto

        await rescheduleAppointment(selectedCita.id, {
          date: rescheduleForm.fecha,
          startTime: startTime.toISOString(),
          endTime: endTime.toISOString(),
          reason: rescheduleForm.motivo
        })
      }

      updateCita(selectedCita.id, {
        fecha: rescheduleForm.fecha,
        hora: rescheduleForm.hora,
        descripcion: rescheduleForm.motivo,
        estado: 'Pendiente'
      })

      showSuccess('Su cita ha sido reprogramada')
      setShowRescheduleModal(false)
      setSelectedCita(null)
    } catch (error) {
      console.error('Error al reprogramar cita:', error)
      alert('Error al reprogramar la cita. Verifica que el horario esté disponible.')
    }
  }

  const filtered = useMemo(() => {
    return citas.filter(c => {
      const matchesSearch = c.tutor.toLowerCase().includes(search.toLowerCase()) || 
                           c.estudiante.toLowerCase().includes(search.toLowerCase())
      const matchesEstado = estadoFilter === t('historial.todos') || c.estado === estadoFilter
      return matchesSearch && matchesEstado
    })
  }, [citas, search, estadoFilter, t])

  return (
    <div className={shared.page}>
      <div className={shared.pageHeader}>
        <h2 className={shared.sectionTitle}>{t('historial.title')}</h2>
      </div>

      {/* Resumen de Métricas al Inicio */}
      <div className={styles.summary}>
        <div className={`${styles.summaryCard} ${styles.completed}`}>
          <div className={styles.cardInfo}>
            <span className={styles.summaryLabel}>{t('historial.completadas')}</span>
            <span className={styles.summaryNumber}>{citas.filter(c => c.estado === 'Confirmada' || c.estado === 'Completada').length}</span>
          </div>
        </div>
        <div className={`${styles.summaryCard} ${styles.pending}`}>
          <div className={styles.cardInfo}>
            <span className={styles.summaryLabel}>{t('historial.pendientes')}</span>
            <span className={styles.summaryNumber}>{citas.filter(c => c.estado === 'Pendiente').length}</span>
          </div>
        </div>
        <div className={`${styles.summaryCard} ${styles.cancelled}`}>
          <div className={styles.cardInfo}>
            <span className={styles.summaryLabel}>{t('historial.canceladas')}</span>
            <span className={styles.summaryNumber}>{citas.filter(c => c.estado === 'Cancelada').length}</span>
          </div>
        </div>
      </div>

      {/* Barra de Filtros y Búsqueda */}
      <div className={styles.toolbar}>
        <div className={styles.searchBox}>
          <IconSearch size={16} />
          <input
            type="text"
            placeholder={t('historial.buscar')}
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className={styles.filterBox}>
          <IconFilter size={16} />
          <select
            value={estadoFilter}
            onChange={e => setEstadoFilter(e.target.value)}
          >
            {ESTADOS.map(e => (
              <option key={e} value={e}>
                {e === 'Pendiente' ? t('reportes.pendientes') :
                 e === 'Confirmada' ? t('reportes.confirmadas') :
                 e === 'Cancelada' ? t('reportes.canceladas') :
                 e === 'Completada' ? t('historial.completadas') : e}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Tabla Premium */}
      <div className={styles.tableWrapper}>
        <table className={styles.historyTable}>
          <thead>
            <tr>
              <th>{t('historial.thFecha')}</th>
              <th>{t('historial.thHora')}</th>
              <th>{t('historial.thEstudiante')}</th>
              <th>{t('historial.thTutor')}</th>
              <th>{t('historial.thTipo')}</th>
              <th>{t('historial.thEstado')}</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(cita => (
              <tr key={cita.id}>
                <td className={styles.dateCell}>
                  <div className={styles.dateBadge}>
                    <IconCalendar size={14} />
                    <span>{cita.fecha}</span>
                  </div>
                </td>
                <td className={styles.timeCell}>{cita.hora}</td>
                <td className={styles.studentCell}>{cita.estudiante}</td>
                <td className={styles.tutorCell}>{cita.tutor}</td>
                <td>
                  <span className={`${styles.typeBadge} ${cita.tipo === 'Grupal' ? styles.typeGrupal : styles.typeIndividual}`}>
                    {cita.tipo}
                  </span>
                </td>
                <td><EstadoBadge estado={cita.estado} /></td>
                <td>
                  <div className={styles.actionContainer}>
                    {(cita.estado === 'Pendiente' || cita.estado === 'Cancelada') && (
                      <button 
                        className={styles.actionBtn}
                        onClick={() => handleRescheduleClick(cita)}
                        title="Reprogramar cita"
                      >
                        <IconCalendar size={16} />
                      </button>
                    )}
                    {cita.estado === 'Confirmada' && (
                      <>
                        <a 
                          className={`${styles.actionBtn} ${styles.googleBtn}`}
                          href={getGoogleCalendarLink(cita)}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="Añadir a Google Calendar"
                        >
                          <IconBrandGoogle size={16} />
                        </a>
                        <button 
                          className={`${styles.actionBtn} ${styles.icalBtn}`}
                          onClick={() => downloadICSFile(cita)}
                          title="Descargar iCal (.ics)"
                        >
                          <IconDownload size={16} />
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className={styles.emptyStateContainer}>
            <p className={styles.emptyText}>{t('historial.vacio')}</p>
          </div>
        )}
      </div>

      {/* Modal de Reprogramación */}
      {showRescheduleModal && selectedCita && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContainer}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>Reprogramar Cita</h3>
              <button onClick={() => setShowRescheduleModal(false)} className={styles.modalCloseBtn} aria-label="Cerrar modal">
                ✕
              </button>
            </div>
            
            <form onSubmit={handleRescheduleSubmit} className={styles.modalForm}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>
                  Nueva Fecha
                </label>
                <input 
                  type="date" 
                  value={rescheduleForm.fecha}
                  onChange={e => setRescheduleForm({...rescheduleForm, fecha: e.target.value})}
                  required
                  className={styles.formInput}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>
                  Nueva Hora (09:00 - 18:00)
                </label>
                <input 
                  type="time" 
                  value={rescheduleForm.hora}
                  onChange={e => setRescheduleForm({...rescheduleForm, hora: e.target.value})}
                  required
                  min="09:00"
                  max="18:00"
                  className={styles.formInput}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>
                  Motivo de reprogramación
                </label>
                <textarea 
                  value={rescheduleForm.motivo}
                  onChange={e => setRescheduleForm({...rescheduleForm, motivo: e.target.value})}
                  rows={3}
                  placeholder="Describe el motivo por el que necesitas reprogramar..."
                  className={`${styles.formInput} ${styles.formTextarea}`}
                />
              </div>

              <div className={styles.modalActions}>
                <button 
                  type="button" 
                  onClick={() => setShowRescheduleModal(false)}
                  className={styles.btnCancel}
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className={styles.btnSubmit}
                >
                  Reprogramar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}
