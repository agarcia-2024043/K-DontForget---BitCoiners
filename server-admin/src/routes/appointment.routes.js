import express from 'express';
import AppointmentController from '../controllers/appointment.controller.js';
import JWTMiddleware from '../middlewares/JWT.middleware.js';
import roleMiddleware from '../middlewares/role.middleware.js';
import { appointmentValidation } from '../middlewares/validation.middleware.js';

const router = express.Router();

router.post(
  '/',
  JWTMiddleware,
  roleMiddleware('PADRE'),
  appointmentValidation,
  AppointmentController.create
);

router.get(
  '/',
  JWTMiddleware,
  AppointmentController.getByUser
);

router.put(
  '/:id',
  JWTMiddleware,
  roleMiddleware('PADRE'),
  AppointmentController.update
);

router.patch(
  '/cancel/:id',
  JWTMiddleware,
  AppointmentController.cancel
);

router.get(
  '/history/:id',
  JWTMiddleware,
  AppointmentController.getHistory
);

export default router;