import AppointmentService from '../services/appointment.service.js';
import logger from '../config/logger.js';

class AppointmentController {

  static async create(req, res, next) {
    try {
      const appointment = await AppointmentService.createAppointment({
        parentId: req.user.id,
        coordinatorId: req.body.coordinatorId,
        date: req.body.date,
        startTime: req.body.startTime,
        endTime: req.body.endTime,
        reason: req.body.reason
      });

      logger.info(`Cita creada por usuario ${req.user.id}`);
      res.status(201).json({ success: true, data: appointment });

    } catch (error) {
      logger.error(`Error al crear cita: ${error.message}`);
      next(error);
    }
  }

  static async getByUser(req, res, next) {
    try {
      const data = await AppointmentService.getAppointmentsByUser(
        req.user.id,   // CORREGIDO: antes usaba req.user.userId (undefined)
        req.user.role
      );

      res.json({ success: true, data });

    } catch (error) {
      logger.error(`Error al obtener citas: ${error.message}`);
      next(error);
    }
  }

  static async update(req, res, next) {
    try {
      const appointment = await AppointmentService.updateAppointment(
        req.params.id,
        req.body,
        req.user.id   // Pasamos el userId para validar ownership
      );

      logger.info(`Cita ${req.params.id} actualizada por ${req.user.id}`);
      res.json({ success: true, data: appointment });

    } catch (error) {
      logger.error(`Error al actualizar cita: ${error.message}`);
      next(error);
    }
  }

  static async cancel(req, res, next) {
    try {
      const appointment = await AppointmentService.cancelAppointment(
        req.params.id,
        req.user.id,   // Para verificar que el dueño o coordinador cancela
        req.user.role
      );

      logger.info(`Cita ${req.params.id} cancelada por ${req.user.id}`);
      res.json({ success: true, data: appointment });

    } catch (error) {
      logger.error(`Error al cancelar cita: ${error.message}`);
      next(error);
    }
  }

  static async getHistory(req, res, next) {
    try {
      const history = await AppointmentService.getHistory(req.params.id);
      res.json({ success: true, data: history });
    } catch (error) {
      logger.error(`Error al obtener historial: ${error.message}`);
      next(error);
    }
  }
}

export default AppointmentController;