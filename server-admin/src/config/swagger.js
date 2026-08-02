import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Schedule K - API de Gestión",
      version: "1.0.0",
      description:
        "API de gestión de citas, notificaciones y horarios para la Fundación Kinal. " +
        "Autenticarse con JWT obtenido del servicio de auth (.NET). " +
        "Incluir el token en el header: `Authorization: Bearer <token>`",
      contact: {
        name: "BitCoiners - Fundación Kinal",
        email: "soporte@kinal.edu.gt",
      },
      license: { name: "ISC" },
    },

    servers: [
      {
        url: `http://localhost:${process.env.PORT || 4000}`,
        description: "Servidor local (Node.js - Gestión)",
      },
      {
        url: "http://localhost:5065",
        description: "Servidor local (.NET - Auth Service)",
      },
    ],

    tags: [
      { name: "Health", description: "Estado del servidor y base de datos" },
      { name: "Appointments", description: "CRUD de citas y gestión de estados" },
      { name: "History", description: "Historial de cambios de una cita" },
      { name: "Notifications", description: "Notificaciones del usuario" },
      { name: "Coordinator Schedules", description: "Gestión de horarios de coordinadores" },
    ],

    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "Token JWT emitido por el servicio de autenticación (.NET)",
        },
      },

      schemas: {
        Appointment: {
          type: "object",
          properties: {
            _id: { type: "string", example: "507f1f77bcf86cd799439011" },
            parentId: { type: "string", example: "uuid-del-padre" },
            coordinatorId: { type: "string", example: "uuid-del-coordinador" },
            date: { type: "string", format: "date", example: "2025-06-15" },
            startTime: { type: "string", format: "date-time", example: "2025-06-15T09:00:00Z" },
            endTime: { type: "string", format: "date-time", example: "2025-06-15T09:30:00Z" },
            reason: { type: "string", example: "Consulta académica" },
            status: {
              type: "string",
              enum: ["PENDING", "CONFIRMED", "CANCELLED", "COMPLETED"],
              example: "PENDING",
            },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },

        CreateAppointmentDTO: {
          type: "object",
          required: ["coordinatorId", "date", "startTime", "endTime", "reason"],
          properties: {
            coordinatorId: { type: "string", example: "uuid-del-coordinador" },
            date: { type: "string", format: "date", example: "2025-06-15" },
            startTime: { type: "string", format: "date-time", example: "2025-06-15T09:00:00Z" },
            endTime: { type: "string", format: "date-time", example: "2025-06-15T09:30:00Z" },
            reason: { type: "string", example: "Consulta académica" },
          },
        },

        Notification: {
          type: "object",
          properties: {
            _id: { type: "string", example: "507f1f77bcf86cd799439011" },
            userId: { type: "string", example: "uuid-del-usuario" },
            title: { type: "string", example: "Nueva solicitud de cita" },
            message: { type: "string", example: "Un padre ha solicitado una cita" },
            type: { type: "string", enum: ["Appointment", "System", "Reminder"] },
            isRead: { type: "boolean", example: false },
            createdAt: { type: "string", format: "date-time" },
          },
        },

        CoordinatorSchedule: {
          type: "object",
          properties: {
            _id: { type: "string", example: "507f1f77bcf86cd799439011" },
            userId: { type: "string", example: "uuid-del-coordinador" },
            dayOfWeek: { type: "integer", minimum: 0, maximum: 6, example: 1 },
            startTime: { type: "string", example: "08:00" },
            endTime: { type: "string", example: "17:00" },
            isAvailable: { type: "boolean", example: true },
          },
        },

        SuccessResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: true },
            data: { type: "object" },
          },
        },

        Error: {
          type: "object",
          properties: {
            success: { type: "boolean", example: false },
            status: { type: "integer", example: 400 },
            message: { type: "string", example: "Descripción del error" },
          },
        },
      },

      responses: {
        Unauthorized: {
          description: "Token JWT ausente o inválido",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Error" },
              example: { success: false, status: 401, message: "Token no válido o expirado" },
            },
          },
        },
        Forbidden: {
          description: "Sin permisos suficientes",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Error" },
              example: { success: false, status: 403, message: "Acceso denegado" },
            },
          },
        },
        NotFound: {
          description: "Recurso no encontrado",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Error" },
              example: { success: false, status: 404, message: "Recurso no encontrado" },
            },
          },
        },
        ValidationError: {
          description: "Error de validación en el body",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Error" },
            },
          },
        },
      },
    },

    security: [{ bearerAuth: [] }],
  },

  apis: [
    path.join(__dirname, "../../index.js"),
    path.join(__dirname, "../routes/*.js"),
  ],
};

const specs = swaggerJsdoc(options);

const uiOptions = {
  customSiteTitle: "Schedule K API Docs",
  customCss: `
    .topbar { background-color: #1a1a2e; }
    .swagger-ui .info .title { color: #1a1a2e; }
  `,
  swaggerOptions: {
    persistAuthorization: true,
    displayRequestDuration: true,
    filter: true,
    deepLinking: true,
    defaultModelsExpandDepth: 2,
    docExpansion: "list",
    tryItOutEnabled: true,
  },
};

export const setupSwagger = (app) => {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs, uiOptions));

  app.get("/api-docs.json", (_req, res) => {
    res.setHeader("Content-Type", "application/json");
    res.send(specs);
  });

  console.log(`📚 Swagger UI   → http://localhost:${process.env.PORT || 4000}/api-docs`);
  console.log(`📄 Swagger JSON → http://localhost:${process.env.PORT || 4000}/api-docs.json`);
};
