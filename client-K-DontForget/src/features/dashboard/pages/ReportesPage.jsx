import { useState, useMemo } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts'
import { IconCalendar } from '@tabler/icons-react'
import { useAppointments } from '@/features/dashboard/hooks/useAppointments'
import { useTranslation } from '@/shared/utils/i18n'
import shared from '@/styles/shared.module.css'
import styles from './ReportesPage.module.css'

export default function ReportesPage() {
  const [periodo, setPeriodo] = useState('mes')
  const { citas } = useAppointments()
  const { t } = useTranslation()

  // Calculate real data from appointments
  const reportData = useMemo(() => {
    const confirmed = citas.filter(c => c.estado === 'Confirmada').length
    const pending = citas.filter(c => c.estado === 'Pendiente').length
    const cancelled = citas.filter(c => c.estado === 'Cancelada').length
    const total = citas.length

    // Calculate by day of week
    const dayKeys = [t('cal.dom'), t('cal.lun'), t('cal.mar'), t('cal.mie'), t('cal.jue'), t('cal.vie'), t('cal.sab')]
    const citasPorDia = dayKeys.map((dia, index) => ({
      dia,
      citas: citas.filter(c => {
        const date = new Date(c.fecha)
        return date.getDay() === index
      }).length
    }))

    // Calculate by tutor
    const citasPorTutor = citas.reduce((acc, cita) => {
      const tutor = cita.tutor || 'N/A'
      acc[tutor] = (acc[tutor] || 0) + 1
      return acc
    }, {})

    const citasPorTutorArray = Object.entries(citasPorTutor).map(([tutor, citas]) => ({
      tutor,
      citas
    }))

    // Status distribution
    const estadoDistribucion = [
      { name: t('reportes.confirmadas'), value: confirmed, color: '#0d9488' },
      { name: t('reportes.pendientes'),  value: pending,  color: '#d97706' },
      { name: t('reportes.canceladas'), value: cancelled, color: '#e84c4c' },
    ].filter(item => item.value > 0)

    // Summary
    const resumen = [
      { label: t('reportes.citasTotales'),      value: total,  accent: '#f97316' },
      { label: t('reportes.tasaConfirmacion'),  value: total > 0 ? `${Math.round((confirmed / total) * 100)}%` : '0%', accent: '#0d9488' },
      { label: t('reportes.coordinadoresActivos'),     value: citasPorTutorArray.length,    accent: 'var(--icon-dark)' },
      { label: t('reportes.estudiantesUnicos'), value: new Set(citas.map(c => c.estudiante)).size,   accent: '#8b5cf6' },
    ]

    return {
      citasPorDia,
      estadoDistribucion,
      citasPorTutor: citasPorTutorArray,
      resumen
    }
  }, [citas, t])

  const { citasPorDia, estadoDistribucion, citasPorTutor, resumen } = reportData

  return (
    <div className={shared.page}>
      <div className={shared.pageHeader}>
        <h2 className={shared.sectionTitle}>{t('reportes.title')}</h2>
        <div className={styles.periodFilter}>
          <IconCalendar size={16} />
          <select value={periodo} onChange={e => setPeriodo(e.target.value)}>
            <option value="semana">{t('reportes.estaSemana')}</option>
            <option value="mes">{t('reportes.esteMes')}</option>
            <option value="trimestre">{t('reportes.esteTrimestre')}</option>
            <option value="anio">{t('reportes.esteAnio')}</option>
          </select>
        </div>
      </div>

      {/* Summary cards */}
      <div className={styles.summaryGrid}>
        {resumen.map(item => (
          <div key={item.label} className={`${shared.card} ${styles.summaryCard}`}>
            <span className={styles.summaryValue} style={{ color: item.accent }}>
              {item.value}
            </span>
            <span className={styles.summaryLabel}>{item.label}</span>
          </div>
        ))}
      </div>

      <div className={styles.chartsGrid}>
        {/* Bar chart: citas por día */}
        <div className={`${shared.card} ${shared.cardPad}`}>
          <h3 className={styles.chartTitle}>{t('reportes.citasPorDia')}</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={citasPorDia}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
              <XAxis dataKey="dia" tick={{ fontSize: 12, fill: '#6b7280' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#6b7280' }} axisLine={false} tickLine={false} />
              <Tooltip cursor={{ fill: '#f3f4f6' }} contentStyle={{ fontSize: 12, borderRadius: 8 }} />
              <Bar dataKey="citas" fill="#f97316" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie chart: distribución de estados */}
        <div className={`${shared.card} ${shared.cardPad}`}>
          <h3 className={styles.chartTitle}>{t('reportes.distribucionEstados')}</h3>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={estadoDistribucion}
                dataKey="value"
                nameKey="name"
                innerRadius={55}
                outerRadius={85}
                paddingAngle={3}
              >
                {estadoDistribucion.map(entry => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Bar chart: citas por tutor */}
        <div className={`${shared.card} ${shared.cardPad}`}>
          <h3 className={styles.chartTitle}>{t('reportes.citasPorCoordinador')}</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={citasPorTutor} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 12, fill: '#6b7280' }} axisLine={false} tickLine={false} />
              <YAxis dataKey="tutor" type="category" tick={{ fontSize: 12, fill: '#6b7280' }} axisLine={false} tickLine={false} width={80} />
              <Tooltip cursor={{ fill: '#f3f4f6' }} contentStyle={{ fontSize: 12, borderRadius: 8 }} />
              <Bar dataKey="citas" fill="#8b5cf6" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
