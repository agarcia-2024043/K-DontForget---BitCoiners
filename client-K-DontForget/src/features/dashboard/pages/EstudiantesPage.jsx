import { useState, useMemo } from 'react'
import { IconPlus, IconEdit, IconTrash, IconSearch } from '@tabler/icons-react'
import shared from '@/styles/shared.module.css'
import { useStudents } from '../hooks/useStudents'
import { useTranslation } from '@/shared/utils/i18n'
import StudentModal from '../components/StudentModal'

function initials(name) {
  return name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
}

export default function EstudiantesPage() {
  const { students, addStudent, updateStudent, removeStudent } = useStudents()
  const { t } = useTranslation()
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingStudent, setEditingStudent] = useState(null)

  const filtered = useMemo(() => {
    return students.filter(s =>
      s.nombre.toLowerCase().includes(search.toLowerCase())
    )
  }, [students, search])

  function handleAddStudent() {
    setEditingStudent(null)
    setModalOpen(true)
  }

  function handleEditStudent(student) {
    setEditingStudent(student)
    setModalOpen(true)
  }

  function handleSaveStudent(studentData) {
    if (editingStudent) {
      updateStudent(editingStudent.id, studentData)
    } else {
      addStudent(studentData)
    }
  }

  return (
    <div className={shared.page}>
      <div className={shared.pageHeader}>
        <h2 className={shared.sectionTitle}>{t('estudiantes.title')}</h2>
        <button className={shared.primaryBtn} onClick={handleAddStudent}>
          <IconPlus size={16} />
          {t('estudiantes.agregar')}
        </button>
      </div>

      <div className={shared.filters}>
        <div className={shared.searchInput} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <IconSearch size={15} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
          <input
            style={{ border: 'none', outline: 'none', width: '100%', fontSize: 13, background: 'transparent', color: 'var(--text-primary)' }}
            placeholder={t('estudiantes.buscar')}
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className={shared.card}>
        <table className={shared.table}>
          <thead>
            <tr>
              <th>{t('estudiantes.thEstudiante')}</th>
              <th>{t('estudiantes.thGrado')}</th>
              <th>{t('estudiantes.thTutor')}</th>
              <th>{t('estudiantes.thTipoCita')}</th>
              <th>{t('estudiantes.thUltimaCita')}</th>
              <th>{t('estudiantes.thAcciones')}</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(s => (
              <tr key={s.id}>
                <td>
                  <div className={shared.rowName}>
                    <span className={shared.avatar}>{initials(s.nombre)}</span>
                    {s.nombre}
                  </div>
                </td>
                <td>{s.grado}</td>
                <td>{s.tutor}</td>
                <td>{s.tipoCita}</td>
                <td>{s.ultimaCita}</td>
                <td>
                  <button className={shared.iconBtn} onClick={() => handleEditStudent(s)} aria-label="Editar">
                    <IconEdit size={16} />
                  </button>
                  <button className={shared.iconBtn} onClick={() => removeStudent(s.id)} aria-label="Eliminar">
                    <IconTrash size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <p className={shared.emptyState}>{t('estudiantes.vacio')}</p>
        )}
      </div>

      {modalOpen && (
        <StudentModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          onSave={handleSaveStudent}
          student={editingStudent}
        />
      )}
    </div>
  )
}
