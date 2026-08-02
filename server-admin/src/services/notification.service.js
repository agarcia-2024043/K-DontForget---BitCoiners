import Notification from "../models/notification.model.js";
import logger from "../config/logger.js";

class NotificationService {
  /**
   * Crear una nueva notificación
   */
  static async createNotification({ userId, title, message, type = "Appointment" }) {
    const notification = await Notification.create({ userId, title, message, type });
    logger.info(`Notificación creada para usuario ${userId}: ${title}`);
    return notification;
  }

  /**
   * Obtener notificaciones de un usuario ordenadas por fecha (más recientes primero)
   */
  static async getUserNotifications(userId) {
    return await Notification.find({ userId }).sort({ createdAt: -1 });
  }

  /**
   * Obtener conteo de notificaciones no leídas
   */
  static async getUnreadCount(userId) {
    return await Notification.countDocuments({ userId, isRead: false });
  }

  /**
   * Marcar una notificación como leída
   */
  static async markAsRead(notificationId) {
    const notification = await Notification.findById(notificationId);
    if (!notification) {
      throw Object.assign(new Error("Notificación no encontrada"), { status: 404 });
    }

    notification.isRead = true;
    await notification.save();
    return notification;
  }

  /**
   * Marcar todas las notificaciones de un usuario como leídas
   */
  static async markAllAsRead(userId) {
    const result = await Notification.updateMany(
      { userId, isRead: false },
      { $set: { isRead: true } }
    );
    logger.info(`${result.modifiedCount} notificaciones marcadas como leídas para usuario ${userId}`);
    return { modifiedCount: result.modifiedCount };
  }
}

export default NotificationService;
