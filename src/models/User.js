//ESTE VA A SER EL MODELO DE USUARIOS

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({

    name:{
        type: String,
        required: true
    },
    surname:{
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    profilePic: {
        type: String,
        default: "https://www.iconpacks.net/icons/2/free-user-icon-3296-thumb.png",

    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['user', 'admin', 'superadmin'],
        default: 'user'
    },
    favorites: [{
        type: String, // Guardamos el codigo_unico para identificar el origen
        required: false
    }],
    verifiedEmail:{
        type: Boolean,
        default: false
    },
    verificationCode:{
        type: String,
        default: null,
    },
    codeExpiration:{
        type: Date,
        default: null
    }

},{
    timestamps: true
});



userSchema.pre('save', async function () {
    if (!this.isModified('password')) return;

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt)
})


userSchema.methods.comparePassword = async function (userPassword) {

    return await bcrypt.compare(userPassword, this.password)
}



userSchema.methods.generateVerificationCode = function() {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    this.verificationCode = code;
    this.codeExpiration = new Date(Date.now() + 20 * 60 *1000); 
    return code;
}



module.exports = mongoose.model('User', userSchema);