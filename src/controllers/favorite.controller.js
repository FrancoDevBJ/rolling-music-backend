const User = require('../models/User');

const toggleFavorite = async (req, res, next) => {
    try {
        // 'id' aquí es el 'codigo_unico' (ej: "deezer-123" o "local-abc")
        const { id } = req.params; 
        const userId = req.user._id;

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                ok: false,
                message: 'Usuario no encontrado'
            });
        }

        // 🛠️ Verificamos si ya está. Nota: favorites debe ser Array de Strings en el Modelo
        const isFavorite = user.favorites.includes(id);
        
        // Usamos $pull para quitar y $addToSet para agregar sin duplicar
        const updateAction = isFavorite 
            ? { $pull: { favorites: id } } 
            : { $addToSet: { favorites: id } };
        
        const message = isFavorite ? 'Quitada de favoritos' : 'Agregada a favoritos';

        await User.findByIdAndUpdate(userId, updateAction);

        return res.status(200).json({
            ok: true,
            message: `${message} 🎵`,
            isFavorite: !isFavorite // Útil para que el front sepa el estado final
        });

    } catch (error) {
        next(error);
    }
};

const getFavorites = async (req, res, next) => {
    try {
        const userId = req.user._id;

        // 🛠️ IMPORTANTE: Quitamos el .populate()
        // ¿Por qué? Porque Deezer no se puede popular. 
        // El frontend recibirá el array de IDs ["local-1", "deezer-2"] 
        // y el SongsContext se encargará de buscar los datos.
        const user = await User.findById(userId);

        return res.status(200).json({
            ok: true,
            data: user.favorites // Retorna el array de strings
        });
        
    } catch (error) {
        next(error);
    }
}

module.exports = {
    toggleFavorite,
    getFavorites
};