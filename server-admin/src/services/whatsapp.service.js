import twilio from "twilio";
import logger from "../config/logger.js";

/**
 * Normaliza un número de teléfono al formato de WhatsApp de Twilio.
 * Acepta: +50212345678, 50212345678, 12345678 (Guatemala sin código de país)
 */
const normalizePhone = (phone) => {
  if (!phone) return null;

  // Quitar espacios y guiones
  let clean = phone.replace(/[\s\-().]/g, "");

  // Si ya tiene el prefijo whatsapp: retornarlo tal cual
  if (clean.startsWith("whatsapp:")) return clean;

  // Si no tiene + ni código de país, asumir Guatemala (+502)
  if (!clean.startsWith("+") && clean.length === 8) {
    clean = "+502" + clean;
  } else if (!clean.startsWith("+")) {
    clean = "+" + clean;
  }

  return `whatsapp:${clean}`;
};

/**
 * Envía un mensaje de WhatsApp usando Twilio.
 * Si Twilio no está configurado, lo registra como warning y continúa.
 */
const sendWhatsApp = async (toPhone, message) => {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_WHATSAPP_FROM; // ej: "whatsapp:+14155238886"

  if (!accountSid || !authToken || !from) {
    logger.warn("WhatsApp no configurado: faltan variables TWILIO_* en .env. Mensaje no enviado.");
    return;
  }

  const to = normalizePhone(toPhone);
  if (!to) {
    logger.warn("WhatsApp: número de teléfono inválido o no proporcionado. Mensaje no enviado.");
    return;
  }

  try {
    const client = twilio(accountSid, authToken);
    const msg = await client.messages.create({ body: message, from, to });
    logger.info(`WhatsApp enviado a ${to} - SID: ${msg.sid}`);
  } catch (error) {
    // No lanzamos el error para no interrumpir el flujo principal de la cita
    logger.error(`Error enviando WhatsApp a ${to}: ${error.message}`);
  }
};

// ─── Mensajes por evento ────────────────────────────────────────────────────

/**
 * Notifica al padre que su cita fue creada y está pendiente de confirmación.
 */
export const sendAppointmentCreated = async (phoneNumber, appointment) => {
  const fecha = appointment.date instanceof Date
    ? appointment.date.toISOString().split("T")[0]
    : appointment.date;

  const horaInicio = appointment.startTime instanceof Date
    ? appointment.startTime.toLocaleTimeString("es-GT", { hour: "2-digit", minute: "2-digit", hour12: true })
    : appointment.startTime;

  const horaFin = appointment.endTime instanceof Date
    ? appointment.endTime.toLocaleTimeString("es-GT", { hour: "2-digit", minute: "2-digit", hour12: true })
    : appointment.endTime;

  const message =
    `📅 *K-DontForget | Nueva Cita Creada*\n\n` +
    `Hola! Tu solicitud de cita ha sido registrada exitosamente.\n\n` +
    `📆 *Fecha:* ${fecha}\n` +
    `🕐 *Hora:* ${horaInicio} - ${horaFin}\n` +
    `📝 *Motivo:* ${appointment.reason}\n` +
    `⏳ *Estado:* Pendiente de confirmación\n\n` +
    `Te avisaremos cuando el coordinador confirme tu cita. 🙏`;

  await sendWhatsApp(phoneNumber, message);
};

/**
 * Notifica al padre que su cita fue confirmada por el coordinador.
 */
export const sendAppointmentConfirmed = async (phoneNumber, appointment) => {
  const fecha = appointment.date instanceof Date
    ? appointment.date.toISOString().split("T")[0]
    : appointment.date;

  const horaInicio = appointment.startTime instanceof Date
    ? appointment.startTime.toLocaleTimeString("es-GT", { hour: "2-digit", minute: "2-digit", hour12: true })
    : appointment.startTime;

  const message =
    `✅ *K-DontForget | Cita Confirmada*\n\n` +
    `¡Excelente! Tu cita ha sido *confirmada* por el coordinador.\n\n` +
    `📆 *Fecha:* ${fecha}\n` +
    `🕐 *Hora:* ${horaInicio}\n\n` +
    `Por favor, asegúrate de llegar a tiempo. ¡Te esperamos! 😊`;

  await sendWhatsApp(phoneNumber, message);
};

/**
 * Notifica al padre que su cita fue cancelada o rechazada.
 * Si el coordinador sugiere alternativas (alternativeTimes), se incluyen en el mensaje.
 */
export const sendAppointmentCancelled = async (toPhone, appointment, alternativeTimes = []) => {
  const dateStr = appointment.date.toISOString().split("T")[0];
  const timeStr = appointment.startTime.toLocaleTimeString("es-GT", { hour: "2-digit", minute: "2-digit" });

  let message = `Hola, te informamos que tu cita para el ${dateStr} a las ${timeStr} ha sido cancelada.\n\n`;
  message += `Motivo registrado: ${appointment.reason}\n\n`;

  if (alternativeTimes && alternativeTimes.length > 0) {
    message += `💡 *Sugerencias de otros horarios disponibles para ese día:*\n`;
    alternativeTimes.forEach(t => message += `- ${t}\n`);
    message += `\nPuedes solicitar una nueva cita en la plataforma con alguno de estos horarios.`;
  } else {
    message += `Por favor, ingresa a la plataforma si deseas solicitar un nuevo horario.`;
  }

  await sendWhatsApp(toPhone, message);
};

/**
 * Notifica que una cita fue reprogramada.
 */
export const sendAppointmentRescheduled = async (phoneNumber, appointment) => {
  const fecha = appointment.date instanceof Date
    ? appointment.date.toISOString().split("T")[0]
    : appointment.date;

  const horaInicio = appointment.startTime instanceof Date
    ? appointment.startTime.toLocaleTimeString("es-GT", { hour: "2-digit", minute: "2-digit", hour12: true })
    : appointment.startTime;

  const message =
    `🔄 *K-DontForget | Cita Reprogramada*\n\n` +
    `Tu cita ha sido reprogramada exitosamente.\n\n` +
    `📆 *Nueva Fecha:* ${fecha}\n` +
    `🕐 *Nueva Hora:* ${horaInicio}\n` +
    `⏳ *Estado:* Pendiente de confirmación\n\n` +
    `Te avisaremos cuando el coordinador confirme el nuevo horario. 🙏`;

  await sendWhatsApp(phoneNumber, message);
};

/**
 * Envía recordatorio del día anterior a la cita.
 */
export const sendAppointmentReminder = async (phoneNumber, appointment) => {
  const fecha = appointment.date instanceof Date
    ? appointment.date.toISOString().split("T")[0]
    : appointment.date;

  const horaInicio = appointment.startTime instanceof Date
    ? appointment.startTime.toLocaleTimeString("es-GT", { hour: "2-digit", minute: "2-digit", hour12: true })
    : appointment.startTime;

  const horaFin = appointment.endTime instanceof Date
    ? appointment.endTime.toLocaleTimeString("es-GT", { hour: "2-digit", minute: "2-digit", hour12: true })
    : appointment.endTime;

  const message =
    `⏰ *K-DontForget | Recordatorio de Cita*\n\n` +
    `¡Hola! Te recordamos que tienes una cita *mañana*.\n\n` +
    `📆 *Fecha:* ${fecha}\n` +
    `🕐 *Hora:* ${horaInicio} - ${horaFin}\n\n` +
    `Por favor, asegúrate de asistir puntualmente. ¡Hasta mañana! 😊`;

  await sendWhatsApp(phoneNumber, message);
};
