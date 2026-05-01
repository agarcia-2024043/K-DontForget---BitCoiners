import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import mongoose from "mongoose";
import { connectDB } from "./src/config/db.js";
import appointmentRoutes from "./src/routes/appointment.routes.js";
import errorHandler from "./src/middlewares/error.middleware.js";
import { setupSwagger } from "./src/config/swagger.js";
import appointmentHistoryRoutes from "./src/routes/appointmentHistory.routes.js";
import { initReminderJob } from "./src/services/reminder.service.js"; 

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(helmet());
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "API funcionando correctamente" });
});

app.get("/health", (req, res) => {
  const dbState = mongoose.connection.readyState;
  const states = {
    0: "Desconectado",
    1: "Conectado",
    2: "Conectando",
    3: "Desconectándose"
  };

  res.status(200).json({
    success: true,
    server: "OK",
    database: states[dbState],
    uptime: process.uptime(),
    timestamp: new Date()
  });
});

app.use("/api/appointments", appointmentRoutes);
app.use("/api/history", appointmentHistoryRoutes);

setupSwagger(app);

app.use(errorHandler);

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Servidor corriendo en puerto ${PORT}`);
    
    initReminderJob();
    
    console.log("Servicio de recordatorios automatizado iniciado");
  });
});