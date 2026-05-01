import { body, validationResult } from 'express-validator';

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
  body('coordinatorId')
    .notEmpty().withMessage('coordinatorId es requerido'),
  body('date')
    .notEmpty().withMessage('La fecha es requerida')
    .isISO8601().withMessage('Formato de fecha inválido (usar ISO 8601)'),
  body('startTime')
    .notEmpty().withMessage('La hora de inicio es requerida')
    .isISO8601().withMessage('Formato de startTime inválido'),
  body('endTime')
    .notEmpty().withMessage('La hora de fin es requerida')
    .isISO8601().withMessage('Formato de endTime inválido'),
  body('reason')
    .notEmpty().withMessage('El motivo es requerido')
    .isLength({ min: 5, max: 500 }).withMessage('El motivo debe tener entre 5 y 500 caracteres'),
  handleValidationErrors
];

// Validaciones para historial (usadas si se expone el endpoint directo)
export const historyValidation = [
  body('appointmentId')
    .notEmpty().withMessage('appointmentId es requerido')
    .isMongoId().withMessage('ID de cita inválido'),
  body('action')
    .isIn(['CREATED', 'UPDATED', 'CONFIRMED', 'CANCELLED', 'COMPLETED'])
    .withMessage('Acción inválida'),
  handleValidationErrors
];