const express = require('express');
const { auth } = require('../middlewares/auths');
const { 
    createPlaylist, 
    getUserPlaylists, 
    addSongToPlaylist, 
    deletePlaylist, 
    updatePlaylist, 
    getPlaylistById,
    removeSongFromPlaylist // 🛠️ Importamos la función nueva
} = require('../controllers/playlist.controller');
const { uploadPlayListImg } = require('../config/multer');
const { validateMongoID } = require('../middlewares/validator');

const router = express.Router();

router.post("/", auth, uploadPlayListImg, createPlaylist);
router.get("/", auth, getUserPlaylists);
router.get("/:id", auth, validateMongoID, getPlaylistById);
router.patch("/add/:playlistId/:songId", auth, addSongToPlaylist);
router.put("/:id", auth, validateMongoID, uploadPlayListImg, updatePlaylist);
router.delete("/:id", auth, validateMongoID, deletePlaylist);
router.delete("/:id/songs/:songId", auth, validateMongoID, removeSongFromPlaylist);

module.exports = router;