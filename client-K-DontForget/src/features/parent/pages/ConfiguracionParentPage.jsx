import { IconPalette, IconSun, IconMoon, IconDeviceDesktop, IconLanguage } from '@tabler/icons-react'
import shared from '@/styles/shared.module.css'
import styles from './ConfiguracionParentPage.module.css'
import { useSettingsStore } from '@/shared/store/settingsStore'
import { useTranslation } from '@/shared/utils/i18n'

const THEME_OPTIONS = [
  { value: 'claro', iconKey: 'sun' },
  { value: 'oscuro', iconKey: 'moon' },
  { value: 'sistema', iconKey: 'desktop' },
]

const ICON_MAP = {
  sun: IconSun,
  moon: IconMoon,
  desktop: IconDeviceDesktop,
}

export default function ConfiguracionParentPage() {
  const { t } = useTranslation()
  const { theme, language, setTheme, setLanguage } = useSettingsStore()

  return (
    <div className={shared.page}>
      <div className={shared.pageHeader}>
        <h2 className={shared.sectionTitle}>{t('parentConfig.title')}</h2>
      </div>

      <div className={styles.grid}>
        {/* Theme Card */}
        <div className={`${shared.card} ${shared.cardPad} ${styles.settingCard}`}>
          <div className={styles.cardHeader}>
            <IconPalette size={20} className={styles.cardIcon} />
            <div>
              <h3 className={styles.cardTitle}>{t('config.tema')}</h3>
              <p className={styles.cardDesc}>{t('parentConfig.temaDesc')}</p>
            </div>
          </div>

          <div className={styles.themeOptions}>
            {THEME_OPTIONS.map(({ value, iconKey }) => {
              const Icon = ICON_MAP[iconKey]
              const labelKey = value === 'claro' ? 'config.temaClaro' : value === 'oscuro' ? 'config.temaOscuro' : 'config.temaSistema'
              return (
                <button
                  key={value}
                  className={`${styles.themeBtn} ${theme === value ? styles.themeBtnActive : ''}`}
                  onClick={() => setTheme(value)}
                >
                  <Icon size={22} stroke={1.5} />
                  <span>{t(labelKey)}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Language Card */}
        <div className={`${shared.card} ${shared.cardPad} ${styles.settingCard}`}>
          <div className={styles.cardHeader}>
            <IconLanguage size={20} className={styles.cardIcon} />
            <div>
              <h3 className={styles.cardTitle}>{t('config.idioma')}</h3>
              <p className={styles.cardDesc}>{t('parentConfig.idiomaDesc')}</p>
            </div>
          </div>

          <div className={styles.langOptions}>
            <button
              className={`${styles.langBtn} ${language === 'es' ? styles.langBtnActive : ''}`}
              onClick={() => setLanguage('es')}
            >
              <span className={styles.langFlag}>🇬🇹</span>
              <span>{t('config.idiomaEs')}</span>
            </button>
            <button
              className={`${styles.langBtn} ${language === 'en' ? styles.langBtnActive : ''}`}
              onClick={() => setLanguage('en')}
            >
              <span className={styles.langFlag}>🇺🇸</span>
              <span>{t('config.idiomaEn')}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
