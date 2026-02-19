const Playlist = require("../models/Playlist");
const fs = require('fs');
const path = require('path');
const { cleanUploadsFiles } = require("../utils/fileCleanup");

// Crear una nueva playlist
const createPlaylist = async (req, res, next) => {
    try {
        const { name, description } = req.body;
        // 🛠️ Cambiamos req.user.id por req.user._id (consistencia con el middleware)
        const userId = req.user._id; 

        const newPlaylist = new Playlist({
            name,
            description,
            owner: userId,
            img: req.file ? req.file.filename : "https://i.ibb.co/ZRn36S2x/Cover-Default-Playlist.jpg"
        });

        await newPlaylist.save();

        res.status(201).json({
            ok: true,
            message: 'Lista de Reproducción creada con éxito 📂',
            data: newPlaylist
        });

    } catch (error) {
        cleanUploadsFiles(req);
        next(error);
    }
};

// Agregar una canción (Local o Deezer) a una playlist
const addSongToPlaylist = async (req, res, next) => {
    try {
        const { playlistId, songId } = req.params;
        const userId = req.user._id;

        // Buscamos la playlist y verificamos dueño
        const playlist = await Playlist.findOne({ _id: playlistId, owner: userId });

        if(!playlist){
            return res.status(404).json({ ok: false, message: 'Lista de Reproducción no encontrada' });
        }

        // 🛠️ $addToSet funciona igual de bien con Strings ("deezer-123" o "local-abc")
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

// Obtener todas las playlist del usuario
const getUserPlaylists = async (req, res, next) => {
    try {
        const userId = req.user._id;
        
        // 🛠️ ELIMINAMOS .populate('songs')
        // ¿Por qué? Porque 'songs' ahora es un array de Strings (IDs híbridos).
        // El frontend recibirá ["deezer-1", "local-2"] y las buscará en el Context.
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

        // Buscamos la playlist por ID y dueño
        const playlist = await Playlist.findOne({ _id: id, owner: userId });

        if (!playlist) {
            return res.status(404).json({ 
                ok: false, 
                message: "Lista de Reproducción no encontrada" 
            });
        }

        // 🛠️ IMPORTANTE: Devolvemos 'data' porque AxiosError en tu imagen 
        // indica que el componente espera una respuesta exitosa para continuar.
        res.status(200).json({
            ok: true,
            data: playlist 
        });

    } catch (error) {
        next(error);
    }
};

//Actulizar playlist
const updatePlaylist = async (req, res, next) => {
    try {
        
        const { id } = req.params;
        const userId = req.user._id;
        const { name, description } = req.body;

        // 1. Buscar la playlist y verificar pertenencia
        const playlist = await Playlist.findOne({ _id: id, owner: userId });
        if (!playlist) {
            cleanUploadsFiles(req); // Borrar la nueva si no hay permiso
            return res.status(404).json({ ok: false, message: "Lista de Reproducción no encontrada" });
        }

        // 2. Si subió una imagen nueva, borrar la anterior del disco
        if (req.file) {
            const oldImagePath = path.join(__dirname, `../../uploads/playlists/${playlist.img}`);
            if (playlist.img && playlist.img !== 'https://i.ibb.co/ZRn36S2x/Cover-Default-Playlist.jpg' && fs.existsSync(oldImagePath)) {
                fs.unlinkSync(oldImagePath);
            }
            playlist.img = req.file.filename;
        }

        // 3. Actualizar campos de texto si vienen en el body
        if (name) playlist.name = name;
        if (description) playlist.description = description;

        await playlist.save();

        res.status(200).json({
            ok: true,
            message: "Lista de Reproducción actualizada correctamente 📝",
            data: playlist
        });

    } catch (error) {
        cleanUploadsFiles(req);
        next(error)
    }
}

// Quitar una canción de la playlist
const removeSongFromPlaylist = async (req, res, next) => {
    try {
        const { id, songId } = req.params;
        const userId = req.user._id;

        // Buscamos la playlist y usamos $pull para remover el string del array
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

//Eliminiar playlist
const deletePlaylist = async (req, res, next) => {
    try {
        
        const { id } = req.params;
        const userId = req.user._id;

        //1. Buscar la playlist y verificar que el sea quien intenta borrarla
        const playlist = await Playlist.findOne({ _id: id, owner: userId });

        if (!playlist){
            return res.status(404).json({
                ok: false,
                message: 'Lista de Reproducción no encontrada o no tiene permiso para eliminarla'
            });
        }

        //2. Si la playlist tiene una imagen y no es la imagen por defecto, guardamos la ruta
        const imagePath = playlist.img && playlist.img !== 'https://i.ibb.co/ZRn36S2x/Cover-Default-Playlist.jpg' 
        ? path.join(__dirname, `../../uploads/playlists/${playlist.img}`) : null;

        //3. Eliminar de la base de datos
        await Playlist.findByIdAndDelete(id);

        //4. Eliminar el archivo fisico si existe
        if (imagePath && fs.existsSync(imagePath)){
            fs.unlinkSync(imagePath);
        }

        res.status(200).json({
            ok: true,
            message: 'Lista de Reproducción eliminada correctamente 🗑'
        });

    } catch (error) {
        next(error)
    }
}

module.exports = {
    createPlaylist,
    addSongToPlaylist,
    getUserPlaylists,
    getPlaylistById,
    updatePlaylist,
    removeSongFromPlaylist,
    deletePlaylist
}