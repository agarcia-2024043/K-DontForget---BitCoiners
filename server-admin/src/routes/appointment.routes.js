import express from "express";
import AppointmentController from "../controllers/appointment.controller.js";
import JWTMiddleware from "../middlewares/JWT.middleware.js";
import roleMiddleware from "../middlewares/role.middleware.js";
import { appointmentValidation } from "../middlewares/validation.middleware.js";

const router = express.Router();

/**
 * @swagger
 * /api/appointments:
 *   post:
 *     summary: Crear una nueva cita
 *     tags: [Appointments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateAppointmentDTO'
 *     responses:
 *       201:
 *         description: Cita creada exitosamente
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.post("/", JWTMiddleware, roleMiddleware("PADRE"), appointmentValidation, AppointmentController.create);

/**
 * @swagger
 * /api/appointments:
 *   get:
 *     summary: Obtener citas del usuario autenticado
 *     tags: [Appointments]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de citas del usuario
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.get("/", JWTMiddleware, AppointmentController.getByUser);

/**
 * @swagger
 * /api/appointments/{id}:
 *   put:
 *     summary: Actualizar una cita existente
 *     tags: [Appointments]
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
 *         description: Cita actualizada exitosamente
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.patch("/:id/reschedule", JWTMiddleware, roleMiddleware("PADRE"), AppointmentController.reschedule);

router.put("/:id", JWTMiddleware, roleMiddleware("PADRE"), AppointmentController.update);

/**
 * @swagger
 * /api/appointments/confirm/{id}:
 *   patch:
 *     summary: Confirmar una cita (solo Coordinador)
 *     tags: [Appointments]
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
 *         description: Cita confirmada exitosamente
 */
router.patch("/confirm/:id", JWTMiddleware, roleMiddleware("COORDINADOR"), AppointmentController.confirm);

/**
 * @swagger
 * /api/appointments/cancel/{id}:
 *   patch:
 *     summary: Cancelar una cita
 *     tags: [Appointments]
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
 *         description: Cita cancelada exitosamente
 */
router.patch("/cancel/:id", JWTMiddleware, AppointmentController.cancel);

/**
 * @swagger
 * /api/appointments/history/{id}:
 *   get:
 *     summary: Obtener historial de cambios de una cita
 *     tags: [Appointments]
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
 *         description: Historial de la cita
 */
router.get("/history/:id", JWTMiddleware, AppointmentController.getHistory);

export default router;
