import Appointment from "../models/appointment.model.js";
import AppointmentHistoryService from "./appointmentHistory.service.js";
import NotificationService from "./notification.service.js";
import * as WhatsAppService from "./whatsapp.service.js";
import logger from "../config/logger.js";

class AppointmentService {
  static normalizeDate(date) {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
  }

  static async createAppointment(data) {
    const { parentId, coordinatorId, date, startTime, endTime, reason, phoneNumber } = data;
    const appointmentDate = this.normalizeDate(date);
    const today = this.normalizeDate(new Date());

    if (appointmentDate < today) {
      throw Object.assign(new Error("No se permiten citas en días pasados"), { status: 400 });
    }

    const start = new Date(startTime);
    const end = new Date(endTime);

    if (isNaN(start) || isNaN(end)) {
      throw Object.assign(new Error("Formato de hora inválido"), { status: 400 });
    }

    if (start >= end) {
      throw Object.assign(new Error("La hora de inicio debe ser menor que la hora de fin"), { status: 400 });
    }

    const diffMinutes = (end - start) / (1000 * 60);
    if (diffMinutes < 30) {
      throw Object.assign(new Error("La cita debe durar mínimo 30 minutos"), { status: 400 });
    }

    // Validar límites de horario (9:00 - 18:00)
    const startHour = start.getHours();
    const endHour = end.getHours();
    if (startHour < 9 || startHour >= 18) {
      throw Object.assign(new Error("Las citas deben ser entre las 9:00 y las 18:00"), { status: 400 });
    }
    if (endHour > 18 || (endHour === 18 && end.getMinutes() > 0)) {
      throw Object.assign(new Error("Las citas deben finalizar antes de las 18:00"), { status: 400 });
    }

    // Verificar solapamiento con citas existentes
    const overlapping = await Appointment.findOne({
      coordinatorId,
      date: appointmentDate,
      status: { $in: ["PENDING", "CONFIRMED"] },
      startTime: { $lt: end },
      endTime: { $gt: start },
    });

    if (overlapping) {
      throw Object.assign(new Error("El coordinador ya tiene una cita en ese horario"), { status: 409 });
    }

    const appointment = await Appointment.create({
      parentId,
      coordinatorId,
      date: appointmentDate,
      startTime: start,
      endTime: end,
      reason,
      status: "PENDING",
      phoneNumber: phoneNumber || null,
    });

    await AppointmentHistoryService.createHistory({
      appointmentId: appointment._id,
      action: "CREATED",
      performedBy: parentId,
    });

    // Notificar al coordinador
    await NotificationService.createNotification({
      userId: coordinatorId,
      title: "Nueva solicitud de cita",
      message: `Un padre ha solicitado una cita para el ${appointmentDate.toISOString().split("T")[0]}`,
      type: "Appointment",
    });

    // Enviar WhatsApp al padre con confirmación de la cita creada
    await WhatsAppService.sendAppointmentCreated(phoneNumber, appointment);

    logger.info(`Cita creada: ${appointment._id} por padre ${parentId}`);
    return appointment;
  }

  static async getHistory(appointmentId) {
    return await AppointmentHistoryService.getHistoryByAppointment(appointmentId);
  }

  static async getAppointmentsByUser(userId, role) {
    if (role?.toUpperCase() === "PADRE") {
      return await Appointment.find({ parentId: userId }).sort({ date: 1 });
    }
    if (role?.toUpperCase() === "COORDINADOR") {
      return await Appointment.find({ coordinatorId: userId }).sort({ date: 1 });
    }
    throw Object.assign(new Error("Rol no autorizado para consultar citas"), { status: 403 });
  }

  static async rescheduleAppointment(id, updates, requestingUserId) {
    const appointment = await Appointment.findById(id);
    if (!appointment) {
      throw Object.assign(new Error("Cita no encontrada"), { status: 404 });
    }

    // Solo el padre dueño puede reprogramar
    if (appointment.parentId.toString() !== requestingUserId.toString()) {
      throw Object.assign(new Error("No tienes permiso para reprogramar esta cita"), { status: 403 });
    }

    if (appointment.status === "COMPLETED") {
      throw Object.assign(new Error("No se puede reprogramar una cita completada"), { status: 400 });
    }

    // Validar nueva fecha y hora
    const { date, startTime, endTime } = updates;
    
    if (date) {
      const appointmentDate = this.normalizeDate(date);
      const today = this.normalizeDate(new Date());

      if (appointmentDate < today) {
        throw Object.assign(new Error("No se permiten citas en días pasados"), { status: 400 });
      }
      appointment.date = appointmentDate;
    }

    if (startTime && endTime) {
      const start = new Date(startTime);
      const end = new Date(endTime);

      if (isNaN(start) || isNaN(end)) {
        throw Object.assign(new Error("Formato de hora inválido"), { status: 400 });
      }

      if (start >= end) {
        throw Object.assign(new Error("La hora de inicio debe ser menor que la hora de fin"), { status: 400 });
      }

      const diffMinutes = (end - start) / (1000 * 60);
      if (diffMinutes < 30) {
        throw Object.assign(new Error("La cita debe durar mínimo 30 minutos"), { status: 400 });
      }

      // Validar límites de horario (9:00 - 18:00)
      const startHour = start.getHours();
      const endHour = end.getHours();
      if (startHour < 9 || startHour >= 18) {
        throw Object.assign(new Error("Las citas deben ser entre las 9:00 y las 18:00"), { status: 400 });
      }
      if (endHour > 18 || (endHour === 18 && end.getMinutes() > 0)) {
        throw Object.assign(new Error("Las citas deben finalizar antes de las 18:00"), { status: 400 });
      }

      // Verificar solapamiento con citas existentes
      const overlapping = await Appointment.findOne({
        coordinatorId: appointment.coordinatorId,
        date: appointment.date,
        status: { $in: ["PENDING", "CONFIRMED"] },
        _id: { $ne: appointment._id },
        startTime: { $lt: end },
        endTime: { $gt: start },
      });

      if (overlapping) {
        throw Object.assign(new Error("El coordinador ya tiene una cita en ese horario"), { status: 409 });
      }

      appointment.startTime = start;
      appointment.endTime = end;
    }

    if (updates.reason !== undefined) {
      appointment.reason = updates.reason;
    }

    // Si estaba cancelada, cambiar a pendiente
    if (appointment.status === "CANCELLED") {
      appointment.status = "PENDING";
    }

    await appointment.save();

    await AppointmentHistoryService.createHistory({
      appointmentId: appointment._id,
      action: "RESCHEDULED",
      performedBy: requestingUserId,
    });

    // Notificar al coordinador
    await NotificationService.createNotification({
      userId: appointment.coordinatorId,
      title: "Cita reprogramada",
      message: `Un padre ha reprogramado una cita para el ${appointment.date.toISOString().split("T")[0]}`,
      type: "Appointment",
    });

    // Enviar WhatsApp al padre con la nueva fecha
    const notifyPhone = appointment.phoneNumber;
    await WhatsAppService.sendAppointmentRescheduled(notifyPhone, appointment);

    logger.info(`Cita reprogramada: ${appointment._id} por padre ${requestingUserId}`);
    return appointment;
  }

  static async updateAppointment(id, updates, requestingUserId) {
    const appointment = await Appointment.findById(id);
    if (!appointment) {
      throw Object.assign(new Error("Cita no encontrada"), { status: 404 });
    }

    // Solo el padre dueño puede editar
    if (appointment.parentId.toString() !== requestingUserId.toString()) {
      throw Object.assign(new Error("No tienes permiso para modificar esta cita"), { status: 403 });
    }

    if (["CONFIRMED", "COMPLETED", "CANCELLED"].includes(appointment.status)) {
      throw Object.assign(new Error("No se puede modificar una cita en estado " + appointment.status), { status: 400 });
    }

    // Solo permitimos actualizar campos seguros
    const allowedUpdates = ["date", "startTime", "endTime", "reason"];
    allowedUpdates.forEach((field) => {
      if (updates[field] !== undefined) {
        appointment[field] = updates[field];
      }
    });

    await appointment.save();

    await AppointmentHistoryService.createHistory({
      appointmentId: appointment._id,
      action: "UPDATED",
      performedBy: requestingUserId,
    });

    return appointment;
  }

  static async confirmAppointment(id, requestingUserId) {
    const appointment = await Appointment.findById(id);
    if (!appointment) {
      throw Object.assign(new Error("Cita no encontrada"), { status: 404 });
    }

    if (appointment.status !== "PENDING") {
      throw Object.assign(new Error("Solo se pueden confirmar citas pendientes"), { status: 400 });
    }

    appointment.status = "CONFIRMED";
    await appointment.save();

    await AppointmentHistoryService.createHistory({
      appointmentId: appointment._id,
      action: "CONFIRMED",
      performedBy: requestingUserId,
    });

    // Notificar al padre
    await NotificationService.createNotification({
      userId: appointment.parentId,
      title: "Cita Confirmada",
      message: `Su cita del ${appointment.date.toISOString().split("T")[0]} ha sido confirmada.`,
      type: "Appointment",
    });

    // Enviar WhatsApp al padre notificando confirmación
    await WhatsAppService.sendAppointmentConfirmed(appointment.phoneNumber, appointment);

    return appointment;
  }

  static async cancelAppointment(id, requestingUserId, requestingUserRole) {
    const appointment = await Appointment.findById(id);
    if (!appointment) {
      throw Object.assign(new Error("Cita no encontrada"), { status: 404 });
    }

    const isOwner = appointment.parentId.toString() === requestingUserId.toString();
    const isCoordinator = requestingUserRole?.toUpperCase() === "COORDINADOR";

    if (!isOwner && !isCoordinator) {
      throw Object.assign(new Error("No tienes permiso para cancelar esta cita"), { status: 403 });
    }

    if (appointment.status === "COMPLETED") {
      throw Object.assign(new Error("No se puede cancelar una cita completada"), { status: 400 });
    }

    if (appointment.status === "CANCELLED") {
      throw Object.assign(new Error("La cita ya está cancelada"), { status: 400 });
    }

    appointment.status = "CANCELLED";
    await appointment.save();

    await AppointmentHistoryService.createHistory({
      appointmentId: appointment._id,
      action: "CANCELLED",
      performedBy: requestingUserId,
    });

    // Notificar al padre si fue cancelada por coordinador, o al coordinador si fue por el padre
    const notifyUserId = isOwner ? appointment.coordinatorId : appointment.parentId;
    await NotificationService.createNotification({
      userId: notifyUserId,
      title: "Cita Cancelada",
      message: `La cita del ${appointment.date.toISOString().split("T")[0]} ha sido cancelada.`,
      type: "Appointment",
    });

    // Si el coordinador cancela, buscar horarios alternativos para sugerir
    let alternativeTimes = [];
    if (isCoordinator) {
      const startOfDay = new Date(appointment.date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(appointment.date);
      endOfDay.setHours(23, 59, 59, 999);

      const existingAppointments = await Appointment.find({
        coordinatorId: appointment.coordinatorId,
        date: { $gte: startOfDay, $lte: endOfDay },
        status: { $in: ["PENDING", "CONFIRMED"] },
      });

      const allSlots = [
        '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
        '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
        '15:00', '15:30', '16:00', '16:30', '17:00', '17:30'
      ];

      const occupiedSlots = existingAppointments.map(appt => {
        const d = new Date(appt.startTime);
        return d.toLocaleTimeString('es-GT', { hour: '2-digit', minute: '2-digit', hour12: false });
      });

      const available = allSlots.filter(slot => !occupiedSlots.includes(slot));
      alternativeTimes = available.slice(0, 3); // Sugerir hasta 3 horarios
    }

    // Enviar WhatsApp al padre notificando la cancelación (con alternativas si aplica)
    await WhatsAppService.sendAppointmentCancelled(appointment.phoneNumber, appointment, alternativeTimes);

    return appointment;
  }
}

export default AppointmentService;
