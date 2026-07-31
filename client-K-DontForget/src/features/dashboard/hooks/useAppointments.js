import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { useNotifications } from '@/features/parent/store/notificationsStore'
import { createAppointment, getAppointments, confirmAppointment, cancelAppointment } from '@/shared/api/appointments'

const MOCK_CITAS = [
  { id: 1, estudiante: 'Juan Pérez',  fecha: '16-06-2023', hora: '10:30', tutor: 'Cillma', tipo: 'Individual', estado: 'Pendiente' },
  { id: 2, estudiante: 'María López', fecha: '16-06-2023', hora: '11:00', tutor: 'Cillma', tipo: 'Grupal',     estado: 'Confirmada' },
  { id: 3, estudiante: 'José Díaz',   fecha: '16-06-2023', hora: '11:30', tutor: 'Cillma', tipo: 'Individual', estado: 'Confirmada' },
  { id: 4, estudiante: 'Ana García',  fecha: '16-06-2023', hora: '14:00', tutor: 'Cillma', tipo: 'Individual', estado: 'Cancelada' },
  { id: 5, estudiante: 'Carlos Ruiz', fecha: '16-06-2023', hora: '15:30', tutor: 'Cillma', tipo: 'Grupal',     estado: 'Pendiente' },
]

/**
 * Zustand store for appointments - shared between parent and coordinator views.
 * Uses local mock data for development.
 */
export const useAppointments = create(
  persist(
    (set, get) => ({
      citas: MOCK_CITAS,
      loading: false,
      error: null,

      fetchAppointments: async () => {
        set({ loading: true, error: null })
        try {
          const { data } = await getAppointments()
          if (data && data.success) {
            // Mapear el formato del backend al formato del frontend
            const mappedCitas = data.data.map(cita => {
              const start = new Date(cita.startTime)
              return {
                id: cita._id,
                estudiante: 'Estudiante', // El backend no devuelve el nombre todavía, usar genérico
                fecha: start.toISOString().split('T')[0],
                hora: start.toLocaleTimeString('es-GT', { hour: '2-digit', minute: '2-digit', hour12: false }),
                tutor: 'Coordinador', // Mapear según ID luego
                tipo: 'Individual',
                estado: cita.status === 'PENDING' ? 'Pendiente' : (cita.status === 'CONFIRMED' ? 'Confirmada' : (cita.status === 'CANCELLED' ? 'Cancelada' : cita.status))
              }
            })
            set({ citas: mappedCitas, loading: false })
          }
        } catch (error) {
          console.error("Error al obtener citas del servidor:", error)
          // Si falla, usar mocks locales
          if (!get().citas || get().citas.length === 0) {
            set({ citas: MOCK_CITAS, loading: false })
          } else {
            set({ loading: false })
          }
        }
      },

      addCita: async (data) => {
        try {
          // Parsear la fecha y hora para enviarlo al backend
          const startDateTime = new Date(`${data.fecha}T${data.hora}`);
          const endDateTime = new Date(startDateTime.getTime() + 30 * 60000); // +30 minutos por defecto

          // Llamada real al backend en Node.js
          await createAppointment({
            coordinatorId: data.coordinadorId.toString(),
            date: data.fecha,
            startTime: startDateTime.toISOString(),
            endTime: endDateTime.toISOString(),
            reason: `${data.motivo}${data.descripcion ? ' - ' + data.descripcion : ''}`,
            phoneNumber: data.phoneNumber
          });
        } catch (e) {
          console.error("Error al crear la cita en el backend:", e);
          // Si falla, igual lo agregamos localmente por ahora para que no rompa la UI
        }

        const newCita = { ...data, id: Date.now(), estado: 'Pendiente', tutor: data.tutor || 'Por asignar' }
        
        // Create notification for coordinators when parent requests appointment
        const notification = {
          title: 'Nueva solicitud de cita',
          message: `${data.estudiante} ha solicitado una cita para el ${data.fecha} a las ${data.hora}`,
          type: 'Appointment',
          citaId: newCita.id,
        }
        useNotifications.getState().addNotification(notification)
        
        return set((state) => ({
          citas: [...state.citas, newCita]
        }))
      },

      updateCita: async (id, data) => {
        try {
          if (data.estado === 'Confirmada') {
            await confirmAppointment(id)
          } else if (data.estado === 'Cancelada') {
            await cancelAppointment(id)
          }
        } catch (e) {
          console.error("Error al actualizar la cita en el backend:", e)
          throw e;
        }

        return set((state) => {
          const existingCita = state.citas.find(c => c.id === id)
          const updatedCitas = state.citas.map((c) => c.id === id ? { ...c, ...data } : c)
          
          // Create notification for coordinator when parent reschedules
          if (existingCita && (data.fecha !== undefined || data.hora !== undefined) && (existingCita.fecha !== data.fecha || existingCita.hora !== data.hora)) {
            const notification = {
              title: 'Cita reprogramada',
              message: `${existingCita.estudiante} ha reprogramado su cita para el ${data.fecha || existingCita.fecha} a las ${data.hora || existingCita.hora}`,
              type: 'Appointment',
              citaId: id,
            }
            useNotifications.getState().addNotification(notification)
          }
        
        // Create notification for parent when status changes (e.g. coordinator confirms or cancels)
        if (existingCita && data.estado && existingCita.estado !== data.estado) {
          const messages = {
            'Confirmada': `Su cita con ${existingCita.tutor} ha sido confirmada para el ${existingCita.fecha} a las ${existingCita.hora}`,
            'Cancelada': `Su cita con ${existingCita.tutor} ha sido cancelada`,
            'Pendiente': `Su cita con ${existingCita.tutor} está pendiente de confirmación`,
          }
          const notification = {
            title: `Cita ${data.estado}`,
            message: messages[data.estado] || `El estado de su cita ha cambiado a ${data.estado}`,
            type: 'Appointment',
            citaId: id,
          }
          useNotifications.getState().addNotification(notification)
        }
        
        return { citas: updatedCitas }
      })
    },

      removeCita: (id) => set((state) => ({
        citas: state.citas.filter((c) => c.id !== id)
      })),
    }),
    { name: 'kdf-appointments-store' }
  )
)
