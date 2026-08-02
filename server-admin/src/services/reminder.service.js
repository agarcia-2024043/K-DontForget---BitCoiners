import cron from "node-cron";
import nodemailer from "nodemailer";
import Appointment from "../models/appointment.model.js";
import NotificationService from "./notification.service.js";
import * as WhatsAppService from "./whatsapp.service.js";
import logger from "../config/logger.js";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/**
 * Busca citas PENDIENTES o CONFIRMADAS que ocurran mañana y envía recordatorios.
 */
const sendReminders = async () => {
  try {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    const dayAfter = new Date(tomorrow);
    dayAfter.setDate(dayAfter.getDate() + 1);

    const appointments = await Appointment.find({
      status: { $in: ["PENDING", "CONFIRMED"] },
      date: { $gte: tomorrow, $lt: dayAfter },
    });

    if (appointments.length === 0) {
      logger.info("Recordatorios: No hay citas mañana.");
      return;
    }

    for (const appointment of appointments) {
      // Crear notificación interna para el padre
      await NotificationService.createNotification({
        userId: appointment.parentId,
        title: "Recordatorio de Cita",
        message: `Tienes una cita mañana ${appointment.date.toISOString().split("T")[0]} de ${appointment.startTime.toLocaleTimeString("es-GT")} a ${appointment.endTime.toLocaleTimeString("es-GT")}.`,
        type: "Reminder",
      });

      // Crear notificación interna para el coordinador
      await NotificationService.createNotification({
        userId: appointment.coordinatorId,
        title: "Recordatorio de Cita",
        message: `Tienes una cita mañana ${appointment.date.toISOString().split("T")[0]}.`,
        type: "Reminder",
      });

      // Enviar WhatsApp al padre si tiene número registrado
      if (appointment.phoneNumber) {
        await WhatsAppService.sendAppointmentReminder(appointment.phoneNumber, appointment);
        logger.info(`WhatsApp de recordatorio enviado para cita ${appointment._id}`);
      } else {
        logger.warn(`Cita ${appointment._id} sin phoneNumber: recordatorio WhatsApp omitido.`);
      }

      logger.info(
        `Recordatorio procesado para cita ${appointment._id} del padre ${appointment.parentId}`
      );
    }

    logger.info(`Recordatorios procesados: ${appointments.length} citas encontradas para mañana.`);
  } catch (error) {
    logger.error(`Error en servicio de recordatorios: ${error.message}`);
  }
};

/**
 * Inicia el job de recordatorios diario a las 8:00 AM
 */
export const initReminderJob = () => {
  cron.schedule("0 8 * * *", () => {
    logger.info("Ejecutando job de recordatorios diarios...");
    sendReminders();
  });

  logger.info("Job de recordatorios programado para las 8:00 AM diariamente.");
};

