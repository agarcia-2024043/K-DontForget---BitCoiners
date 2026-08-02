const roleMiddleware = (requiredRole) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(401).json({ success: false, message: "Usuario no autenticado o sin rol." });
    }

    if (req.user.role.toLowerCase() !== requiredRole.toLowerCase()) {
      return res.status(403).json({ success: false, message: `Acceso denegado: se requiere rol ${requiredRole}.` });
    }

    next();
  };
};

export default roleMiddleware;
