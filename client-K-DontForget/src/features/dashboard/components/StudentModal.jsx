import { useState, useEffect } from 'react'
import { IconX } from '@tabler/icons-react'
import shared from '@/styles/shared.module.css'
import styles from './StudentModal.module.css'

export default function StudentModal({ isOpen, onClose, onSave, student }) {
  const [formData, setFormData] = useState({
    nombre: '',
    grado: '',
    tutor: '',
    tipoCita: 'Individual',
    ultimaCita: '',
  })

  useEffect(() => {
    if (student) {
      setFormData(student)
    } else {
      setFormData({
        nombre: '',
        grado: '',
        tutor: '',
        tipoCita: 'Individual',
        ultimaCita: '',
      })
    }
  }, [student, isOpen])

  function handleSubmit(e) {
    e.preventDefault()
    onSave(formData)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h3>{student ? 'Editar estudiante' : 'Agregar estudiante'}</h3>
          <button className={styles.closeBtn} onClick={onClose}>
            <IconX size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label>Nombre completo</label>
            <input
              type="text"
              value={formData.nombre}
              onChange={e => setFormData({ ...formData, nombre: e.target.value })}
              required
              placeholder="Nombre del estudiante"
            />
          </div>

          <div className={styles.formGroup}>
            <label>Grado</label>
            <select
              value={formData.grado}
              onChange={e => setFormData({ ...formData, grado: e.target.value })}
              required
            >
              <option value="">Seleccionar grado</option>
              <option value="1° Primaria">1° Primaria</option>
              <option value="2° Primaria">2° Primaria</option>
              <option value="3° Primaria">3° Primaria</option>
              <option value="4° Primaria">4° Primaria</option>
              <option value="5° Primaria">5° Primaria</option>
              <option value="6° Primaria">6° Primaria</option>
              <option value="1° Básico">1° Básico</option>
              <option value="2° Básico">2° Básico</option>
              <option value="3° Básico">3° Básico</option>
              <option value="4° Diversificado">4° Diversificado</option>
              <option value="5° Diversificado">5° Diversificado</option>
            </select>
          </div>

          <div className={styles.formGroup}>
            <label>Tutor asignado</label>
            <input
              type="text"
              value={formData.tutor}
              onChange={e => setFormData({ ...formData, tutor: e.target.value })}
              required
              placeholder="Nombre del tutor"
            />
          </div>

          <div className={styles.formGroup}>
            <label>Tipo de cita</label>
            <select
              value={formData.tipoCita}
              onChange={e => setFormData({ ...formData, tipoCita: e.target.value })}
            >
              <option value="Individual">Individual</option>
              <option value="Grupal">Grupal</option>
              <option value="Familiar">Familiar</option>
            </select>
          </div>

          <div className={styles.formGroup}>
            <label>Última cita</label>
            <input
              type="date"
              value={formData.ultimaCita}
              onChange={e => setFormData({ ...formData, ultimaCita: e.target.value })}
            />
          </div>

          <div className={styles.formActions}>
            <button type="button" className={shared.secondaryBtn} onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className={shared.primaryBtn}>
              {student ? 'Guardar cambios' : 'Agregar estudiante'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
