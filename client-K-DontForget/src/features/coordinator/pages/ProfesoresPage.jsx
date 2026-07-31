import { useState, useEffect } from 'react'
import { IconMail, IconClock, IconPhone, IconBook, IconUserCircle, IconBuilding, IconSearch, IconEdit, IconTrash, IconPlus, IconX } from '@tabler/icons-react'
import { useTranslation } from '@/shared/utils/i18n'
import shared from '@/styles/shared.module.css'
import styles from './ProfesoresPage.module.css'
import { getTeachers, createTeacher, updateTeacher, deleteTeacher } from '@/shared/api/teachers'

const MATERIAS = ['Matemáticas', 'Física', 'Química', 'Biología', 'Programación', 'Diseño Gráfico', 'Electrónica', 'Administración', 'Contabilidad', 'Inglés']

const GRADOS = [
  'Primero Bachillerato',
  'Segundo Bachillerato',
  'Tercero Bachillerato',
  'Cuarto Bachillerato',
  'Quinto Bachillerato',
  'Sexto Bachillerato'
]

export default function ProfesoresPage() {
  const [teachers, setTeachers] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterMateria, setFilterMateria] = useState('all')
  const [loading, setLoading] = useState(true)
  const { t } = useTranslation()

  // Modal y formulario
  const [showModal, setShowModal] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [currentTeacher, setCurrentTeacher] = useState(null)
  
  // Cloudinary
  const [uploadingImage, setUploadingImage] = useState(false)
  const [imageFile, setImageFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState('')

  const [formData, setFormData] = useState({
    nombre: '', materia: '', grados: [], correo: '', telefono: '',
    horarioInicio: '', horarioFin: '', estado: 'Activo', fotoUrl: ''
  })
  const [activeTab, setActiveTab] = useState('general')

  useEffect(() => {
    fetchTeachers()
  }, [])

  const fetchTeachers = async () => {
    try {
      setLoading(true)
      const res = await getTeachers()
      setTeachers(res.data)
    } catch (error) {
      console.error("Error al obtener profesores", error)
    } finally {
      setLoading(false)
    }
  }

  const uploadToCloudinary = async (file) => {
    const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
    const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET

    if (!CLOUD_NAME || CLOUD_NAME === "TU_CLOUD_NAME") {
      alert("Configura tu VITE_CLOUDINARY_CLOUD_NAME y VITE_CLOUDINARY_UPLOAD_PRESET en el archivo .env")
      return ""
    }

    const data = new FormData()
    data.append("file", file)
    data.append("upload_preset", UPLOAD_PRESET)

    try {
      const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
        method: "POST",
        body: data,
      })
      const result = await res.json()
      return result.secure_url
    } catch (error) {
      console.error("Error subiendo a Cloudinary", error)
      return ""
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    let finalFotoUrl = formData.fotoUrl

    // Si hay un archivo nuevo, subir a Cloudinary
    if (imageFile) {
      setUploadingImage(true)
      const uploadedUrl = await uploadToCloudinary(imageFile)
      if (uploadedUrl) finalFotoUrl = uploadedUrl
      setUploadingImage(false)
    }

    const payload = {
      ...formData,
      fotoUrl: finalFotoUrl,
      horario: `${formData.horarioInicio} - ${formData.horarioFin}`,
      grados: formData.grados
    }

    try {
      if (isEditing) {
        await updateTeacher(currentTeacher._id, payload)
      } else {
        await createTeacher(payload)
      }
      setShowModal(false)
      fetchTeachers()
    } catch (error) {
      console.error("Error al guardar el profesor", error)
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm(t('profCoord.confirmarEliminar'))) {
      try {
        await deleteTeacher(id)
        fetchTeachers()
      } catch (error) {
        console.error("Error al eliminar", error)
      }
    }
  }

  const openAddModal = () => {
    setIsEditing(false)
    setCurrentTeacher(null)
    setFormData({
      nombre: '', materia: '', grados: [], correo: '', telefono: '',
      horarioInicio: '', horarioFin: '', estado: 'Activo', fotoUrl: ''
    })
    setImageFile(null)
    setPreviewUrl('')
    setActiveTab('general')
    setShowModal(true)
  }

  const openEditModal = (teacher) => {
    setIsEditing(true)
    setCurrentTeacher(teacher)
    const [hInicio, hFin] = teacher.horario ? teacher.horario.split(' - ') : ['', '']
    setFormData({
      ...teacher,
      horarioInicio: hInicio || '',
      horarioFin: hFin || '',
      grados: teacher.grados || []
    })
    setImageFile(null)
    setPreviewUrl(teacher.fotoUrl || '')
    setActiveTab('general')
    setShowModal(true)
  }

  const handleGradosChange = (grado) => {
    if (formData.grados.includes(grado)) {
      setFormData({...formData, grados: formData.grados.filter(g => g !== grado)})
    } else {
      setFormData({...formData, grados: [...formData.grados, grado]})
    }
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setImageFile(file)
      setPreviewUrl(URL.createObjectURL(file))
    }
  }

  const filteredTeachers = teachers.filter(profesor => {
    const matchesSearch = profesor.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         profesor.materia.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterMateria === 'all' || profesor.materia === filterMateria
    return matchesSearch && matchesFilter
  })

  const materias = ['all', ...new Set(teachers.map(p => p.materia))]

  if (loading) return <div className={shared.page}><p>{t('profCoord.cargando')}</p></div>

  return (
    <div className={shared.page}>
      <div className={shared.pageHeader}>
        <h2 className={shared.sectionTitle}>{t('profCoord.title')}</h2>
        <button className={shared.primaryBtn} onClick={openAddModal}>
          <IconPlus size={18} />
          {t('profCoord.nuevo')}
        </button>
      </div>

      <div className={styles.filtersSection}>
        <div className={styles.searchBox}>
          <IconSearch size={18} className={styles.searchIcon} />
          <input
            type="text"
            placeholder={t('profCoord.buscar')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
        </div>
        <select
          value={filterMateria}
          onChange={(e) => setFilterMateria(e.target.value)}
          className={styles.filterSelect}
        >
          {materias.map(materia => (
            <option key={materia} value={materia}>
              {materia === 'all' ? t('profCoord.todasMaterias') : materia}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.statsRow}>
        <div className={styles.statItem}>
          <span className={styles.statNumber}>{teachers.length}</span>
          <span className={styles.statLabel}>{t('profCoord.totalProfesores')}</span>
        </div>
        <div className={styles.statItem}>
          <span className={styles.statNumber}>{teachers.filter(p => p.estado === 'Activo').length}</span>
          <span className={styles.statLabel}>{t('profCoord.activos')}</span>
        </div>
        <div className={styles.statItem}>
          <span className={styles.statNumber}>{teachers.filter(p => p.estado === 'Inactivo').length}</span>
          <span className={styles.statLabel}>{t('profCoord.inactivos')}</span>
        </div>
      </div>

      <div className={styles.grid}>
        {filteredTeachers.map(profesor => (
          <div key={profesor._id} className={`${shared.card} ${styles.professorCard}`}>
            <div className={styles.cardHeader}>
              <div className={styles.avatar}>
                {profesor.fotoUrl ? (
                  <img src={profesor.fotoUrl} alt={profesor.nombre} style={{ width: 80, height: 80, borderRadius: '50%', objectFit: 'cover' }} />
                ) : (
                  <IconUserCircle size={80} />
                )}
              </div>
              <div className={styles.headerInfo}>
                <h3 className={styles.professorName}>{profesor.nombre}</h3>
                <span className={styles.professorSubject}>{profesor.materia}</span>
                <span className={`${styles.statusBadge} ${profesor.estado === 'Activo' ? styles.active : styles.inactive}`}>
                  {profesor.estado === 'Activo' ? t('profCoord.activos') : t('profCoord.inactivos')}
                </span>
              </div>
            </div>

            <div className={styles.cardBody}>
              <div className={styles.gradesSection}>
                <span className={styles.gradesLabel}>{t('profCoord.grados')}</span>
                <div className={styles.gradesList}>
                  {profesor.grados?.map((grado, index) => (
                    <span key={index} className={styles.gradeTag}>{grado}</span>
                  ))}
                </div>
              </div>

              <div className={styles.contactSection}>
                <div className={styles.contactItem}>
                  <IconMail size={16} className={styles.contactIcon} />
                  <span className={styles.contactValue}>{profesor.correo}</span>
                </div>
                <div className={styles.contactItem}>
                  <IconPhone size={16} className={styles.contactIcon} />
                  <span className={styles.contactValue}>{profesor.telefono}</span>
                </div>
              </div>

              <div className={styles.actionsSection}>
                <button className={styles.actionBtn} onClick={() => openEditModal(profesor)}>
                  <IconEdit size={16} />
                  <span>{t('profCoord.editar')}</span>
                </button>
                <button className={`${styles.actionBtn} ${styles.deleteBtn}`} onClick={() => handleDelete(profesor._id)}>
                  <IconTrash size={16} />
                  <span>{t('profCoord.eliminar')}</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0, 0, 0, 0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div style={{ background: 'var(--bg-white)', borderRadius: '12px', width: '100%', maxWidth: '600px', overflow: 'hidden', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}>
            
            <div style={{ background: 'linear-gradient(135deg, var(--orange) 0%, var(--orange-dark) 100%)', color: 'white', padding: '1.5rem', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <div style={{ position: 'relative' }}>
                  {previewUrl ? (
                    <img src={previewUrl} alt="Preview" style={{ width: 96, height: 96, borderRadius: '50%', objectFit: 'cover', border: '3px solid rgba(255,255,255,0.5)' }} />
                  ) : (
                    <div style={{ width: 96, height: 96, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <IconUserCircle size={64} color="white" />
                    </div>
                  )}
                  <label style={{ position: 'absolute', bottom: 0, right: 0, background: '#fff', color: 'var(--orange)', borderRadius: '50%', padding: '6px', cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>
                    <IconEdit size={16} />
                    <input type="file" accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} />
                  </label>
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 'bold' }}>{isEditing ? t('profCoord.editarProfesor') : t('profCoord.crearProfesor')}</h3>
                  <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.875rem', opacity: 0.8 }}>{t('profCoord.completaInfo')}</p>
                </div>
              </div>
              <button onClick={() => setShowModal(false)} style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer', opacity: 0.8 }}>
                <IconX size={24} />
              </button>
            </div>
            
            <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', padding: '0 1rem' }}>
              <button 
                type="button"
                onClick={() => setActiveTab('general')}
                style={{
                  padding: '1rem', background: 'none', border: 'none', borderBottom: activeTab === 'general' ? '2px solid var(--orange)' : '2px solid transparent',
                  color: activeTab === 'general' ? 'var(--orange)' : 'var(--text-secondary)', fontWeight: activeTab === 'general' ? '600' : '500', cursor: 'pointer', fontSize: '0.9rem'
                }}
              >
                {t('profCoord.infoGeneral')}
              </button>
              <button 
                type="button"
                onClick={() => setActiveTab('contacto')}
                style={{
                  padding: '1rem', background: 'none', border: 'none', borderBottom: activeTab === 'contacto' ? '2px solid var(--orange)' : '2px solid transparent',
                  color: activeTab === 'contacto' ? 'var(--orange)' : 'var(--text-secondary)', fontWeight: activeTab === 'contacto' ? '600' : '500', cursor: 'pointer', fontSize: '0.9rem'
                }}
              >
                {t('profCoord.contactoDetalles')}
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ padding: '1.5rem', maxHeight: '60vh', overflowY: 'auto' }}>
              
              {activeTab === 'general' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: 'var(--text-primary)', fontSize: '0.9rem' }}>{t('profCoord.nombreCompleto')}</label>
                    <input required type="text" value={formData.nombre} onChange={e => setFormData({...formData, nombre: e.target.value})} style={{ width: '100%', padding: '0.625rem', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--bg-surface)', color: 'var(--text-primary)', outline: 'none' }} placeholder="Ej: Ing. Carlos López" />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: 'var(--text-primary)', fontSize: '0.9rem' }}>{t('profCoord.materiaPrincipal')}</label>
                    <select required value={formData.materia} onChange={e => setFormData({...formData, materia: e.target.value})} style={{ width: '100%', padding: '0.625rem', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--bg-surface)', color: 'var(--text-primary)', outline: 'none' }}>
                      <option value="">Selecciona una materia</option>
                      {MATERIAS.map(materia => (
                        <option key={materia} value={materia}>{materia}</option>
                      ))}
                    </select>
                  </div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: 'var(--text-primary)', fontSize: '0.9rem' }}>{t('profCoord.gradosImparte')}</label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                      {GRADOS.map(grado => (
                        <label key={grado} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', padding: '0.5rem 0.75rem', borderRadius: '6px', border: `1px solid ${formData.grados.includes(grado) ? 'var(--orange)' : 'var(--border)'}`, background: formData.grados.includes(grado) ? 'rgba(201, 168, 76, 0.1)' : 'var(--bg-surface)', color: 'var(--text-primary)', fontSize: '0.875rem' }}>
                          <input type="checkbox" checked={formData.grados.includes(grado)} onChange={() => handleGradosChange(grado)} style={{ display: 'none' }} />
                          {grado}
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'contacto' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: 'var(--text-primary)', fontSize: '0.9rem' }}>{t('profCoord.correo')}</label>
                    <input required type="email" value={formData.correo} onChange={e => setFormData({...formData, correo: e.target.value})} style={{ width: '100%', padding: '0.625rem', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--bg-surface)', color: 'var(--text-primary)', outline: 'none' }} placeholder="correo@kinal.edu.gt" />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: 'var(--text-primary)', fontSize: '0.9rem' }}>{t('profCoord.telefono')}</label>
                    <input 
                      required 
                      type="text" 
                      value={formData.telefono} 
                      onChange={e => {
                        const val = e.target.value.replace(/[^0-9]/g, '');
                        setFormData({...formData, telefono: val});
                      }} 
                      style={{ width: '100%', padding: '0.625rem', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--bg-surface)', color: 'var(--text-primary)', outline: 'none' }} 
                      placeholder="Ej: 55551234" 
                    />
                  </div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: 'var(--text-primary)', fontSize: '0.9rem' }}>{t('profCoord.horarioAtencion')}</label>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                      <input required type="time" value={formData.horarioInicio} onChange={e => setFormData({...formData, horarioInicio: e.target.value})} style={{ flex: 1, padding: '0.625rem', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--bg-surface)', color: 'var(--text-primary)', outline: 'none' }} />
                      <span style={{ color: 'var(--text-primary)' }}>a</span>
                      <input required type="time" value={formData.horarioFin} onChange={e => setFormData({...formData, horarioFin: e.target.value})} style={{ flex: 1, padding: '0.625rem', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--bg-surface)', color: 'var(--text-primary)', outline: 'none' }} />
                    </div>
                  </div>
                  <div style={{ gridColumn: '1 / -1', marginTop: '0.5rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: 'var(--text-primary)', fontSize: '0.9rem' }}>{t('profCoord.estadoProfesor')}</label>
                    <select value={formData.estado} onChange={e => setFormData({...formData, estado: e.target.value})} style={{ width: '100%', padding: '0.625rem', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--bg-surface)', color: 'var(--text-primary)', outline: 'none' }}>
                      <option value="Activo">{t('profCoord.activoClases')}</option>
                      <option value="Inactivo">{t('profCoord.inactivoFuera')}</option>
                    </select>
                  </div>
                </div>
              )}
              
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem', borderTop: '1px solid var(--border)', paddingTop: '1.5rem' }}>
                <button type="button" onClick={() => setShowModal(false)} style={{ padding: '0.625rem 1.25rem', background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '6px', cursor: 'pointer', fontWeight: '500', color: 'var(--text-primary)' }}>
                  {t('profCoord.cancelar')}
                </button>
                <button type="submit" disabled={uploadingImage} style={{ padding: '0.625rem 1.25rem', background: 'var(--orange)', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '500', minWidth: '130px', display: 'flex', justifyContent: 'center' }}>
                  {uploadingImage ? t('profCoord.subiendo') : (isEditing ? t('profCoord.guardarCambios') : t('profCoord.crearBtn'))}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
