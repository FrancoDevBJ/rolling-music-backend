const fs = require('fs');
const path = require ('path');

//Eliminar un archivo
const deleteOneFile = (filePath) => {
    try {
        if(fs.existsSync(filePath)){
            fs.unlinkSync(filePath);
            console.log(`🗑 Archivo eliminado: ${filePath}`)
        }
        
    } catch (error) {
        console.error(`❌ Error al eliminar el archivo ${filePath}: ${error.message}`)
    }
}

//Eliminar multiples archivos
const deleteFiles = (filePaths) => {
    if(!Array.isArray(filePaths)){
        filePaths = [filePaths]
    }

    filePaths.forEach(filePath => {
        if(filePath){
            deleteOneFile(filePath);
        }
    })
}

//Eliminar archivos subidos por multer (req.file o req.files)
const cleanUploadsFiles = (req) => {
    if(req.file){
        deleteOneFile(req.file.path);
    }

    if(req.files){
        if (Array.isArray(req.files)) {
            req.files.forEach(file => deleteOneFile(file.path));
        }

        else {
            Object.values(req.files).forEach(fileArray => {
                fileArray.forEach(file => deleteOneFile(file.path));
            });
        }
    }
};

//obtener ruta completa del archivo desde nombre
const getCompleteRoute = (fileName, type) => {
    return path.join(__dirname, `../../uploads/${type}`, fileName)
}

module.exports = {
    deleteOneFile,
    cleanUploadsFiles,
    getCompleteRoute,
    deleteFiles

}