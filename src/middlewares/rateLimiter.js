const rateLimit = require('express-rate-limit');



//Limitador Global
const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, //15 minutos
    max:100, //Limita cada IP a X numero de solicitudes por ventana (windowMs)
    message: {
        success: false,
        message: 'Demasiadas peticiones desde esta IP ⛔. Por favor, intenta de nuevo en 15 minutos ⏳'
    },
    standardHeaders: true, //retornar info del limite en los heaters 'RateLimit-*'
    legacyHeaders: false, //desactivar los headers "X-RateLimit"
})


//Limitador específico
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, //15 minutos
    max:2, //Limita cada IP a X numero de solicitudes por ventana (windowMs)
    message: {
        success: false,
        message: 'Demasiados intentos de acceso. Intente más tarde ⏳'
    },
    standardHeaders: true, //retornar info del limite en los heaters 'RateLimit-*'
    legacyHeaders: false, //desactivar los headers "X-RateLimit"
})



module.exports = {
    globalLimiter,
    authLimiter
}