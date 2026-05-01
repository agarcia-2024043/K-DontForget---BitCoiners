import jwt from 'jsonwebtoken';

const JWTMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Token no proporcionado o mal formado.' });
    }

    const token = authHeader.split(' ')[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET, {
      ignoreIssuer: true,
      ignoreAudience: true
    });

    // Mapeo flexible de claims de .NET (nombres largos) y Node (nombres cortos)
    const id =
      decoded.id ||
      decoded.userId ||
      decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'];

    const role =
      decoded.role ||
      decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];

    const email =
      decoded.email ||
      decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'];

    if (!id || !role) {
      return res.status(401).json({ success: false, message: 'Token sin claims requeridos (id, role).' });
    }

    req.user = { id, role, email };

    next();
  } catch (error) {
    console.error('JWT Error:', error.message);
    return res.status(401).json({ success: false, message: 'Token inválido o expirado.' });
  }
};

export default JWTMiddleware;