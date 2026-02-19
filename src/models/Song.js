const mongoose = require('mongoose');


const songSchema = new mongoose.Schema({

    title:{
        type: String,
        required: true
    },
    artist:{
        type: String,
        required: true
    },
    genre: {
        type: String,
        required: true,
        enum: ['rock','pop', 'cumbia', 'bachata', 'trap', 'hip-hop', 'baladas', 'otro']
    },
    audio: {
        type: String,
        required: true
    },
    cover: {
        type: String,
        required: true,
        default: "https://rolling-music.vercel.app/assets/Logo-CK57mjsi.png"
    }

},{
    timestamps: true
});


module.exports = mongoose.model('Song', songSchema);