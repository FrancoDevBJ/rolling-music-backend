const express = require("express");
const { validateSong, validateUpdateSong, validateMongoID } = require("../middlewares/validator");
const { getAllSongs, searchSong, getSongById, createSong, updateSong, deleteSong } = require("../controllers/song.controller");
const { auth, verifyAdmin } = require("../middlewares/auths");
const { uploadSongFields } = require("../config/multer");

const router = express.Router();

//ENDPOINTS PUBLICAS
router.get("/search", searchSong); //buscar canciones
router.get("/", getAllSongs); //para pedir todas las canciones
router.get("/:id", getSongById); //pedir cancion mediante su id

//ENDPOINTS PRIVADOS
router.post(
    "/",
    auth,
    verifyAdmin,
    uploadSongFields,
    validateSong,
    createSong
);  //RUTA PARA CREAR CANCIONES

router.put(
    "/:id",
    auth,
    verifyAdmin,
    validateMongoID,
    uploadSongFields,
    validateUpdateSong,
    updateSong
); //RUTA PARA EDITAR CANCION

router.delete(
    "/:id",
    auth,
    verifyAdmin,
    validateMongoID,
    deleteSong
); //RUTA PARA ELIMINAR CANCION 

module.exports = router;