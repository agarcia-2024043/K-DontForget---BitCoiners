import express from "express";
import AppointmentHistoryController from "../controllers/appointmentHistory.controller.js";
import JWTMiddleware from "../middlewares/JWT.middleware.js";

const router = express.Router();

/**
 * @swagger
 * /api/history/{appointmentId}:
 *   get:
 *     summary: Obtener historial de una cita específica
 *     tags: [History]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: appointmentId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Historial de la cita
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.get("/:appointmentId", JWTMiddleware, AppointmentHistoryController.getByAppointment);

export default router;
