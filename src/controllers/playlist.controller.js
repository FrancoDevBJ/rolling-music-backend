const Playlist = require("../models/Playlist");
const cloudinary = require('../config/cloudinary');

// ✅ Helper para eliminar imagen de Cloudinary por URL
const deleteCloudinaryImage = async (imageUrl) => {
    try {
        if (!imageUrl || imageUrl.startsWith('https://i.ibb')) return;
        const parts = imageUrl.split('/');
        const filenameWithExt = parts[parts.length - 1];
        const filename = filenameWithExt.split('.')[0];
        const folder = parts[parts.length - 2];
        const public_id = `rollingMusic/${folder}/${filename}`;
        await cloudinary.uploader.destroy(public_id);
    } catch (err) {
        console.error('Error al eliminar imagen de Cloudinary:', err);
    }
};

const DEFAULT_PLAYLIST_IMG = 'https://i.ibb.co/ZRn36S2x/Cover-Default-Playlist.jpg';

// Crear una nueva playlist
const createPlaylist = async (req, res, next) => {
    try {
        const { name, description } = req.body;
        const userId = req.user._id;

        const newPlaylist = new Playlist({
            name,
            description,
            owner: userId,
            // ✅ Cloudinary devuelve URL completa en req.file.path
            img: req.file ? req.file.path : DEFAULT_PLAYLIST_IMG
        });

        await newPlaylist.save();

        res.status(201).json({
            ok: true,
            message: 'Lista de Reproducción creada con éxito 📂',
            data: newPlaylist
        });

    } catch (error) {
        next(error);
    }
};

// Agregar una canción a una playlist
const addSongToPlaylist = async (req, res, next) => {
    try {
        const { playlistId, songId } = req.params;
        const userId = req.user._id;

        const playlist = await Playlist.findOne({ _id: playlistId, owner: userId });

        if (!playlist) {
            return res.status(404).json({ ok: false, message: 'Lista de Reproducción no encontrada' });
        }

        await Playlist.findByIdAndUpdate(playlistId, {
            $addToSet: { songs: songId }
        });

        res.status(200).json({
            ok: true,
            message: 'Canción añadida a la Lista de Reproducción'
        });

    } catch (error) {
        next(error);
    }
};

// Obtener todas las playlists del usuario
const getUserPlaylists = async (req, res, next) => {
    try {
        const userId = req.user._id;
        const playlists = await Playlist.find({ owner: userId });

        res.status(200).json({
            ok: true,
            data: playlists
        });

    } catch (error) {
        next(error);
    }
};

const getPlaylistById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const userId = req.user._id;

        const playlist = await Playlist.findOne({ _id: id, owner: userId });

        if (!playlist) {
            return res.status(404).json({
                ok: false,
                message: "Lista de Reproducción no encontrada"
            });
        }

        res.status(200).json({
            ok: true,
            data: playlist
        });

    } catch (error) {
        next(error);
    }
};

// Actualizar playlist
const updatePlaylist = async (req, res, next) => {
    try {
        const { id } = req.params;
        const userId = req.user._id;
        const { name, description } = req.body;

        const playlist = await Playlist.findOne({ _id: id, owner: userId });
        if (!playlist) {
            return res.status(404).json({ ok: false, message: "Lista de Reproducción no encontrada" });
        }

        // ✅ Si viene imagen nueva, eliminar la anterior de Cloudinary
        if (req.file) {
            await deleteCloudinaryImage(playlist.img);
            playlist.img = req.file.path;  // URL completa de Cloudinary
        }

        if (name) playlist.name = name;
        if (description) playlist.description = description;

        await playlist.save();

        res.status(200).json({
            ok: true,
            message: "Lista de Reproducción actualizada correctamente 📝",
            data: playlist
        });

    } catch (error) {
        next(error);
    }
};

// Quitar una canción de la playlist
const removeSongFromPlaylist = async (req, res, next) => {
    try {
        const { id, songId } = req.params;
        const userId = req.user._id;

        const playlist = await Playlist.findOneAndUpdate(
            { _id: id, owner: userId },
            { $pull: { songs: songId } },
            { new: true }
        );

        if (!playlist) {
            return res.status(404).json({ ok: false, message: "No se pudo encontrar la lista" });
        }

        res.status(200).json({
            ok: true,
            message: "Canción quitada de la lista 🗑️",
            data: playlist
        });
    } catch (error) {
        next(error);
    }
};

// Eliminar playlist
const deletePlaylist = async (req, res, next) => {
    try {
        const { id } = req.params;
        const userId = req.user._id;

        const playlist = await Playlist.findOne({ _id: id, owner: userId });

        if (!playlist) {
            return res.status(404).json({
                ok: false,
                message: 'Lista de Reproducción no encontrada o no tiene permiso para eliminarla'
            });
        }

        // ✅ Eliminar imagen de Cloudinary si no es la por defecto
        await deleteCloudinaryImage(playlist.img);

        await Playlist.findByIdAndDelete(id);

        res.status(200).json({
            ok: true,
            message: 'Lista de Reproducción eliminada correctamente 🗑'
        });

    } catch (error) {
        next(error);
    }
};

module.exports = {
    createPlaylist,
    addSongToPlaylist,
    getUserPlaylists,
    getPlaylistById,
    updatePlaylist,
    removeSongFromPlaylist,
    deletePlaylist
};
