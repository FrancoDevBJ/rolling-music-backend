const mongoose = require('mongoose');

const playlistSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'El nombre de la playlist es obligatorio'],
        trim: true
    },
    description: {
        type: String,
        trim: true,
        default: ''
    },
    img: {
        type: String,
        default: 'https://i.ibb.co/ZRn36S2x/Cover-Default-Playlist.jpg'
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    // 🛠️ CORRECCIÓN AQUÍ:
    // Cambiamos de ObjectId a String para soportar IDs híbridos (local- y deezer-)
    songs: [{
        type: String
    }]
}, {
    timestamps: true
});

const Playlist = mongoose.model('Playlist', playlistSchema);
module.exports = Playlist;