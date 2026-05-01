import Appointment from '../models/appointment.model.js';
import historyService from './appointmentHistory.service.js';
import logger from '../config/logger.js';

class AppointmentService {

    static normalizeDate(date) {
        const d = new Date(date);
        d.setHours(0, 0, 0, 0);
        return d;
    }

    static async createAppointment(data) {
        const { parentId, coordinatorId, date, startTime, endTime, reason } = data;
        const appointmentDate = this.normalizeDate(date);
        const today = this.normalizeDate(new Date());

        if (appointmentDate < today) {
        throw Object.assign(new Error('No se permiten citas en días pasados'), { status: 400 });
        }

        const start = new Date(startTime);
        const end = new Date(endTime);

        if (isNaN(start) || isNaN(end)) {
        throw Object.assign(new Error('Formato de hora inválido'), { status: 400 });
        }

        if (start >= end) {
        throw Object.assign(new Error('La hora de inicio debe ser menor que la hora de fin'), { status: 400 });
        }

        const diffMinutes = (end - start) / (1000 * 60);
        if (diffMinutes < 30) {
        throw Object.assign(new Error('La cita debe durar mínimo 30 minutos'), { status: 400 });
        }

        const overlapping = await Appointment.findOne({
        coordinatorId,
        date: appointmentDate,
        status: { $in: ['PENDING', 'CONFIRMED'] },
        startTime: { $lt: end },
        endTime: { $gt: start }
        });

        if (overlapping) {
        throw Object.assign(new Error('El coordinador ya tiene una cita en ese horario'), { status: 409 });
        }

        const appointment = await Appointment.create({
        parentId,
        coordinatorId,
        date: appointmentDate,
        startTime: start,
        endTime: end,
        reason,
        status: 'PENDING'
        });

        await historyService.createHistory({
        appointmentId: appointment._id,
        action: 'CREATED',
        performedBy: parentId
        });

        return appointment;
    }

    static async getHistory(appointmentId) {
        return await historyService.getHistoryByAppointment(appointmentId);
    }

    static async getAppointmentsByUser(userId, role) {
        if (role?.toUpperCase() === 'PADRE') {
        return await Appointment.find({ parentId: userId }).sort({ date: 1 });
        }
        if (role === 'COORDINADOR') {
        return await Appointment.find({ coordinatorId: userId }).sort({ date: 1 });
        }
        throw Object.assign(new Error('Rol no autorizado para consultar citas'), { status: 403 });
    }

    static async updateAppointment(id, updates, requestingUserId) {
        const appointment = await Appointment.findById(id);
        if (!appointment) {
        throw Object.assign(new Error('Cita no encontrada'), { status: 404 });
        }

        // Control de autorización: solo el padre dueño puede editar
        if (appointment.parentId.toString() !== requestingUserId.toString()) {
        throw Object.assign(new Error('No tienes permiso para modificar esta cita'), { status: 403 });
        }

        if (['CONFIRMED', 'COMPLETED', 'CANCELLED'].includes(appointment.status)) {
        throw Object.assign(new Error('No se puede modificar una cita en estado ' + appointment.status), { status: 400 });
        }

        // Solo permitimos actualizar campos seguros
        const allowedUpdates = ['date', 'startTime', 'endTime', 'reason'];
        allowedUpdates.forEach(field => {
        if (updates[field] !== undefined) {
            appointment[field] = updates[field];
        }
        });

        await appointment.save();

        await historyService.createHistory({
        appointmentId: appointment._id,
        action: 'UPDATED',
        performedBy: requestingUserId
        });

        return appointment;
    }

    static async cancelAppointment(id, requestingUserId, requestingUserRole) {
        const appointment = await Appointment.findById(id);
        if (!appointment) {
        throw Object.assign(new Error('Cita no encontrada'), { status: 404 });
        }

        // Control de autorización: el padre dueño o un coordinador pueden cancelar
        const isOwner = appointment.parentId.toString() === requestingUserId.toString();
        const isCoordinator = requestingUserRole === 'COORDINADOR';

        if (!isOwner && !isCoordinator) {
        throw Object.assign(new Error('No tienes permiso para cancelar esta cita'), { status: 403 });
        }

        if (appointment.status === 'COMPLETED') {
        throw Object.assign(new Error('No se puede cancelar una cita completada'), { status: 400 });
        }

        if (appointment.status === 'CANCELLED') {
        throw Object.assign(new Error('La cita ya está cancelada'), { status: 400 });
        }

        appointment.status = 'CANCELLED';
        await appointment.save();

        await historyService.createHistory({
        appointmentId: appointment._id,
        action: 'CANCELLED',
        performedBy: requestingUserId
        });

        return appointment;
    }
}

    export default AppointmentService;