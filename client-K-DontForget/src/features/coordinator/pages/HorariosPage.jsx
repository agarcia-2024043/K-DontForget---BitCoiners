import { useState, useEffect } from 'react'
import { IconPlus, IconTrash, IconClock, IconCalendar } from '@tabler/icons-react'
import { useTranslation } from '@/shared/utils/i18n'
import shared from '@/styles/shared.module.css'
import styles from './HorariosPage.module.css'

// Mock schedules data
const MOCK_SCHEDULES = [
  {
    id: 1,
    userId: 'agarcia@kinal.edu.gt',
    dayOfWeek: 1,
    startTime: '07:00',
    endTime: '14:00',
    isAvailable: true,
  },
  {
    id: 2,
    userId: 'agarcia@kinal.edu.gt',
    dayOfWeek: 2,
    startTime: '07:00',
    endTime: '14:00',
    isAvailable: true,
  },
  {
    id: 3,
    userId: 'agarcia@kinal.edu.gt',
    dayOfWeek: 3,
    startTime: '07:00',
    endTime: '14:00',
    isAvailable: true,
  },
  {
    id: 4,
    userId: 'agarcia@kinal.edu.gt',
    dayOfWeek: 4,
    startTime: '07:00',
    endTime: '14:00',
    isAvailable: true,
  },
  {
    id: 5,
    userId: 'agarcia@kinal.edu.gt',
    dayOfWeek: 5,
    startTime: '07:00',
    endTime: '14:00',
    isAvailable: true,
  },
]

export default function HorariosPage() {
  const [schedules, setSchedules] = useState([])
  const [showAddModal, setShowAddModal] = useState(false)
  const [loading, setLoading] = useState(false)
  const { t } = useTranslation()
  const [newSchedule, setNewSchedule] = useState({
    dayOfWeek: 1,
    startTime: '09:00',
    endTime: '17:00',
  })

  const DIAS_SEMANA = [
    { value: 0, label: t('horarios.domingo') },
    { value: 1, label: t('horarios.lunes') },
    { value: 2, label: t('horarios.martes') },
    { value: 3, label: t('horarios.miercoles') },
    { value: 4, label: t('horarios.jueves') },
    { value: 5, label: t('horarios.viernes') },
    { value: 6, label: t('horarios.sabado') },
  ]

  // Mock user ID - should come from auth
  const userId = 'agarcia@kinal.edu.gt'

  useEffect(() => {
    fetchSchedules()
  }, [])

  async function fetchSchedules() {
    setLoading(true)
    try {
      // Use mock data instead of API call
      await new Promise(resolve => setTimeout(resolve, 500))
      setSchedules(MOCK_SCHEDULES)
    } catch (error) {
      console.error('Error fetching schedules:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleAddSchedule() {
    try {
      const schedule = {
        id: Date.now(),
        userId,
        dayOfWeek: parseInt(newSchedule.dayOfWeek),
        startTime: newSchedule.startTime,
        endTime: newSchedule.endTime,
        isAvailable: true,
      }
      setSchedules(prev => [...prev, schedule])
      setShowAddModal(false)
      setNewSchedule({ dayOfWeek: 1, startTime: '09:00', endTime: '17:00' })
    } catch (error) {
      console.error('Error adding schedule:', error)
    }
  }

  async function handleDeleteSchedule(id) {
    try {
      setSchedules(prev => prev.filter(s => s.id !== id))
    } catch (error) {
      console.error('Error deleting schedule:', error)
    }
  }

  return (
    <div className={shared.page}>
      <div className={shared.pageHeader}>
        <h2 className={shared.sectionTitle}>{t('horarios.title')}</h2>
        <button className={`${shared.btn} ${shared.btnPrimary}`} onClick={() => setShowAddModal(true)}>
          <IconPlus size={18} />
          {t('horarios.agregar')}
        </button>
      </div>

      {loading ? (
        <p>{t('horarios.cargando')}</p>
      ) : schedules.length === 0 ? (
        <div className={`${shared.card} ${shared.cardPad} ${styles.emptyState}`}>
          <IconClock size={48} className={styles.emptyIcon} />
          <p>{t('horarios.vacio')}</p>
          <p className={styles.emptySubtext}>{t('horarios.vacioSub')}</p>
        </div>
      ) : (
        <div className={styles.schedulesGrid}>
          {schedules.map((schedule) => (
            <div key={schedule.id} className={`${shared.card} ${shared.cardPad} ${styles.scheduleCard}`}>
              <div className={styles.scheduleHeader}>
                <div className={styles.scheduleDay}>
                  <IconCalendar size={20} />
                  <span>{DIAS_SEMANA.find(d => d.value === schedule.dayOfWeek)?.label}</span>
                </div>
                <button 
                  className={styles.deleteBtn}
                  onClick={() => handleDeleteSchedule(schedule.id)}
                  aria-label="Eliminar horario"
                >
                  <IconTrash size={16} />
                </button>
              </div>
              <div className={styles.scheduleTime}>
                <IconClock size={16} />
                <span>{schedule.startTime} - {schedule.endTime}</span>
              </div>
              <div className={`${styles.status} ${schedule.isAvailable ? styles.available : styles.unavailable}`}>
                {schedule.isAvailable ? t('horarios.disponible') : t('horarios.noDisponible')}
              </div>
            </div>
          ))}
        </div>
      )}

      {showAddModal && (
        <div className={styles.modalOverlay} onClick={() => setShowAddModal(false)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>{t('horarios.agregarModal')}</h3>
              <button className={styles.closeBtn} onClick={() => setShowAddModal(false)}>
                ✕
              </button>
            </div>
            <div className={styles.modalBody}>
              <label className={styles.field}>
                <span>{t('horarios.diaSemana')}</span>
                <select 
                  value={newSchedule.dayOfWeek}
                  onChange={e => setNewSchedule(prev => ({ ...prev, dayOfWeek: e.target.value }))}
                >
                  {DIAS_SEMANA.map(dia => (
                    <option key={dia.value} value={dia.value}>{dia.label}</option>
                  ))}
                </select>
              </label>
              <div className={styles.row}>
                <label className={styles.field}>
                  <span>{t('horarios.horaInicio')}</span>
                  <input 
                    type="time"
                    value={newSchedule.startTime}
                    onChange={e => setNewSchedule(prev => ({ ...prev, startTime: e.target.value }))}
                  />
                </label>
                <label className={styles.field}>
                  <span>{t('horarios.horaFin')}</span>
                  <input 
                    type="time"
                    value={newSchedule.endTime}
                    onChange={e => setNewSchedule(prev => ({ ...prev, endTime: e.target.value }))}
                  />
                </label>
              </div>
            </div>
            <div className={styles.modalFooter}>
              <button className={`${shared.btn} ${shared.btnSecondary}`} onClick={() => setShowAddModal(false)}>
                {t('horarios.cancelar')}
              </button>
              <button className={`${shared.btn} ${shared.btnPrimary}`} onClick={handleAddSchedule}>
                {t('horarios.agregar')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
