const multer = require('multer');
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");

// ─── Filtro de imágenes ────────────────────────────────────────────────────
const imageFilter = (req, file, cb) => {
    const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Solo se permiten imágenes (jpg, jpeg, png, webp)'), false);
    }
};

// ─── Cloudinary Storage: Fotos de perfil ──────────────────────────────────
const profileStorage = new CloudinaryStorage({
    cloudinary,
    params: async (req, file) => ({
        folder: 'rollingMusic/profiles',
        resource_type: 'image',
        public_id: `${Date.now()}-profile`,
        transformation: [{ width: 400, height: 400, crop: 'fill', gravity: 'face' }]
    })
});

// ✅ uploadProfile: sube foto de perfil a Cloudinary
const uploadProfile = multer({
    storage: profileStorage,
    limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
    fileFilter: imageFilter
}).single('profilePic');

// ─── Cloudinary Storage: Imágenes de playlist ─────────────────────────────
const playlistStorage = new CloudinaryStorage({
    cloudinary,
    params: async (req, file) => ({
        folder: 'rollingMusic/playlists',
        resource_type: 'image',
        public_id: `${Date.now()}-playlist`,
        transformation: [{ width: 500, height: 500, crop: 'fill' }]
    })
});

// ✅ uploadPlayListImg: sube imagen de playlist a Cloudinary
const uploadPlayListImg = multer({
    storage: playlistStorage,
    limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
    fileFilter: imageFilter
}).single('img');

// ─── Cloudinary Storage: Canciones y covers ───────────────────────────────
const songStorage = new CloudinaryStorage({
    cloudinary,
    params: async (req, file) => {
        let folder = "songs";
        let resource_type = "auto";

        if (file.fieldname === "cover") {
            folder = "covers";
            resource_type = "image";
        }

        if (file.fieldname === "audio") {
            folder = "songs";
            resource_type = "video"; // Cloudinary trata audio como video
        }

        return {
            folder: `rollingMusic/${folder}`,
            resource_type,
            public_id: `${Date.now()}-${file.originalname}`
        };
    }
});

// ─── Filtro que acepta imágenes y audio ───────────────────────────────────
const multerFilter = (req, file, cb) => {
    if (file.fieldname === 'cover' || file.fieldname === 'img') {
        const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
        if (allowedMimeTypes.includes(file.mimetype)) {
            return cb(null, true);
        }
        return cb(new Error('La portada debe ser una imagen válida (jpg, png, webp)'), false);
    }

    if (file.fieldname === 'audio') {
        const allowedAudioTypes = ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/mp3'];
        if (allowedAudioTypes.includes(file.mimetype)) {
            return cb(null, true);
        }
        return cb(new Error('El archivo de audio debe ser mp3, wav u ogg'), false);
    }

    cb(new Error('Campo no permitido'), false);
};

const uploadSongAndCover = multer({
    storage: songStorage,
    limits: { fileSize: 15 * 1024 * 1024 }, // 15MB
    fileFilter: multerFilter
});

const uploadSongFields = uploadSongAndCover.fields([
    { name: 'cover', maxCount: 1 },
    { name: 'audio', maxCount: 1 }
]);

module.exports = {
    uploadProfile,
    uploadSongFields,
    uploadPlayListImg
};
