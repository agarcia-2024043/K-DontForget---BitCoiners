import express from "express";
import NotificationController from "../controllers/notification.controller.js";
import JWTMiddleware from "../middlewares/JWT.middleware.js";
import { notificationValidation } from "../middlewares/validation.middleware.js";

const router = express.Router();

/**
 * @swagger
 * /api/notifications:
 *   get:
 *     summary: Obtener notificaciones del usuario autenticado
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de notificaciones
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.get("/", JWTMiddleware, NotificationController.getUserNotifications);

/**
 * @swagger
 * /api/notifications/unread-count:
 *   get:
 *     summary: Obtener conteo de notificaciones no leídas
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Conteo de no leídas
 */
router.get("/unread-count", JWTMiddleware, NotificationController.getUnreadCount);

/**
 * @swagger
 * /api/notifications:
 *   post:
 *     summary: Crear una nueva notificación
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [userId, title, message]
 *             properties:
 *               userId:
 *                 type: string
 *               title:
 *                 type: string
 *               message:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [Appointment, System, Reminder]
 *     responses:
 *       201:
 *         description: Notificación creada
 */
router.post("/", JWTMiddleware, notificationValidation, NotificationController.create);

/**
 * @swagger
 * /api/notifications/{id}/read:
 *   patch:
 *     summary: Marcar una notificación como leída
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Notificación marcada como leída
 */
router.patch("/:id/read", JWTMiddleware, NotificationController.markAsRead);

/**
 * @swagger
 * /api/notifications/mark-all-read:
 *   patch:
 *     summary: Marcar todas las notificaciones como leídas
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Todas las notificaciones marcadas como leídas
 */
router.patch("/mark-all-read", JWTMiddleware, NotificationController.markAllAsRead);

export default router;
