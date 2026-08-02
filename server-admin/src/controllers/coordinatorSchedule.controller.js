import CoordinatorScheduleService from "../services/coordinatorSchedule.service.js";
import logger from "../config/logger.js";

class CoordinatorScheduleController {
  /**
   * Obtener horarios de un coordinador
   */
  static async getSchedules(req, res, next) {
    try {
      const schedules = await CoordinatorScheduleService.getSchedulesByUser(req.params.userId);
      res.json({ success: true, data: schedules });
    } catch (error) {
      logger.error(`Error al obtener horarios: ${error.message}`);
      next(error);
    }
  }

  /**
   * Obtener slots disponibles para una fecha
   */
  static async getAvailableSlots(req, res, next) {
    try {
      const { userId } = req.params;
      const { date } = req.query;

      if (!date) {
        return res.status(400).json({ success: false, message: "El parámetro 'date' es requerido." });
      }

      const slots = await CoordinatorScheduleService.getAvailableSlots(userId, date);
      res.json({ success: true, data: slots });
    } catch (error) {
      logger.error(`Error al obtener slots disponibles: ${error.message}`);
      next(error);
    }
  }

  /**
   * Verificar disponibilidad de un slot específico
   */
  static async checkAvailability(req, res, next) {
    try {
      const { userId } = req.params;
      const { date, time } = req.query;

      if (!date || !time) {
        return res.status(400).json({ success: false, message: "Los parámetros 'date' y 'time' son requeridos." });
      }

      const result = await CoordinatorScheduleService.checkSlotAvailability(userId, date, time);
      res.json({ success: true, data: result });
    } catch (error) {
      logger.error(`Error al verificar disponibilidad: ${error.message}`);
      next(error);
    }
  }

  /**
   * Crear nuevo horario
   */
  static async create(req, res, next) {
    try {
      const schedule = await CoordinatorScheduleService.createSchedule({
        userId: req.user.id,
        dayOfWeek: req.body.dayOfWeek,
        startTime: req.body.startTime,
        endTime: req.body.endTime,
      });

      res.status(201).json({ success: true, data: schedule });
    } catch (error) {
      logger.error(`Error al crear horario: ${error.message}`);
      next(error);
    }
  }

  /**
   * Actualizar horario existente
   */
  static async update(req, res, next) {
    try {
      const schedule = await CoordinatorScheduleService.updateSchedule(
        req.params.id,
        req.body,
        req.user.id
      );

      res.json({ success: true, data: schedule });
    } catch (error) {
      logger.error(`Error al actualizar horario: ${error.message}`);
      next(error);
    }
  }

  /**
   * Eliminar horario
   */
  static async delete(req, res, next) {
    try {
      await CoordinatorScheduleService.deleteSchedule(req.params.id, req.user.id);
      res.json({ success: true, message: "Horario eliminado correctamente." });
    } catch (error) {
      logger.error(`Error al eliminar horario: ${error.message}`);
      next(error);
    }
  }
}

export default CoordinatorScheduleController;
