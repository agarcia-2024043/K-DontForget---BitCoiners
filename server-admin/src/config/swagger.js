import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Schedule K - Appointments API',
      version: '1.0.0',
      description:
        'API de gestión de citas para la Fundación Kinal. ' +
        'Autenticarse con JWT obtenido del servicio de auth (.NET). ' +
        'Incluir el token en el header: `Authorization: Bearer <token>`',
      contact: {
        name: 'BitCoiners - Fundación Kinal',
        email: 'soporte@kinal.edu.gt',
      },
      license: {
        name: 'ISC',
      },
    },

    servers: [
      {
        url: `http://localhost:${process.env.PORT || 4000}`,
        description: 'Servidor local (Node.js - Appointments)',
      },
      {
        url: 'http://localhost:5065',
        description: 'Servidor local (.NET - Auth Service)',
      },
    ],

    tags: [
      { name: 'Health',        description: 'Estado del servidor y base de datos' },
      { name: 'Appointments',  description: 'CRUD de citas y gestión de estados' },
      { name: 'History',       description: 'Historial de cambios de una cita' },
      { name: 'Coordinators',  description: 'Gestión de coordinadores y su disponibilidad' },
      { name: 'Parents',       description: 'Gestión de padres de familia' },
      { name: 'Notifications', description: 'Envío de correos y recordatorios automáticos' },
    ],

    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Token JWT emitido por el servicio de autenticación (.NET)',
        },
      },

      schemas: {

        Appointment: {
          type: 'object',
          properties: {
            _id:           { type: 'string',  example: '507f1f77bcf86cd799439011' },
            parentId:      { type: 'string',  example: 'uuid-del-padre' },
            coordinatorId: { type: 'string',  example: 'uuid-del-coordinador' },
            date:          { type: 'string',  format: 'date',      example: '2025-06-15' },
            startTime:     { type: 'string',  format: 'date-time', example: '2025-06-15T09:00:00Z' },
            endTime:       { type: 'string',  format: 'date-time', example: '2025-06-15T09:30:00Z' },
            reason:        { type: 'string',  example: 'Consulta académica' },
            notes:         { type: 'string',  example: 'El padre solicita hablar sobre calificaciones' },
            status: {
              type: 'string',
              enum: ['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED'],
              example: 'PENDING',
            },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },

        CreateAppointmentDTO: {
          type: 'object',
          required: ['parentId', 'coordinatorId', 'date', 'startTime', 'endTime', 'reason'],
          properties: {
            parentId:      { type: 'string',  example: 'uuid-del-padre' },
            coordinatorId: { type: 'string',  example: 'uuid-del-coordinador' },
            date:          { type: 'string',  format: 'date',      example: '2025-06-15' },
            startTime:     { type: 'string',  format: 'date-time', example: '2025-06-15T09:00:00Z' },
            endTime:       { type: 'string',  format: 'date-time', example: '2025-06-15T09:30:00Z' },
            reason:        { type: 'string',  example: 'Consulta académica' },
            notes:         { type: 'string',  example: 'Opcional: detalle adicional' },
          },
        },

        UpdateAppointmentDTO: {
          type: 'object',
          properties: {
            date:      { type: 'string', format: 'date',      example: '2025-06-20' },
            startTime: { type: 'string', format: 'date-time', example: '2025-06-20T10:00:00Z' },
            endTime:   { type: 'string', format: 'date-time', example: '2025-06-20T10:30:00Z' },
            reason:    { type: 'string', example: 'Reunión de seguimiento' },
            notes:     { type: 'string', example: 'Actualización de la razón de la cita' },
            status: {
              type: 'string',
              enum: ['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED'],
            },
          },
        },

        AppointmentHistoryEntry: {
          type: 'object',
          properties: {
            changedAt: {
              type: 'string',
              format: 'date-time',
              example: '2025-06-15T10:30:00Z',
            },
            changedBy: {
              type: 'string',
              example: 'uuid-del-usuario',
            },
            previousStatus: {
              type: 'string',
              enum: ['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED'],
              example: 'PENDING',
            },
            newStatus: {
              type: 'string',
              enum: ['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED'],
              example: 'CONFIRMED',
            },
            notes: {
              type: 'string',
              example: 'Cita confirmada por el coordinador',
            },
          },
        },

        Coordinator: {
          type: 'object',
          properties: {
            _id:        { type: 'string', example: '507f1f77bcf86cd799439022' },
            externalId: { type: 'string', example: 'uuid-del-coordinador' },
            name:       { type: 'string', example: 'Licda. María García' },
            email:      { type: 'string', format: 'email', example: 'mgarcia@kinal.edu.gt' },
            department: { type: 'string', example: 'Coordinación Académica' },
            availability: {
              type: 'array',
              description: 'Slots de disponibilidad semanal',
              items: { $ref: '#/components/schemas/AvailabilitySlot' },
            },
          },
        },

        AvailabilitySlot: {
          type: 'object',
          properties: {
            dayOfWeek: {
              type: 'integer',
              minimum: 0,
              maximum: 6,
              description: '0 = Domingo, 1 = Lunes … 6 = Sábado',
              example: 1,
            },
            startTime: { type: 'string', example: '08:00' },
            endTime:   { type: 'string', example: '17:00' },
          },
        },

        Parent: {
          type: 'object',
          properties: {
            _id:        { type: 'string', example: '507f1f77bcf86cd799439033' },
            externalId: { type: 'string', example: 'uuid-del-padre' },
            name:       { type: 'string', example: 'Juan Pérez' },
            email:      { type: 'string', format: 'email', example: 'jperez@email.com' },
            phone:      { type: 'string', example: '+502 5555-1234' },
            students: {
              type: 'array',
              items: { type: 'string' },
              example: ['Carlos Pérez', 'Ana Pérez'],
            },
          },
        },

        SuccessResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            status:  { type: 'integer', example: 200 },
            message: { type: 'string',  example: 'Operación realizada con éxito' },
            data:    { type: 'object',  description: 'Payload de la respuesta' },
          },
        },

        PaginatedResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            status:  { type: 'integer', example: 200 },
            data:    { type: 'array', items: { type: 'object' } },
            pagination: {
              type: 'object',
              properties: {
                total:      { type: 'integer', example: 48 },
                page:       { type: 'integer', example: 1 },
                limit:      { type: 'integer', example: 10 },
                totalPages: { type: 'integer', example: 5 },
              },
            },
          },
        },

        Error: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            status:  { type: 'integer', example: 400 },
            message: { type: 'string',  example: 'Descripción del error' },
            errors: {
              type: 'array',
              description: 'Lista de errores de validación (express-validator)',
              items: {
                type: 'object',
                properties: {
                  field:   { type: 'string', example: 'date' },
                  message: { type: 'string', example: 'La fecha es requerida' },
                },
              },
            },
          },
        },
      },

      responses: {
        Unauthorized: {
          description: 'Token JWT ausente o inválido',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' },
              example: { success: false, status: 401, message: 'Token no válido o expirado' },
            },
          },
        },
        Forbidden: {
          description: 'Sin permisos suficientes',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' },
              example: { success: false, status: 403, message: 'Acceso denegado' },
            },
          },
        },
        NotFound: {
          description: 'Recurso no encontrado',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' },
              example: { success: false, status: 404, message: 'Recurso no encontrado' },
            },
          },
        },
        ValidationError: {
          description: 'Error de validación en el body',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' },
            },
          },
        },
        InternalError: {
          description: 'Error interno del servidor',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' },
              example: { success: false, status: 500, message: 'Error interno del servidor' },
            },
          },
        },
      },

      parameters: {
        IdParam: {
          name: 'id',
          in: 'path',
          required: true,
          description: 'ID del recurso (MongoDB ObjectId)',
          schema: { type: 'string', example: '507f1f77bcf86cd799439011' },
        },
        PageParam: {
          name: 'page',
          in: 'query',
          description: 'Número de página (default: 1)',
          schema: { type: 'integer', default: 1 },
        },
        LimitParam: {
          name: 'limit',
          in: 'query',
          description: 'Registros por página (default: 10, max: 100)',
          schema: { type: 'integer', default: 10, maximum: 100 },
        },
      },
    },

    security: [{ bearerAuth: [] }],
  },


  apis: [
    path.join(__dirname, '../../index.js'),
    path.join(__dirname, '../routes/*.js'),
  ],
};

const specs = swaggerJsdoc(options);

const uiOptions = {
  customSiteTitle: 'Schedule K API Docs',
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
    defaultModelExpandDepth: 2,
    docExpansion: 'list',
    tryItOutEnabled: true,
  },
};

export const setupSwagger = (app) => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, uiOptions));

  app.get('/api-docs.json', (_req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(specs);
  });

  console.log(` Swagger UI   → http://localhost:${process.env.PORT || 4000}/api-docs`);
  console.log(` Swagger JSON → http://localhost:${process.env.PORT || 4000}/api-docs.json`);
};