import logger from '../config/logger.js';

const errorMiddleware = (err, req, res, next) => {
  logger.error(`${err.status || 500} - ${err.message} - ${req.originalUrl} - ${req.method}`);

  const statusCode = err.status || 500;
  const message = err.message || 'Error interno del servidor';

  res.status(statusCode).json({
    success: false,
    status: statusCode,
    message
  });
};

export default errorMiddleware;