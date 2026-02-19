//Middleware para manejar los errors

const { cleanUploadsFiles } = require("../utils/fileCleanup");

const errorHanlder = (err, req, res, next) => {

    console.error('Error: ', err)

    //Limpiar archivos subidos si hay error
    if(req.files || req.file){
        cleanUploadsFiles(req);
    }

//Error de validaciones de Mongoose
if(err.name === 'ValidationError'){
    const errors = Object.values(err.errors).map(e => e.message);
    return res.status(400).json({
        ok: false,
        message: 'Error de validación',
        errors
    });
}

    //Error de Multer (tamaño excedido en los archivos)
    if(err.name === 'MulterError'){
        if(err.code === 'LIMIT_FILE_SIZE'){
        return res.status(400).json({
            ok: false,
            message: 'El archivo excede el tamaño (Máximo: 2MB para fotos / 10MB para audio)'
        });
    }

    if(err.code === 'LIMIT_UNEXPECTED_FILE'){
        return res.status(400).json({
            ok: false,
            message: 'Demasiados archivos o campo no permitido'
        });
    }

    return res.status(400).json({
        ok: false,
        message: `Error de carga: ${err.code}`
    });
}

    //Error de multer (tamaño excedido en las canciones)
    if(err.message && (err.message.includes('Solo se permiten') || err.message.includes('formato'))){
        return res.status(400).json({
            ok: false,
            message: err.message
        });
    }

    //Error genérico
    return res.status(err.status || 500).json({
        ok: false,
        message: err.message || 'Error interno del servidor'
    });
};

module.exports = errorHanlder;