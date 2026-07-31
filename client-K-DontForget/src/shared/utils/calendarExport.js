/**
 * Genera un enlace para programar la cita directamente en Google Calendar.
 */
export function getGoogleCalendarLink(cita) {
  const title = encodeURIComponent(`Cita con ${cita.tutor}`);
  
  // Normalizar fecha de DD-MM-YYYY o YYYY-MM-DD a YYYYMMDD
  const parts = cita.fecha.split('-');
  let year, month, day;
  if (parts[0].length === 4) {
    year = parts[0];
    month = parts[1];
    day = parts[2];
  } else {
    year = parts[2];
    month = parts[1];
    day = parts[0];
  }
  
  const [hours, minutes] = cita.hora.split(':');
  
  // Crear objeto Date en hora local y calcular fin (30 min después)
  const startDate = new Date(year, month - 1, day, hours, minutes);
  const endDate = new Date(startDate.getTime() + 30 * 60000);
  
  // Formatear a UTC string requerido por Google: YYYYMMDDTHHmmSSZ
  const formatUTC = (date) => date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  
  const dates = `${formatUTC(startDate)}/${formatUTC(endDate)}`;
  const details = encodeURIComponent(`Estudiante: ${cita.estudiante}\nTipo: ${cita.tipo}\nEstado: ${cita.estado}`);
  
  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${dates}&details=${details}`;
}

/**
 * Genera y descarga un archivo iCal (.ics) compatible con Outlook, Apple Calendar, etc.
 */
export function downloadICSFile(cita) {
  const parts = cita.fecha.split('-');
  let year, month, day;
  if (parts[0].length === 4) {
    year = parts[0];
    month = parts[1];
    day = parts[2];
  } else {
    year = parts[2];
    month = parts[1];
    day = parts[0];
  }
  
  const [hours, minutes] = cita.hora.split(':');
  const startDate = new Date(year, month - 1, day, hours, minutes);
  const endDate = new Date(startDate.getTime() + 30 * 60000);
  
  const formatUTC = (date) => date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  
  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//K-DontForget//Appointment Calendar//ES',
    'BEGIN:VEVENT',
    `UID:${cita.id}@k-dontforget.com`,
    `DTSTAMP:${formatUTC(new Date())}`,
    `DTSTART:${formatUTC(startDate)}`,
    `DTEND:${formatUTC(endDate)}`,
    `SUMMARY:Cita con ${cita.tutor}`,
    `DESCRIPTION:Estudiante: ${cita.estudiante}\\nTipo: ${cita.tipo}\\nEstado: ${cita.estado}`,
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n');
  
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `cita-${cita.id}.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
