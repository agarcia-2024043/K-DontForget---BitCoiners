import CoordinatorSchedule from "../models/coordinatorSchedule.model.js";
import Appointment from "../models/appointment.model.js";
import logger from "../config/logger.js";

class CoordinatorScheduleService {
  /**
   * Obtener todos los horarios de un coordinador
   */
  static async getSchedulesByUser(userId) {
    return await CoordinatorSchedule.find({ userId })
      .sort({ dayOfWeek: 1, startTime: 1 });
  }

  /**
   * Obtener slots disponibles para una fecha específica
   * Filtra los horarios que ya están ocupados por citas existentes
   */
  static async getAvailableSlots(userId, date) {
    const targetDate = new Date(date);
    const dayOfWeek = targetDate.getDay(); // 0 = Domingo, 6 = Sábado

    // Obtener los horarios del coordinador para ese día de la semana
    const schedules = await CoordinatorSchedule.find({
      userId,
      dayOfWeek,
      isAvailable: true,
    }).sort({ startTime: 1 });

    // Obtener citas existentes para esa fecha
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    const existingAppointments = await Appointment.find({
      coordinatorId: userId,
      date: { $gte: startOfDay, $lte: endOfDay },
      status: { $in: ["PENDING", "CONFIRMED"] },
    });

    // Filtrar los slots que ya están ocupados
    const bookedTimes = existingAppointments.map((apt) => {
      const start = new Date(apt.startTime);
      return `${String(start.getHours()).padStart(2, "0")}:${String(start.getMinutes()).padStart(2, "0")}`;
    });

    const availableSlots = schedules.filter(
      (schedule) => !bookedTimes.includes(schedule.startTime)
    );

    return availableSlots;
  }

  /**
   * Verificar si un slot específico está disponible
   */
  static async checkSlotAvailability(userId, date, time) {
    const targetDate = new Date(date);
    const dayOfWeek = targetDate.getDay();

    // Verificar que existe un horario para ese día y hora
    const schedule = await CoordinatorSchedule.findOne({
      userId,
      dayOfWeek,
      startTime: time,
      isAvailable: true,
    });

    if (!schedule) {
      return { isAvailable: false, reason: "No existe un horario configurado para esa hora." };
    }

    // Verificar que no haya una cita existente
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    const existingAppointment = await Appointment.findOne({
      coordinatorId: userId,
      date: { $gte: startOfDay, $lte: endOfDay },
      status: { $in: ["PENDING", "CONFIRMED"] },
    });

    if (existingAppointment) {
      const aptStart = new Date(existingAppointment.startTime);
      const aptTime = `${String(aptStart.getHours()).padStart(2, "0")}:${String(aptStart.getMinutes()).padStart(2, "0")}`;
      if (aptTime === time) {
        return { isAvailable: false, reason: "Ya existe una cita en ese horario." };
      }
    }

    return { isAvailable: true };
  }

  /**
   * Crear un nuevo horario de coordinador
   */
  static async createSchedule(data) {
    const { userId, dayOfWeek, startTime, endTime } = data;

    // Verificar que no exista un horario duplicado
    const existing = await CoordinatorSchedule.findOne({ userId, dayOfWeek, startTime });
    if (existing) {
      throw Object.assign(new Error("Ya existe un horario para ese día y hora"), { status: 409 });
    }

    const schedule = await CoordinatorSchedule.create({
      userId,
      dayOfWeek,
      startTime,
      endTime,
      isAvailable: true,
    });

    logger.info(`Horario creado para coordinador ${userId}: día ${dayOfWeek}, ${startTime}-${endTime}`);
    return schedule;
  }

  /**
   * Actualizar un horario existente
   */
  static async updateSchedule(id, updates, requestingUserId) {
    const schedule = await CoordinatorSchedule.findById(id);
    if (!schedule) {
      throw Object.assign(new Error("Horario no encontrado"), { status: 404 });
    }

    if (schedule.userId !== requestingUserId) {
      throw Object.assign(new Error("No tienes permiso para modificar este horario"), { status: 403 });
    }

    const allowedUpdates = ["dayOfWeek", "startTime", "endTime", "isAvailable"];
    allowedUpdates.forEach((field) => {
      if (updates[field] !== undefined) {
        schedule[field] = updates[field];
      }
    });

    await schedule.save();
    return schedule;
  }

  /**
   * Eliminar un horario
   */
  static async deleteSchedule(id, requestingUserId) {
    const schedule = await CoordinatorSchedule.findById(id);
    if (!schedule) {
      throw Object.assign(new Error("Horario no encontrado"), { status: 404 });
    }

    if (schedule.userId !== requestingUserId) {
      throw Object.assign(new Error("No tienes permiso para eliminar este horario"), { status: 403 });
    }

    await CoordinatorSchedule.findByIdAndDelete(id);
    logger.info(`Horario ${id} eliminado por coordinador ${requestingUserId}`);
    return { deleted: true };
  }
}

export default CoordinatorScheduleService;
