import cron from 'node-cron';
import nodemailer from 'nodemailer';
import Appointment from '../models/appointment.model.js';
import logger from '../config/logger.js';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

/**
 * Busca citas PENDIENTES o CONFIRMADAS que ocurran mañana y envía recordatorios.
 * El modelo Appointment NO tiene email directamente — se usa una dirección de respaldo
 * o se debería enriquecer la cita con el email del padre vía el servicio de auth.
 */
const sendReminders = async () => {
  try {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    const dayAfter = new Date(tomorrow);
    dayAfter.setDate(dayAfter.getDate() + 1);

    // CORREGIDO: buscamos citas de mañana con status en mayúsculas (consistente con el modelo)
    const appointments = await Appointment.find({
      status: { $in: ['PENDING', 'CONFIRMED'] },
      date: { $gte: tomorrow, $lt: dayAfter }
    });

    if (appointments.length === 0) {
      logger.info('Recordatorios: No hay citas mañana.');
      return;
    }

    for (const appointment of appointments) {
      // NOTA: El modelo Appointment no almacena email del padre.
      // Para enviar el correo correctamente se debería consultar el servicio de auth
      // usando appointment.parentId. Por ahora logueamos el intento.
      logger.info(
        `Recordatorio pendiente para cita ${appointment._id} del padre ${appointment.parentId} el ${appointment.date.toISOString().split('T')[0]}`
      );

      // Ejemplo de envío si se obtiene el email externamente:
      // const mailOptions = {
      //   from: process.env.EMAIL_USER,
      //   to: emailDelPadre,
      //   subject: 'Recordatorio de Cita - Schedule K',
      //   text: `Hola, tienes una cita mañana ${appointment.date.toLocaleDateString('es-GT')} de ${appointment.startTime.toLocaleTimeString('es-GT')} a ${appointment.endTime.toLocaleTimeString('es-GT')}.`
      // };
      // await transporter.sendMail(mailOptions);
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
  // CORREGIDO: cada minuto solo en dev. En producción usar '0 8 * * *' (8 AM diario)
  cron.schedule('0 8 * * *', () => {
    logger.info('Ejecutando job de recordatorios diarios...');
    sendReminders();
  });

  logger.info('Job de recordatorios programado para las 8:00 AM diariamente.');
};