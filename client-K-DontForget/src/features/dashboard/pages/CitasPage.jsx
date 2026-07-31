import { useState, useMemo } from 'react'
import { IconPlus, IconEdit, IconTrash, IconSearch } from '@tabler/icons-react'
import shared from '@/styles/shared.module.css'
import AppointmentModal from '../components/AppointmentModal'
import { useAppointments } from '../hooks/useAppointments'

const ESTADOS = ['Todos', 'Pendiente', 'Confirmada', 'Cancelada']

function EstadoBadge({ estado }) {
  const map = {
    Pendiente:  shared.badgePending,
    Confirmada: shared.badgeConfirmed,
    Cancelada: shared.badgeCancelled,
  }
  return <span className={`${shared.badge} ${map[estado] ?? ''}`}>{estado}</span>
}

function initials(name) {
  return name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
}

export default function CitasPage() {
  const { citas, removeCita } = useAppointments()
  const [search, setSearch] = useState('')
  const [estadoFilter, setEstadoFilter] = useState('Todos')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingCita, setEditingCita] = useState(null)

  const filtered = useMemo(() => {
    return citas.filter(c => {
      const matchesSearch = c.estudiante.toLowerCase().includes(search.toLowerCase())
      const matchesEstado = estadoFilter === 'Todos' || c.estado === estadoFilter
      return matchesSearch && matchesEstado
    })
  }, [citas, search, estadoFilter])

  function openCreate() {
    setEditingCita(null)
    setModalOpen(true)
  }

  function openEdit(cita) {
    setEditingCita(cita)
    setModalOpen(true)
  }

  return (
    <div className={shared.page}>
      <div className={shared.pageHeader}>
        <h2 className={shared.sectionTitle}>Gestión de citas</h2>
        <button className={shared.primaryBtn} onClick={openCreate}>
          <IconPlus size={16} />
          Nueva cita
        </button>
      </div>

      {/* Filters */}
      <div className={shared.filters}>
        <div className={shared.searchInput} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <IconSearch size={15} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
          <input
            style={{ border: 'none', outline: 'none', width: '100%', fontSize: 13 }}
            placeholder="Buscar estudiante..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select
          className={shared.select}
          value={estadoFilter}
          onChange={e => setEstadoFilter(e.target.value)}
        >
          {ESTADOS.map(e => <option key={e} value={e}>{e}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className={shared.card}>
        <table className={shared.table}>
          <thead>
            <tr>
              <th>Estudiante</th>
              <th>Fecha / Hora</th>
              <th>Tutor</th>
              <th>Tipo</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(cita => (
              <tr key={cita.id}>
                <td>
                  <div className={shared.rowName}>
                    <span className={shared.avatar}>{initials(cita.estudiante)}</span>
                    {cita.estudiante}
                  </div>
                </td>
                <td>{cita.fecha} &middot; {cita.hora}</td>
                <td>{cita.tutor}</td>
                <td>{cita.tipo}</td>
                <td><EstadoBadge estado={cita.estado} /></td>
                <td>
                  <button className={shared.iconBtn} onClick={() => openEdit(cita)} aria-label="Editar">
                    <IconEdit size={16} />
                  </button>
                  <button className={shared.iconBtn} onClick={() => removeCita(cita.id)} aria-label="Eliminar">
                    <IconTrash size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <p className={shared.emptyState}>No hay citas que coincidan con la búsqueda.</p>
        )}
      </div>

      {modalOpen && (
        <AppointmentModal
          cita={editingCita}
          onClose={() => setModalOpen(false)}
        />
      )}
    </div>
  )
}
