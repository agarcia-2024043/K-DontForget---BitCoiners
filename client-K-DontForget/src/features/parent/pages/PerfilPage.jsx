import { useState } from 'react'
import { IconUser, IconMail, IconPhone, IconMapPin, IconEdit } from '@tabler/icons-react'
import { useTranslation } from '@/shared/utils/i18n'
import shared from '@/styles/shared.module.css'
import styles from './PerfilPage.module.css'
import { useAuthStore } from '@/features/auth/store/authStore'

export default function PerfilPage() {
  const { user } = useAuthStore()
  const { t } = useTranslation()
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({
    nombre: user?.nombre || 'Juan Pérez',
    email: user?.email || 'padre@kinal.edu.gt',
    telefono: '+502 5555-1234',
    direccion: 'Ciudad de Guatemala, Guatemala',
    hijos: 'María Pérez (4to Bachillerato)',
  })

  function handleChange(e) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  function handleSave() {
    // TODO: save to API
    setEditing(false)
  }

  function handleCancel() {
    setForm({
      nombre: user?.nombre || 'Juan Pérez',
      email: user?.email || 'padre@kinal.edu.gt',
      telefono: '+502 5555-1234',
      direccion: 'Ciudad de Guatemala, Guatemala',
      hijos: 'María Pérez (4to Bachillerato)',
    })
    setEditing(false)
  }

  return (
    <div className={shared.page}>
      <div className={shared.pageHeader}>
        <h2 className={shared.sectionTitle}>{t('perfil.title')}</h2>
        {!editing && (
          <button className={shared.primaryBtn} onClick={() => setEditing(true)}>
            <IconEdit size={16} />
            {t('perfil.editarPerfil')}
          </button>
        )}
      </div>

      <div className={styles.profileGrid}>
        {/* Profile Card */}
        <div className={`${shared.card} ${shared.cardPad} ${styles.profileCard}`}>
          <div className={styles.avatarSection}>
            <div className={styles.avatar}>
              {form.nombre.split(' ').map(n => n[0]).join('').toUpperCase()}
            </div>
            <div className={styles.avatarInfo}>
              <h3 className={styles.profileName}>{form.nombre}</h3>
              <span className={styles.profileRole}>{t('perfil.padreFamilia')}</span>
            </div>
          </div>

          <div className={styles.infoSection}>
            <div className={styles.infoItem}>
              <IconMail size={18} className={styles.infoIcon} />
              <div>
                <span className={styles.infoLabel}>{t('perfil.correo')}</span>
                <span className={styles.infoValue}>{form.email}</span>
              </div>
            </div>

            <div className={styles.infoItem}>
              <IconPhone size={18} className={styles.infoIcon} />
              <div>
                <span className={styles.infoLabel}>{t('perfil.telefono')}</span>
                <span className={styles.infoValue}>{form.telefono}</span>
              </div>
            </div>

            <div className={styles.infoItem}>
              <IconMapPin size={18} className={styles.infoIcon} />
              <div>
                <span className={styles.infoLabel}>{t('perfil.direccion')}</span>
                <span className={styles.infoValue}>{form.direccion}</span>
              </div>
            </div>

            <div className={styles.infoItem}>
              <IconUser size={18} className={styles.infoIcon} />
              <div>
                <span className={styles.infoLabel}>{t('perfil.hijosSistema')}</span>
                <span className={styles.infoValue}>{form.hijos}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Edit Form */}
        {editing && (
          <div className={`${shared.card} ${shared.cardPad} ${styles.editCard}`}>
            <h3 className={styles.editTitle}>{t('perfil.editarInfo')}</h3>
            <form className={styles.editForm} onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
              <label className={styles.field}>
                <span>{t('perfil.nombreCompleto')}</span>
                <input name="nombre" value={form.nombre} onChange={handleChange} />
              </label>

              <label className={styles.field}>
                <span>{t('perfil.correo')}</span>
                <input type="email" name="email" value={form.email} onChange={handleChange} disabled />
              </label>

              <label className={styles.field}>
                <span>{t('perfil.telefono')}</span>
                <input name="telefono" value={form.telefono} onChange={handleChange} />
              </label>

              <label className={styles.field}>
                <span>{t('perfil.direccion')}</span>
                <input name="direccion" value={form.direccion} onChange={handleChange} />
              </label>

              <div className={styles.editActions}>
                <button type="button" className={styles.cancelBtn} onClick={handleCancel}>
                  {t('perfil.cancelar')}
                </button>
                <button type="submit" className={styles.saveBtn}>
                  {t('perfil.guardar')}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Quick Stats */}
        <div className={`${shared.card} ${shared.cardPad} ${styles.statsCard}`}>
          <h3 className={styles.statsTitle}>{t('perfil.estadisticas')}</h3>
          <div className={styles.statItem}>
            <span className={styles.statNumber}>12</span>
            <span className={styles.statLabel}>{t('perfil.citasTotales')}</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statNumber}>89%</span>
            <span className={styles.statLabel}>{t('perfil.asistencia')}</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statNumber}>2</span>
            <span className={styles.statLabel}>{t('perfil.hijosActivos')}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
