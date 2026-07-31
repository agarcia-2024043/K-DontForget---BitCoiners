import { useState } from 'react'
import { IconClock, IconShield, IconPalette, IconDatabase, IconUsers, IconGlobe } from '@tabler/icons-react'
import shared from '@/styles/shared.module.css'
import styles from './ConfiguracionPage.module.css'
import { useSettingsStore } from '@/shared/store/settingsStore'
import { useTranslation } from '@/shared/utils/i18n'

export default function ConfiguracionPage() {
  const { t } = useTranslation()
  const { theme, language, setTheme, setLanguage } = useSettingsStore()

  const [form, setForm] = useState({
    nombreOrganizacion: 'Fundación Kinal',
    correoNotificaciones: 'notificaciones@kinal.edu.gt',
    recordatorioHoras: 24,
    notificacionesEmail: true,
    notificacionesSMS: false,
    horaInicio: '08:00',
    horaFin: '17:00',
    diasLaborales: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'],
    backupAutomatico: true,
    frecuenciaBackup: 'diario',
    dosFactorAuth: false,
    permitirRegistroPadres: true,
  })
  const [saved, setSaved] = useState(false)

  function handleChange(e) {
    const { name, type, checked, value } = e.target
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
  }

  function handleDayToggle(day) {
    setForm(prev => ({
      ...prev,
      diasLaborales: prev.diasLaborales.includes(day)
        ? prev.diasLaborales.filter(d => d !== day)
        : [...prev.diasLaborales, day]
    }))
  }

  function handleThemeChange(e) {
    setTheme(e.target.value)
  }

  function handleLanguageChange(e) {
    setLanguage(e.target.value)
  }

  function handleSubmit(e) {
    e.preventDefault()
    // TODO: send `form` to settingsApi.update(form)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  const DAYS = [
    { key: 'Lunes', label: t('day.lunes') },
    { key: 'Martes', label: t('day.martes') },
    { key: 'Miércoles', label: t('day.miercoles') },
    { key: 'Jueves', label: t('day.jueves') },
    { key: 'Viernes', label: t('day.viernes') },
    { key: 'Sábado', label: t('day.sabado') },
  ]

  return (
    <div className={shared.page}>
      <div className={shared.pageHeader}>
        <h2 className={shared.sectionTitle}>{t('config.title')}</h2>
      </div>

      <form className={`${shared.card} ${shared.cardPad} ${styles.form}`} onSubmit={handleSubmit}>
        <section className={styles.section}>
          <h3 className={styles.sectionHeading}><IconClock size={18} /> {t('config.general')}</h3>

          <label className={styles.field}>
            <span>{t('config.nombreOrg')}</span>
            <input
              name="nombreOrganizacion"
              value={form.nombreOrganizacion}
              onChange={handleChange}
            />
          </label>

          <label className={styles.field}>
            <span>{t('config.correoNotif')}</span>
            <input
              type="email"
              name="correoNotificaciones"
              value={form.correoNotificaciones}
              onChange={handleChange}
            />
          </label>

          <label className={styles.field}>
            <span>{t('config.recordatorio')}</span>
            <input
              type="number"
              name="recordatorioHoras"
              min="1"
              max="72"
              value={form.recordatorioHoras}
              onChange={handleChange}
            />
          </label>
        </section>

        <section className={styles.section}>
          <h3 className={styles.sectionHeading}><IconClock size={18} /> {t('config.horarios')}</h3>

          <div className={styles.row}>
            <label className={styles.field}>
              <span>{t('config.horaInicio')}</span>
              <input
                type="time"
                name="horaInicio"
                value={form.horaInicio}
                onChange={handleChange}
              />
            </label>

            <label className={styles.field}>
              <span>{t('config.horaFin')}</span>
              <input
                type="time"
                name="horaFin"
                value={form.horaFin}
                onChange={handleChange}
              />
            </label>
          </div>

          <label className={styles.field}>
            <span>{t('config.diasLaborales')}</span>
            <div className={styles.daysGrid}>
              {DAYS.map(({ key, label }) => (
                <button
                  key={key}
                  type="button"
                  className={`${styles.dayBtn} ${form.diasLaborales.includes(key) ? styles.dayActive : ''}`}
                  onClick={() => handleDayToggle(key)}
                >
                  {label.substring(0, 3)}
                </button>
              ))}
            </div>
          </label>
        </section>

        <section className={styles.section}>
          <h3 className={styles.sectionHeading}><IconUsers size={18} /> {t('config.usuarios')}</h3>

          <label className={styles.checkRow}>
            <input
              type="checkbox"
              name="permitirRegistroPadres"
              checked={form.permitirRegistroPadres}
              onChange={handleChange}
            />
            <span>{t('config.permitirRegistro')}</span>
          </label>

          <label className={styles.checkRow}>
            <input
              type="checkbox"
              name="requerirAprobacionPadres"
              checked={form.requerirAprobacionPadres}
              onChange={handleChange}
            />
            <span>{t('config.requerirAprobacion')}</span>
          </label>
        </section>

        <section className={styles.section}>
          <h3 className={styles.sectionHeading}><IconShield size={18} /> {t('config.seguridad')}</h3>

          <label className={styles.checkRow}>
            <input
              type="checkbox"
              name="dosFactorAuth"
              checked={form.dosFactorAuth}
              onChange={handleChange}
            />
            <span>{t('config.2fa')}</span>
          </label>

          <label className={styles.checkRow}>
            <input
              type="checkbox"
              name="sesionUnica"
              checked={form.sesionUnica}
              onChange={handleChange}
            />
            <span>{t('config.sesionUnica')}</span>
          </label>

          <label className={styles.field}>
            <span>{t('config.tiempoSesion')}</span>
            <input
              type="number"
              name="tiempoSesion"
              min="15"
              max="480"
              value={form.tiempoSesion || 60}
              onChange={handleChange}
            />
          </label>
        </section>

        <section className={styles.section}>
          <h3 className={styles.sectionHeading}><IconPalette size={18} /> {t('config.apariencia')}</h3>

          <label className={styles.field}>
            <span>{t('config.tema')}</span>
            <select
              name="tema"
              value={theme}
              onChange={handleThemeChange}
            >
              <option value="claro">{t('config.temaClaro')}</option>
              <option value="oscuro">{t('config.temaOscuro')}</option>
              <option value="sistema">{t('config.temaSistema')}</option>
            </select>
          </label>

          <label className={styles.field}>
            <span>{t('config.idioma')}</span>
            <select
              name="idioma"
              value={language}
              onChange={handleLanguageChange}
            >
              <option value="es">{t('config.idiomaEs')}</option>
              <option value="en">{t('config.idiomaEn')}</option>
            </select>
          </label>
        </section>

        <section className={styles.section}>
          <h3 className={styles.sectionHeading}><IconDatabase size={18} /> {t('config.respaldo')}</h3>

          <label className={styles.checkRow}>
            <input
              type="checkbox"
              name="backupAutomatico"
              checked={form.backupAutomatico}
              onChange={handleChange}
            />
            <span>{t('config.backupAuto')}</span>
          </label>

          <label className={styles.field}>
            <span>{t('config.frecuencia')}</span>
            <select
              name="frecuenciaBackup"
              value={form.frecuenciaBackup}
              onChange={handleChange}
            >
              <option value="diario">{t('config.diario')}</option>
              <option value="semanal">{t('config.semanal')}</option>
              <option value="mensual">{t('config.mensual')}</option>
            </select>
          </label>

          <button type="button" className={shared.secondaryBtn}>
            <IconDatabase size={16} />
            {t('config.backupManual')}
          </button>
        </section>

        <div className={styles.actions}>
          {saved && <span className={styles.savedMsg}>{t('config.guardado')}</span>}
          <button type="submit" className={shared.primaryBtn}>
            {t('config.guardar')}
          </button>
        </div>
      </form>
    </div>
  )
}
