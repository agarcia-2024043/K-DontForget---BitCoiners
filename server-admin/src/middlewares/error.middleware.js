import logger from "../config/logger.js";

const errorHandler = (err, req, res, _next) => {
  const status = err.status || 500;
  const message = err.message || "Error interno del servidor";

  logger.error(`[${req.method}] ${req.originalUrl} → ${status}: ${message}`);

  res.status(status).json({ success: false, status, message });
};

export default errorHandler;
