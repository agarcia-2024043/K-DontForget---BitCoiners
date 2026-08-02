import express from "express";
import CoordinatorScheduleController from "../controllers/coordinatorSchedule.controller.js";
import JWTMiddleware from "../middlewares/JWT.middleware.js";
import roleMiddleware from "../middlewares/role.middleware.js";
import { scheduleValidation } from "../middlewares/validation.middleware.js";

const router = express.Router();

/**
 * @swagger
 * /api/schedules/{userId}:
 *   get:
 *     summary: Obtener horarios de un coordinador
 *     tags: [Coordinator Schedules]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: userId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lista de horarios del coordinador
 */
router.get("/:userId", JWTMiddleware, CoordinatorScheduleController.getSchedules);

/**
 * @swagger
 * /api/schedules/{userId}/available:
 *   get:
 *     summary: Obtener slots disponibles para una fecha
 *     tags: [Coordinator Schedules]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: userId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *       - name: date
 *         in: query
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Lista de slots disponibles
 */
router.get("/:userId/available", JWTMiddleware, CoordinatorScheduleController.getAvailableSlots);

/**
 * @swagger
 * /api/schedules/{userId}/check-availability:
 *   get:
 *     summary: Verificar si un slot específico está disponible
 *     tags: [Coordinator Schedules]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: userId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *       - name: date
 *         in: query
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *       - name: time
 *         in: query
 *         required: true
 *         schema:
 *           type: string
 *           example: "08:00"
 *     responses:
 *       200:
 *         description: Resultado de disponibilidad
 */
router.get("/:userId/check-availability", JWTMiddleware, CoordinatorScheduleController.checkAvailability);

/**
 * @swagger
 * /api/schedules:
 *   post:
 *     summary: Crear nuevo horario de coordinador
 *     tags: [Coordinator Schedules]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [dayOfWeek, startTime, endTime]
 *             properties:
 *               dayOfWeek:
 *                 type: integer
 *                 minimum: 0
 *                 maximum: 6
 *               startTime:
 *                 type: string
 *                 example: "08:00"
 *               endTime:
 *                 type: string
 *                 example: "17:00"
 *     responses:
 *       201:
 *         description: Horario creado exitosamente
 */
router.post("/", JWTMiddleware, roleMiddleware("COORDINADOR"), scheduleValidation, CoordinatorScheduleController.create);

/**
 * @swagger
 * /api/schedules/{id}:
 *   put:
 *     summary: Actualizar horario de coordinador
 *     tags: [Coordinator Schedules]
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
 *         description: Horario actualizado
 */
router.put("/:id", JWTMiddleware, roleMiddleware("COORDINADOR"), CoordinatorScheduleController.update);

/**
 * @swagger
 * /api/schedules/{id}:
 *   delete:
 *     summary: Eliminar horario de coordinador
 *     tags: [Coordinator Schedules]
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
 *         description: Horario eliminado
 */
router.delete("/:id", JWTMiddleware, roleMiddleware("COORDINADOR"), CoordinatorScheduleController.delete);

export default router;
