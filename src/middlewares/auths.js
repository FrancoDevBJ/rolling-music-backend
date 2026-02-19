const jwt = require("jsonwebtoken");
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    // Obtener token
    const authHeader = req.header("Authorization");

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: "Acceso denegado. No se proporciono token.",
      });
    }

    // Extraer el token
    const token = authHeader.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Formato de token inválido.",
      });
    }

    // Verifico el token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select('-password');

    if(!user){
      return res.status(401).json({
        ok: false,
        message: 'Usuario no encontrado'
      })
    }

    req.user = user;

    // Agregar info del usuario a la request
    /* req.user = {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role,
    }; */

    next();

    // Si todo esta bien, continuar

    // manejar errores
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Por favor, inicia sesion nuevamente.",
      });
    }

    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Token invalido.",
      });
    }

    res.status(500).json({
      success: false,
      message: "Error al verificar autenticacion.",
      error: error.message,
    });
  }
};

//verificar si el usuario es admin o superadmin
const verifyAdmin = (req, res, next) => {
    if(req.user.role !== process.env.ADMIN_ROLE && req.user.role !== process.env.SUPER_ADMIN_ROLE){
        return res.status(403).json({
            ok: false,
            message: 'Acceso denegado. Se requieren permisos de administrador'
        })
    }
    next();
}

//verificar si el usuario es superadmin
const verifySuperAdmin = (req, res, next) => {
    if(req.user.role !== process.env.SUPER_ADMIN_ROLE){
        return res.status(403).json({
            ok: false,
            message: 'Acceso denegado. Se requieren permisos de super administrador'
        })
    }
}

module.exports = {
  auth,
  verifyAdmin,
  verifySuperAdmin
}
