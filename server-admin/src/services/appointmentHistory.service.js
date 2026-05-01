import AppointmentHistory from '../models/appointmentHistory.model.js';

class AppointmentHistoryService {

  static async createHistory({ appointmentId, action, performedBy }) {
    return await AppointmentHistory.create({
      appointmentId,
      action,
      performedBy
    });
  }

  static async getHistoryByAppointment(appointmentId) {
    return await AppointmentHistory.find({ appointmentId }).sort({ createdAt: 1 });
  }
}

export default AppointmentHistoryService;