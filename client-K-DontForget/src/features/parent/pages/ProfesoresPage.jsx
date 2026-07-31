import { useState, useEffect } from 'react'
import { IconMail, IconClock, IconPhone, IconUserCircle } from '@tabler/icons-react'
import { useTranslation } from '@/shared/utils/i18n'
import shared from '@/styles/shared.module.css'
import styles from './ProfesoresPage.module.css'
import { getTeachers } from '@/shared/api/teachers'

export default function ProfesoresPage() {
  const [teachers, setTeachers] = useState([])
  const [loading, setLoading] = useState(true)
  const { t } = useTranslation()

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

  if (loading) return <div className={shared.page}><p>{t('parentProf.cargando')}</p></div>

  return (
    <div className={shared.page}>
      <div className={shared.pageHeader}>
        <h2 className={shared.sectionTitle}>{t('parentProf.title')}</h2>
      </div>

      <div className={styles.intro}>
        <p>{t('parentProf.intro')}</p>
      </div>

      <div className={styles.grid}>
        {teachers.filter(t => t.estado === 'Activo').map(profesor => (
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
                <div className={styles.gradesList} style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap', marginTop: '0.25rem' }}>
                  {profesor.grados?.map((grado, index) => (
                    <span key={index} className={styles.professorGrade} style={{ fontSize: '0.75rem', background: '#e0e7ff', color: '#3730a3', padding: '0.1rem 0.5rem', borderRadius: '12px' }}>
                      {grado}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className={styles.cardBody}>
              <div className={styles.contactSection}>
                <h4 className={styles.sectionTitle}>{t('parentProf.infoContacto')}</h4>
                
                <div className={styles.contactItem}>
                  <IconMail size={18} className={styles.contactIcon} />
                  <div className={styles.contactDetails}>
                    <span className={styles.contactLabel}>{t('parentProf.correo')}</span>
                    <a href={`mailto:${profesor.correo}`} className={styles.contactValue}>
                      {profesor.correo}
                    </a>
                  </div>
                </div>

                <div className={styles.contactItem}>
                  <IconPhone size={18} className={styles.contactIcon} />
                  <div className={styles.contactDetails}>
                    <span className={styles.contactLabel}>{t('parentProf.telefono')}</span>
                    <span className={styles.contactValue}>{profesor.telefono}</span>
                  </div>
                </div>

                <div className={styles.contactItem}>
                  <IconClock size={18} className={styles.contactIcon} />
                  <div className={styles.contactDetails}>
                    <span className={styles.contactLabel}>{t('parentProf.horario')}</span>
                    <span className={styles.contactValue}>{profesor.horario}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
