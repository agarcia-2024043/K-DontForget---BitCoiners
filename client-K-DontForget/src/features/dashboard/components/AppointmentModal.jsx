import { useState } from 'react'
import { IconX } from '@tabler/icons-react'
import styles from './AppointmentModal.module.css'
import { useAppointments } from '../hooks/useAppointments'

const ESTADOS = ['Pendiente', 'Confirmada', 'Cancelada']
const TIPOS = ['Individual', 'Grupal']

export default function AppointmentModal({ cita, onClose }) {
  const { addCita, updateCita } = useAppointments()
  const isEditing = Boolean(cita)
  const [form, setForm] = useState({
    estudiante: cita?.estudiante ?? '',
    fecha: cita?.fecha ?? '',
    hora: cita?.hora ?? '',
    tutor: cita?.tutor ?? '',
    tipo: cita?.tipo ?? TIPOS[0],
    estado: cita?.estado ?? ESTADOS[0],
  })

  function handleChange(e) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (isEditing) {
      updateCita(cita.id, form)
    } else {
      addCita(form)
    }
    onClose()
  }

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.header}>
          <h3>{isEditing ? 'Editar cita' : 'Nueva cita'}</h3>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Cerrar">
            <IconX size={18} />
          </button>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          <label className={styles.field}>
            <span>Estudiante</span>
            <input name="estudiante" value={form.estudiante} onChange={handleChange} required />
          </label>

          <div className={styles.row}>
            <label className={styles.field}>
              <span>Fecha</span>
              <input type="date" name="fecha" value={form.fecha} onChange={handleChange} required />
            </label>
            <label className={styles.field}>
              <span>Hora</span>
              <input type="time" name="hora" value={form.hora} onChange={handleChange} required />
            </label>
          </div>

          <label className={styles.field}>
            <span>Tutor</span>
            <input name="tutor" value={form.tutor} onChange={handleChange} required />
          </label>

          <div className={styles.row}>
            <label className={styles.field}>
              <span>Tipo de cita</span>
              <select name="tipo" value={form.tipo} onChange={handleChange}>
                {TIPOS.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </label>
            <label className={styles.field}>
              <span>Estado</span>
              <select name="estado" value={form.estado} onChange={handleChange}>
                {ESTADOS.map(e => <option key={e} value={e}>{e}</option>)}
              </select>
            </label>
          </div>

          <div className={styles.actions}>
            <button type="button" className={styles.cancelBtn} onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className={styles.saveBtn}>
              {isEditing ? 'Guardar cambios' : 'Crear cita'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
