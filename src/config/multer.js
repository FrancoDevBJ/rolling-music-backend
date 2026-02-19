const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

//Configuración de almacenamiento para foto de perfil
const profileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = path.join(__dirname, '../../uploads/profiles');
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true})
        }
        cb(null, uploadPath)
    },

    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-profile-' + crypto.randomUUID() + path.extname(file.originalname);
        cb(null, uniqueSuffix)
    }
});

//Filtro de archivos
const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLocaleLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype){
        cb(null, true);
    } else {
        cb(new Error('Solo se permiten imagenes (jpg, jpeg, png, webp)'))
    }
}

//Configuración para foto de perfil (1 archivo, max 2MB)
const uploadProfile = multer({
    storage: profileStorage,
    limits: {fileSize: 2 * 1024 * 1024}, //2MB
    fileFilter: fileFilter
    
}).single('profilePic');



const universalStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        let folder = 'songs'; //Carpeta creada por defecto
        if (file.fieldname === 'cover') folder = 'covers';
        if (file.fieldname === 'img') folder = 'playlists';

        const uploadPath = path.join(__dirname, `../../uploads/${folder}`);
        if (!fs.existsSync(uploadPath)){
            fs.mkdirSync(uploadPath, {recursive: true});
        }
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        let prefix = 'audio';
        if (file.fieldname === 'cover') prefix = 'cover';
        if (file.fieldname === 'img') prefix = 'img';

        const uniqueSuffix = Date.now() + `-${prefix}-` + crypto.randomUUID() + path.extname(file.originalname);
        cb(null, uniqueSuffix);
    }
});

//Filtro que acepte a ambos
const multerFilter = (req, file, cb) => {
    // Para Cover o Img (Imágenes)
    if(file.fieldname === 'cover' || file.fieldname === 'img') {
        const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
        
        if (allowedMimeTypes.includes(file.mimetype)) {
            return cb(null, true);
        }
        return cb(new Error('La portada debe ser una imagen válida (jpg, png, webp)'), false);
    }

    // Para Audio
    if (file.fieldname === 'audio'){
        const allowedAudioTypes = [
            'audio/mpeg', // mp3
            'audio/wav',
            'audio/ogg',
            'audio/mp3'   // Agregamos este por si acaso
        ];

        if (allowedAudioTypes.includes(file.mimetype)) {
            return cb(null, true);
        }
        return cb(new Error('El archivo de audio debe ser mp3, wav u ogg'), false);
    }

    cb(new Error('Campo no permitido'), false);
};

//Exportar el nuevo middleware
const uploadSongAndCover = multer({
    storage: universalStorage,
    limits: {fileSize: 15 * 1024 * 1024}, //Se va a 15MB para que entren los dos
    fileFilter: multerFilter
});

const uploadPlayListImg = multer({
    storage: universalStorage,
    limits: { fileSize: 2 * 1024 * 1024 }, //2MB máximo
    fileFilter: multerFilter
}).single('img');

const uploadSongFields = uploadSongAndCover.fields([
    {name: 'cover', maxCount: 1},
    {name: 'audio', maxCount: 1}
]);

module.exports = {
    uploadProfile,
    uploadSongFields,
    uploadPlayListImg
}