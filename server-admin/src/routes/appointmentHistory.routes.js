import express from "express";
import { getHistory } from "../controllers/appointmentHistory.controller.js";
import JWTMiddleware from "../middlewares/JWT.middleware.js";

const router = express.Router();

/**
 * @swagger
 * /appointments/history/{id}:
 *   get:
 *     summary: Obtener historial completo de una cita
 *     description: Retorna todos los cambios de estado registrados para una cita específica. Accesible por el padre dueño de la cita o por coordinadores.
 *     tags: [Appointments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID de la cita (MongoDB ObjectId)
 *         schema:
 *           type: string
 *           example: '507f1f77bcf86cd799439011'
 *     responses:
 *       200:
 *         description: Historial obtenido exitosamente
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
 *                         example: '2025-06-15T10:30:00Z'
 *                       changedBy:
 *                         type: string
 *                         example: 'uuid-del-usuario'
 *                       previousStatus:
 *                         type: string
 *                         enum: [PENDING, CONFIRMED, CANCELLED, COMPLETED]
 *                         example: 'PENDING'
 *                       newStatus:
 *                         type: string
 *                         enum: [PENDING, CONFIRMED, CANCELLED, COMPLETED]
 *                         example: 'CONFIRMED'
 *                       notes:
 *                         type: string
 *                         example: 'Cita confirmada por el coordinador'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */
router.get("/:id", JWTMiddleware, getHistory);

export default router;