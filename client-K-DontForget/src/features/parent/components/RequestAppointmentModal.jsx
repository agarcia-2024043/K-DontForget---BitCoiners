import { useState, useEffect } from 'react'
import { IconX, IconUser, IconMail, IconClock, IconAlertCircle, IconBrandWhatsapp } from '@tabler/icons-react'
import { useAppointments } from '@/features/dashboard/hooks/useAppointments'
import { useAuthStore } from '@/features/auth/store/authStore'
import styles from './RequestAppointmentModal.module.css'

const TIPOS = ['Individual', 'Grupal']
const MOTIVOS = ['Orientación académica', 'Comportamiento', 'Asistencia', 'Otro']

const COORDINADORES = [
  {
    id: 1,
    nombre: 'Maynor Delgado',
    tipo: 'Externo',
    correo: 'maynordelgado@kinal.org.gt',
    horario: '09:00 - 18:00',
    userId: 'agarcia@kinal.edu.gt',
  },
  {
    id: 2,
    nombre: 'Francisco Morales',
    tipo: 'Externo',
    correo: 'franciscomorales@cetkinal.onmicrosoft.com',
    horario: '09:00 - 18:00',
    userId: 'lcastro@kinal.edu.gt',
  },
  {
    id: 3,
    nombre: 'Ludvin Gonzalez',
    tipo: 'Externo',
    correo: 'ludvingonzalez@kinal.org.gt',
    horario: '09:00 - 18:00',
    userId: 'coordinator3@kinal.edu.gt',
  },
]

const TIME_SLOTS = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
  '15:00', '15:30', '16:00', '16:30', '17:00', '17:30'
]

export default function RequestAppointmentModal({ onClose, onRequest }) {
  const { user } = useAuthStore()
  const [form, setForm] = useState({
    estudiante: '',
    fecha: '',
    hora: '',
    tipo: TIPOS[0],
    motivo: MOTIVOS[0],
    descripcion: '',
    coordinadorId: COORDINADORES[0].id,
    phoneNumber: user?.phoneNumber || '',
  })
  const [useDefaultPhone, setUseDefaultPhone] = useState(Boolean(user?.phoneNumber))
  const [availableSlots, setAvailableSlots] = useState([])
  const [showAvailableSlots, setShowAvailableSlots] = useState(false)
  const { citas, fetchAppointments } = useAppointments()

  // Calcular la fecha local actual para el atributo "min"
  const today = new Date()
  today.setMinutes(today.getMinutes() - today.getTimezoneOffset())
  const minDate = today.toISOString().split('T')[0]

  const selectedCoordinador = COORDINADORES.find(c => c.id === parseInt(form.coordinadorId))

  // Cargar citas reales al abrir el modal para validación fresca
  useEffect(() => {
    fetchAppointments()
  }, [fetchAppointments])

  function handleChange(e) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  function handleSubmit(e) {
    e.preventDefault()

    try {
      console.log("Iniciando handleSubmit con form:", form);
      const isOccupied = citas.some(cita => 
        cita.fecha === form.fecha && 
        cita.hora === form.hora &&
        cita.tutor === selectedCoordinador?.nombre &&
        cita.estado !== 'Cancelada'
      )
      
      console.log("isOccupied evaluado a:", isOccupied);
      if (isOccupied) {
        alert("El horario seleccionado ya está ocupado. Por favor, elige otro.")
        return
      }

      const coordinador = COORDINADORES.find(c => c.id === parseInt(form.coordinadorId))
      console.log("Coordinador encontrado:", coordinador);
      
      const requestData = {
        ...form,
        tutor: coordinador?.nombre || 'Por asignar',
        phoneNumber: form.phoneNumber || null,
      };
      
      console.log("Llamando a onRequest con:", requestData);
      onRequest(requestData)
      
      console.log("Cerrando modal");
      onClose()
    } catch (err) {
      console.error("Error en handleSubmit:", err);
      alert("Hubo un error interno al enviar el formulario: " + err.message);
    }
  }

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.header}>
          <h3>Solicitar Cita</h3>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Cerrar">
            <IconX size={18} />
          </button>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          <label className={styles.field}>
            <span>Nombre del estudiante</span>
            <input name="estudiante" value={form.estudiante} onChange={handleChange} required />
          </label>

          <div className={styles.row}>
            <label className={styles.field}>
              <span>Fecha deseada</span>
              <input type="date" name="fecha" value={form.fecha} onChange={handleChange} min={minDate} required />
            </label>
            <label className={styles.field}>
              <span>Hora preferida</span>
              <select name="hora" value={form.hora} onChange={handleChange} required disabled={!form.fecha}>
                <option value="" disabled>Selecciona una hora</option>
                {TIME_SLOTS.map(time => {
                  const isOccupied = citas.some(cita => 
                    cita.fecha === form.fecha && 
                    cita.hora === time &&
                    cita.tutor === selectedCoordinador?.nombre &&
                    cita.estado !== 'Cancelada'
                  )
                  return (
                    <option key={time} value={time} disabled={isOccupied}>
                      {time} {isOccupied ? '(Ocupado)' : ''}
                    </option>
                  )
                })}
              </select>
            </label>
          </div>

          {/* Coordinator Schedule Calendar */}
          {form.fecha && selectedCoordinador && (
            <div className={styles.scheduleCalendar}>
              <span className={styles.scheduleTitle}>Calendario de {selectedCoordinador.nombre} - {new Date(form.fecha).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
              <div className={styles.scheduleGrid}>
                {TIME_SLOTS.map(time => {
                  const isOccupied = citas.some(cita => 
                    cita.fecha === form.fecha && 
                    cita.hora === time &&
                    cita.tutor === selectedCoordinador.nombre &&
                    cita.estado !== 'Cancelada'
                  )
                  return (
                    <div 
                      key={time} 
                      className={`${styles.scheduleSlot} ${isOccupied ? styles.occupied : styles.available}`}
                    >
                      {time}
                      {isOccupied && <span className={styles.occupiedLabel}>Ocupado</span>}
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          <label className={styles.field}>
            <span>Coordinador</span>
            <select name="coordinadorId" value={form.coordinadorId} onChange={handleChange}>
              {COORDINADORES.map(c => (
                <option key={c.id} value={c.id}>{c.nombre}</option>
              ))}
            </select>
          </label>

          {selectedCoordinador && (
            <div className={styles.coordinatorInfo}>
              <div className={styles.coordinatorHeader}>
                <IconUser size={16} />
                <span className={styles.coordinatorName}>{selectedCoordinador.nombre}</span>
                <span className={styles.coordinatorType}>{selectedCoordinador.tipo}</span>
              </div>
              <div className={styles.coordinatorDetails}>
                <div className={styles.detailItem}>
                  <IconMail size={14} />
                  <span>{selectedCoordinador.correo}</span>
                </div>
                <div className={styles.detailItem}>
                  <IconClock size={14} />
                  <span>Horario: {selectedCoordinador.horario}</span>
                </div>
              </div>
            </div>
          )}

          <div className={styles.row}>
            <label className={styles.field}>
              <span>Tipo de cita</span>
              <select name="tipo" value={form.tipo} onChange={handleChange}>
                {TIPOS.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </label>
            <label className={styles.field}>
              <span>Motivo</span>
              <select name="motivo" value={form.motivo} onChange={handleChange}>
                {MOTIVOS.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </label>
          </div>

          <label className={styles.field}>
            <span>Descripción adicional (opcional)</span>
            <textarea 
              name="descripcion" 
              value={form.descripcion} 
              onChange={handleChange}
              rows={3}
              placeholder="Describe brevemente el motivo de la cita..."
            />
          </label>

          {/* Sección de número de WhatsApp */}
          <div className={styles.phoneSection}>
            <div className={styles.phoneSectionHeader}>
              <IconBrandWhatsapp size={16} className={styles.waIcon} />
              <span className={styles.phoneSectionTitle}>Notificación por WhatsApp</span>
            </div>

            {user?.phoneNumber && (
              <div className={styles.phoneToggle}>
                <label className={styles.toggleLabel}>
                  <input
                    type="checkbox"
                    checked={useDefaultPhone}
                    onChange={(e) => {
                      setUseDefaultPhone(e.target.checked)
                      setForm(prev => ({
                        ...prev,
                        phoneNumber: e.target.checked ? user.phoneNumber : ''
                      }))
                    }}
                    className={styles.toggleCheck}
                  />
                  <span>Usar mi número registrado</span>
                  <span className={styles.defaultPhone}>{user.phoneNumber}</span>
                </label>
              </div>
            )}

            {(!useDefaultPhone || !user?.phoneNumber) && (
              <label className={styles.field}>
                <span>Número de WhatsApp</span>
                <input
                  type="tel"
                  name="phoneNumber"
                  value={form.phoneNumber}
                  onChange={handleChange}
                  placeholder="+502 1234 5678"
                />
              </label>
            )}

            <p className={styles.phoneHint}>
              📱 Recibirás confirmación y recordatorios por WhatsApp en este número.
            </p>
          </div>

          <div className={styles.info}>
            <p>⚠️ Las solicitudes están sujetas a disponibilidad del coordinador.</p>
          </div>

          <div className={styles.actions}>
            <button type="button" className={styles.cancelBtn} onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className={styles.submitBtn}>
              Enviar solicitud
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
