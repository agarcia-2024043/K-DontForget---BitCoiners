import { body, validationResult } from "express-validator";

// Middleware reutilizable para manejar errores de validación
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }
  next();
};

// Validaciones para crear una cita
export const appointmentValidation = [
  body("coordinatorId").notEmpty().withMessage("coordinatorId es requerido"),
  body("date")
    .notEmpty().withMessage("La fecha es requerida")
    .isISO8601().withMessage("Formato de fecha inválido (usar ISO 8601)"),
  body("startTime")
    .notEmpty().withMessage("La hora de inicio es requerida")
    .isISO8601().withMessage("Formato de startTime inválido"),
  body("endTime")
    .notEmpty().withMessage("La hora de fin es requerida")
    .isISO8601().withMessage("Formato de endTime inválido"),
  body("reason")
    .notEmpty().withMessage("El motivo es requerido")
    .isLength({ min: 5, max: 500 }).withMessage("El motivo debe tener entre 5 y 500 caracteres"),
  handleValidationErrors,
];

// Validaciones para crear una notificación
export const notificationValidation = [
  body("userId").notEmpty().withMessage("userId es requerido"),
  body("title")
    .notEmpty().withMessage("El título es requerido")
    .isLength({ max: 255 }).withMessage("El título no puede exceder 255 caracteres"),
  body("message")
    .notEmpty().withMessage("El mensaje es requerido")
    .isLength({ max: 1000 }).withMessage("El mensaje no puede exceder 1000 caracteres"),
  handleValidationErrors,
];

// Validaciones para crear un horario de coordinador
export const scheduleValidation = [
  body("dayOfWeek")
    .notEmpty().withMessage("dayOfWeek es requerido")
    .isInt({ min: 0, max: 6 }).withMessage("dayOfWeek debe ser un número entre 0 (Domingo) y 6 (Sábado)"),
  body("startTime").notEmpty().withMessage("La hora de inicio es requerida"),
  body("endTime").notEmpty().withMessage("La hora de fin es requerida"),
  handleValidationErrors,
];

// Validaciones para historial
export const historyValidation = [
  body("appointmentId")
    .notEmpty().withMessage("appointmentId es requerido")
    .isMongoId().withMessage("ID de cita inválido"),
  body("action")
    .isIn(["CREATED", "UPDATED", "CONFIRMED", "CANCELLED", "COMPLETED"])
    .withMessage("Acción inválida"),
  handleValidationErrors,
];
