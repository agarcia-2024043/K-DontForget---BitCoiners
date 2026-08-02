import { Router } from "express";
import {
  getTeachers,
  getTeacherById,
  createTeacher,
  updateTeacher,
  deleteTeacher,
} from "../controllers/teacher.controller.js";
import JWTMiddleware from "../middlewares/JWT.middleware.js";
import roleMiddleware from "../middlewares/role.middleware.js";

const router = Router();

// Todas las rutas de profesores requieren autenticación
router.use(JWTMiddleware);

// GET: Todos los usuarios (Padres y Coordinadores) pueden ver los profesores
router.get("/", getTeachers);
router.get("/:id", getTeacherById);

// POST, PUT, DELETE: Solo los coordinadores pueden modificar los profesores
router.post("/", roleMiddleware("Coordinador"), createTeacher);
router.put("/:id", roleMiddleware("Coordinador"), updateTeacher);
router.delete("/:id", roleMiddleware("Coordinador"), deleteTeacher);

export default router;
