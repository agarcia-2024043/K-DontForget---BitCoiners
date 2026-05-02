import express from 'express';
import AppointmentController from '../controllers/appointment.controller.js';
import JWTMiddleware from '../middlewares/JWT.middleware.js';
import roleMiddleware from '../middlewares/role.middleware.js';
import { appointmentValidation } from '../middlewares/validation.middleware.js';

const router = express.Router();

/**
 * @swagger
 * /appointments:
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
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Appointment'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */
router.post(
  '/',
  JWTMiddleware,
  roleMiddleware('PADRE'),
  appointmentValidation,
  AppointmentController.create
);

/**
 * @swagger
 * /appointments:
 *   get:
 *     summary: Obtener citas del usuario autenticado
 *     tags: [Appointments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/PageParam'
 *       - $ref: '#/components/parameters/LimitParam'
 *       - name: status
 *         in: query
 *         description: Filtrar por estado de la cita
 *         schema:
 *           type: string
 *           enum: [PENDING, CONFIRMED, CANCELLED, COMPLETED]
 *     responses:
 *       200:
 *         description: Lista de citas del usuario
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/PaginatedResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Appointment'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */
router.get(
  '/',
  JWTMiddleware,
  AppointmentController.getByUser
);

/**
 * @swagger
 * /appointments/{id}:
 *   put:
 *     summary: Actualizar una cita existente
 *     tags: [Appointments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/IdParam'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateAppointmentDTO'
 *     responses:
 *       200:
 *         description: Cita actualizada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Appointment'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */
router.put(
  '/:id',
  JWTMiddleware,
  roleMiddleware('PADRE'),
  AppointmentController.update
);

/**
 * @swagger
 * /appointments/cancel/{id}:
 *   patch:
 *     summary: Cancelar una cita
 *     tags: [Appointments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID de la cita a cancelar
 *         schema:
 *           type: string
 *           example: '507f1f77bcf86cd799439011'
 *     responses:
 *       200:
 *         description: Cita cancelada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Appointment'
 *             example:
 *               success: true
 *               status: 200
 *               message: Cita cancelada exitosamente
 *               data:
 *                 status: CANCELLED
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */
router.patch(
  '/cancel/:id',
  JWTMiddleware,
  AppointmentController.cancel
);

/**
 * @swagger
 * /appointments/history/{id}:
 *   get:
 *     summary: Obtener historial de cambios de una cita
 *     tags: [Appointments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID de la cita
 *         schema:
 *           type: string
 *           example: '507f1f77bcf86cd799439011'
 *     responses:
 *       200:
 *         description: Historial de la cita
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 status:
 *                   type: integer
 *                   example: 200
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       changedAt:
 *                         type: string
 *                         format: date-time
 *                       changedBy:
 *                         type: string
 *                         example: 'uuid-del-usuario'
 *                       previousStatus:
 *                         type: string
 *                         enum: [PENDING, CONFIRMED, CANCELLED, COMPLETED]
 *                       newStatus:
 *                         type: string
 *                         enum: [PENDING, CONFIRMED, CANCELLED, COMPLETED]
 *                       notes:
 *                         type: string
 *                         example: 'El padre canceló la cita'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */
router.get(
  '/history/:id',
  JWTMiddleware,
  AppointmentController.getHistory
);

export default router;