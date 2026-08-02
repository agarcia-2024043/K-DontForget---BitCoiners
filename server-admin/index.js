import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import mongoose from "mongoose";
import { connectDB } from "./src/config/db.js";
import { setupSwagger } from "./src/config/swagger.js";
import errorHandler from "./src/middlewares/error.middleware.js";
import { initReminderJob } from "./src/services/reminder.service.js";

// Rutas
import appointmentRoutes from "./src/routes/appointment.routes.js";
import appointmentHistoryRoutes from "./src/routes/appointmentHistory.routes.js";
import notificationRoutes from "./src/routes/notification.routes.js";
import coordinatorScheduleRoutes from "./src/routes/coordinatorSchedule.routes.js";
import teacherRoutes from "./src/routes/teacher.routes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// Middlewares globales
app.use(helmet());
app.use(cors());
app.use(express.json());

/**
 * @swagger
 * /:
 *   get:
 *     summary: Verificar que la API está activa
 *     tags: [Health]
 *     security: []
 *     responses:
 *       200:
 *         description: API funcionando
 */
app.get("/", (req, res) => {
  res.json({ message: "API funcionando correctamente" });
});

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Estado del servidor y la base de datos
 *     tags: [Health]
 *     security: []
 *     responses:
 *       200:
 *         description: Estado actual del servicio
 */
app.get("/health", (req, res) => {
  const dbState = mongoose.connection.readyState;
  const states = {
    0: "Desconectado",
    1: "Conectado",
    2: "Conectando",
    3: "Desconectándose",
  };

  res.status(200).json({
    success: true,
    server: "OK",
    database: states[dbState],
    uptime: process.uptime(),
    timestamp: new Date(),
  });
});

// Rutas de la API
app.use("/api/appointments", appointmentRoutes);
app.use("/api/history", appointmentHistoryRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/schedules", coordinatorScheduleRoutes);
app.use("/api/teachers", teacherRoutes);

// Swagger
setupSwagger(app);

// Error handler (debe ir al final)
app.use(errorHandler);

// Iniciar servidor
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
    initReminderJob();
    console.log("⏰ Servicio de recordatorios automatizado iniciado");
  });
});