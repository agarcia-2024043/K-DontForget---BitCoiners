import NotificationService from "../services/notification.service.js";
import logger from "../config/logger.js";

class NotificationController {
  /**
   * Obtener notificaciones del usuario autenticado
   */
  static async getUserNotifications(req, res, next) {
    try {
      const notifications = await NotificationService.getUserNotifications(req.user.id);
      res.json({ success: true, data: notifications });
    } catch (error) {
      logger.error(`Error al obtener notificaciones: ${error.message}`);
      next(error);
    }
  }

  /**
   * Obtener conteo de notificaciones no leídas
   */
  static async getUnreadCount(req, res, next) {
    try {
      const count = await NotificationService.getUnreadCount(req.user.id);
      res.json({ success: true, data: { count } });
    } catch (error) {
      logger.error(`Error al obtener conteo de no leídas: ${error.message}`);
      next(error);
    }
  }

  /**
   * Crear una nueva notificación
   */
  static async create(req, res, next) {
    try {
      const notification = await NotificationService.createNotification({
        userId: req.body.userId,
        title: req.body.title,
        message: req.body.message,
        type: req.body.type || "Appointment",
      });

      res.status(201).json({ success: true, data: notification });
    } catch (error) {
      logger.error(`Error al crear notificación: ${error.message}`);
      next(error);
    }
  }

  /**
   * Marcar una notificación como leída
   */
  static async markAsRead(req, res, next) {
    try {
      const notification = await NotificationService.markAsRead(req.params.id);
      res.json({ success: true, data: notification });
    } catch (error) {
      logger.error(`Error al marcar como leída: ${error.message}`);
      next(error);
    }
  }

  /**
   * Marcar todas las notificaciones como leídas
   */
  static async markAllAsRead(req, res, next) {
    try {
      const result = await NotificationService.markAllAsRead(req.user.id);
      res.json({ success: true, data: result });
    } catch (error) {
      logger.error(`Error al marcar todas como leídas: ${error.message}`);
      next(error);
    }
  }
}

export default NotificationController;
