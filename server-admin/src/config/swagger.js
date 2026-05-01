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
      description: 'API de gestión de citas para la Fundación Kinal. ' +
        'Autenticarse con JWT obtenido del servicio de auth (.NET). ' +
        'Incluir el token en el header: Authorization: Bearer <token>',
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 4000}`,
        description: 'Servidor local (Node.js - Appointments)'
      },
      {
        url: 'http://localhost:5065',
        description: 'Servidor local (.NET - Auth Service)'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Token JWT emitido por el servicio de autenticación (.NET)'
        }
      },
      schemas: {
        Appointment: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '507f1f77bcf86cd799439011' },
            parentId: { type: 'string', example: 'uuid-del-padre' },
            coordinatorId: { type: 'string', example: 'uuid-del-coordinador' },
            date: { type: 'string', format: 'date', example: '2025-06-15' },
            startTime: { type: 'string', format: 'date-time' },
            endTime: { type: 'string', format: 'date-time' },
            reason: { type: 'string', example: 'Consulta académica' },
            status: {
              type: 'string',
              enum: ['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED'],
              example: 'PENDING'
            }
          }
        },
        Error: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            status: { type: 'integer', example: 400 },
            message: { type: 'string', example: 'Descripción del error' }
          }
        }
      }
    },
    security: [{ bearerAuth: [] }]
  },
  apis: [path.join(__dirname, '../routes/*.js')]
};

const specs = swaggerJsdoc(options);

export const setupSwagger = (app) => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, {
    customSiteTitle: 'Schedule K API Docs'
  }));
};