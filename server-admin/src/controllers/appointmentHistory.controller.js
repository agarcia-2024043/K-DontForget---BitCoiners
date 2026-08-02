import AppointmentHistoryService from "../services/appointmentHistory.service.js";
import logger from "../config/logger.js";

class AppointmentHistoryController {
  static async getByAppointment(req, res, next) {
    try {
      const history = await AppointmentHistoryService.getHistoryByAppointment(req.params.appointmentId);
      res.json({ success: true, data: history });
    } catch (error) {
      logger.error(`Error al obtener historial: ${error.message}`);
      next(error);
    }
  }
}

export default AppointmentHistoryController;
