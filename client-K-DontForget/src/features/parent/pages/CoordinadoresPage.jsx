import { useState } from 'react'
import { IconMail, IconClock, IconMessage, IconUserCircle, IconCalendar } from '@tabler/icons-react'
import { useAppointments } from '@/features/dashboard/hooks/useAppointments'
import { useTranslation } from '@/shared/utils/i18n'
import shared from '@/styles/shared.module.css'
import styles from './CoordinadoresPage.module.css'

const COORDINADORES = [
  {
    id: 1,
    nombre: 'Maynor Delgado',
    tipo: 'Externo',
    correo: 'maynordelgado@kinal.org.gt',
    chat: 'franciscomorales@kinal.edu.gt',
    horarioInicio: '09:00',
    horarioFin: '18:00',
    estado: 'Libre todo el día',
    zonaHoraria: 'Tu zona horaria es 1 hora por delante',
  },
  {
    id: 2,
    nombre: 'Francisco Morales',
    tipo: 'Externo',
    correo: 'franciscomorales@cetkinal.onmicrosoft.com',
    chat: 'franciscomorales@kinal.edu.gt',
    horarioInicio: '09:00',
    horarioFin: '18:00',
    estado: 'Libre todo el día',
    zonaHoraria: 'Tu zona horaria es 1 hora por delante',
  },
  {
    id: 3,
    nombre: 'Ludvin Gonzalez',
    tipo: 'Externo',
    correo: 'ludvingonzalez@kinal.org.gt',
    chat: null,
    horarioInicio: '09:00',
    horarioFin: '18:00',
    estado: 'Disponible',
    zonaHoraria: 'Tu zona horaria es 1 hora por delante',
  },
]

const TIME_SLOTS = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
  '15:00', '15:30', '16:00', '16:30', '17:00', '17:30'
]

export default function CoordinadoresPage() {
  const { citas } = useAppointments()
  const { t } = useTranslation()
  const [selectedDates, setSelectedDates] = useState({})
  const [selectedSlots, setSelectedSlots] = useState({})

  // Initialize with today's date for all coordinators
  const today = new Date().toISOString().split('T')[0]

  const handleDateChange = (coordinatorId, date) => {
    setSelectedDates(prev => ({ ...prev, [coordinatorId]: date }))
    setSelectedSlots(prev => ({ ...prev, [coordinatorId]: null }))
  }

  const handleSlotSelect = (coordinatorId, time) => {
    setSelectedSlots(prev => ({ ...prev, [coordinatorId]: time }))
  }

  const getCoordinatorOccupiedSlots = (coordinatorName, date) => {
    return citas
      .filter(cita => 
        cita.fecha === date && 
        cita.tutor === coordinatorName &&
        cita.estado !== 'Cancelada'
      )
      .map(cita => cita.hora)
  }

  return (
    <div className={shared.page}>
      <div className={shared.pageHeader}>
        <h2 className={shared.sectionTitle}>{t('coordinadores.title')}</h2>
      </div>

      <div className={styles.intro}>
        <p>{t('coordinadores.intro')}</p>
      </div>

      <div className={styles.grid}>
        {COORDINADORES.map((coordinador) => {
          const selectedDate = selectedDates[coordinador.id] || today
          const selectedSlot = selectedSlots[coordinador.id]
          const occupiedSlots = getCoordinatorOccupiedSlots(coordinador.nombre, selectedDate)

          return (
            <div key={coordinador.id} className={`${shared.card} ${styles.coordinatorCard}`}>
              <div className={styles.cardHeader}>
                <div className={styles.avatar}>
                  <IconUserCircle size={48} />
                </div>
                <div className={styles.headerInfo}>
                  <h3 className={styles.coordinatorName}>{coordinador.nombre}</h3>
                  <span className={styles.coordinatorType}>{coordinador.tipo}</span>
                </div>
              </div>

              <div className={styles.cardBody}>
                <div className={styles.statusBadge}>
                  <span className={styles.statusDot}></span>
                  {coordinador.estado === 'Libre todo el día' ? (t('horarios.disponible')) : (t('horarios.disponible'))}
                </div>

                {/* Calendar Section */}
                <div className={styles.calendarSection}>
                  <h4 className={styles.sectionTitle}>
                    <IconCalendar size={16} />
                    {t('coordinadores.disponibilidad')}
                  </h4>
                  
                  <div className={styles.dateSelector}>
                    <label className={styles.dateLabel}>{t('coordinadores.seleccionarFecha')}</label>
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => handleDateChange(coordinador.id, e.target.value)}
                      className={styles.dateInput}
                      min={today}
                    />
                  </div>

                  <div className={styles.scheduleGrid}>
                    {TIME_SLOTS.map(time => {
                      const isOccupied = occupiedSlots.includes(time)
                      const isSelected = selectedSlot === time
                      return (
                        <div
                          key={time}
                          className={`${styles.scheduleSlot} ${isOccupied ? styles.occupied : styles.available} ${isSelected ? styles.selected : ''}`}
                          onClick={() => !isOccupied && handleSlotSelect(coordinador.id, time)}
                        >
                          {time}
                          {isOccupied && <span className={styles.occupiedLabel}>{t('coordinadores.ocupado')}</span>}
                        </div>
                      )
                    })}
                  </div>

                  {selectedSlot && (
                    <div className={styles.selectedInfo}>
                      <span>{t('coordinadores.horarioSeleccionado')} <strong>{selectedSlot}</strong></span>
                    </div>
                  )}
                </div>

                <div className={styles.contactSection}>
                  <h4 className={styles.sectionTitle}>{t('coordinadores.infoContacto')}</h4>
                  
                  <div className={styles.contactItem}>
                    <IconMail size={18} className={styles.contactIcon} />
                    <div className={styles.contactDetails}>
                      <span className={styles.contactLabel}>{t('coordinadores.correo')}</span>
                      <a href={`mailto:${coordinador.correo}`} className={styles.contactValue}>
                        {coordinador.correo}
                      </a>
                    </div>
                  </div>

                  {coordinador.chat && (
                    <div className={styles.contactItem}>
                      <IconMessage size={18} className={styles.contactIcon} />
                      <div className={styles.contactDetails}>
                        <span className={styles.contactLabel}>{t('coordinadores.chat')}</span>
                        <span className={styles.contactValue}>{coordinador.chat}</span>
                      </div>
                    </div>
                  )}

                  <div className={styles.contactItem}>
                    <IconClock size={18} className={styles.contactIcon} />
                    <div className={styles.contactDetails}>
                      <span className={styles.contactLabel}>{t('coordinadores.horarioLaboral')}</span>
                      <span className={styles.contactValue}>
                        {coordinador.horarioInicio} - {coordinador.horarioFin}
                      </span>
                    </div>
                  </div>

                  <div className={styles.timezoneInfo}>
                    <span className={styles.timezoneText}>{coordinador.zonaHoraria}</span>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
