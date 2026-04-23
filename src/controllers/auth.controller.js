const User = require('../models/User');
const crypto = require('crypto');
const path = require('path');
const { sendVerificationEmail } = require('../utils/emailService');
const jwt = require('jsonwebtoken');
const cloudinary = require('../config/cloudinary');

// Función auxiliar para generar el token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '1h'
    });
};

// ✅ Helper para eliminar imagen de Cloudinary por URL
const deleteCloudinaryImage = async (imageUrl) => {
    try {
        if (!imageUrl || imageUrl.startsWith('https://www.iconpacks') || imageUrl.startsWith('https://i.ibb')) return;
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

const register = async (req, res, next) => {
    try {
        const { name, surname, email, password } = req.body;

        const newUser = await User.create({
            name,
            surname,
            email,
            password,
            profilePic: req.file ? req.file.path : null  // ✅ URL completa de Cloudinary
        });

        const code = newUser.generateVerificationCode();
        await newUser.save();

        try {
            await sendVerificationEmail(email, name, code);
        } catch (emailError) {
            await User.findByIdAndDelete(newUser._id);
            if (req.file) {
                await deleteCloudinaryImage(req.file.path);
            }
            return res.status(500).json({
                ok: false,
                message: 'Error al enviar el email de verificación. Por favor, intenta nuevamente.'
            });
        }

        return res.status(201).json({
            ok: true,
            message: 'Usuario registrado con exito!!!',
            user: {
                id: newUser._id,
                name: newUser.name,
                email: newUser.email,
                role: newUser.role,
                photo: newUser.profilePic
            }
        });

    } catch (error) {
        next(error);
    }
};

const verifyEmail = async (req, res) => {
    try {
        const { email, code } = req.body;

        const user = await User.findOne({ email });

        if (user.verifiedEmail) {
            return res.status(400).json({
                success: false,
                message: 'El email ya está verificado'
            });
        }

        if (user.verificationCode !== code) {
            return res.status(400).json({
                success: false,
                message: 'El código de verificación es incorrecto'
            });
        }

        if (new Date() > user.codeExpiration) {
            return res.status(400).json({
                success: false,
                message: 'El código de verificación expiró'
            });
        }

        user.verifiedEmail = true;
        user.verificationCode = null;
        user.codeExpiration = null;
        await user.save();

        return res.status(200).json({
            success: true,
            message: 'Email verificado exitosamente, ahora puedes iniciar sesión'
        });

    } catch (error) {
        next(error);
    }
};

const login = async (req, res) => {
    console.log('Cuerpo recibido en el login:', req.body);
    try {
        const { email, password, isGoogleLogin = false, name, surname, photoURL } = req.body;

        let user = await User.findOne({ email });

        if (isGoogleLogin) {
            if (!user) {
                user = new User({
                    name,
                    surname,
                    email,
                    password: crypto.randomBytes(16).toString('hex'),
                    verifiedEmail: true,
                    role: 'user',
                    profilePic: photoURL || null  // ✅ guardar foto de Google
                });
                await user.save();
            }
        } else {
            if (!user) {
                return res.status(401).json({
                    ok: false,
                    message: 'Credenciales inválidas'
                });
            }

            const validPassword = await user.comparePassword(password);
            if (!validPassword) {
                return res.status(401).json({
                    ok: false,
                    message: 'Credenciales inválidas'
                });
            }

            if (!user.verifiedEmail) {
                return res.status(403).json({
                    ok: false,
                    message: 'Debes verificar tu email antes de iniciar sesión'
                });
            }
        }

        const token = generateToken(user._id);

        res.cookie('token', token, {
            httpOnly: true,
            sameSite: 'lax',
            maxAge: 60 * 60 * 1000,
            secure: true
        });

        return res.status(200).json({
            ok: true,
            message: 'Login exitoso',
            token,
            data: {
                id: user._id,
                name: user.name,
                surname: user.surname,
                email: user.email,
                role: user.role,
                profilePic: user.profilePic  // ✅ incluir foto en login
            }
        });

    } catch (error) {
        console.error('DETALLE DEL ERROR:', error);
        return res.status(500).json({
            ok: false,
            message: error.message
        });
    }
};

const logout = async (req, res, next) => {
    try {
        res.clearCookie('token');
        return res.status(200).json({
            ok: true,
            message: 'Logout exitoso ✅'
        });
    } catch (error) {
        next(error);
    }
};

const getUserProfile = async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id)
            .select('-password -verificationCode -codeExpiration');

        return res.status(200).json({
            ok: true,
            message: 'Perfil del usuario obtenido correctamente ✅',
            data: user
        });
    } catch (error) {
        next(error);
    }
};

// ✅ Maneja nombre, apellido y foto — foto va a Cloudinary
const updateProfile = async (req, res, next) => {
    try {
        const { name, surname } = req.body;
        const userId = req.user.id;

        const updateData = { name, surname };

        if (req.file) {
            const user = await User.findById(userId);
            if (user?.profilePic) {
                await deleteCloudinaryImage(user.profilePic);
            }
            updateData.profilePic = req.file.path;  // ✅ URL completa de Cloudinary
        }

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            updateData,
            { new: true, runValidators: true }
        ).select('-password');

        if (!updatedUser) {
            return res.status(404).json({ ok: false, message: 'Usuario no encontrado' });
        }

        return res.status(200).json({
            ok: true,
            message: 'Perfil actualizado correctamente',
            data: updatedUser
        });

    } catch (error) {
        next(error);
    }
};

const updateProfilePhoto = async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                ok: false,
                message: 'No se proporcionó ninguna imagen'
            });
        }

        const user = await User.findById(req.user._id)
            .select('-password -verificationCode -codeExpiration');

        if (!user) {
            return res.status(404).json({
                ok: false,
                message: 'Usuario no encontrado'
            });
        }

        if (user.profilePic) {
            await deleteCloudinaryImage(user.profilePic);
        }

        user.profilePic = req.file.path;  // ✅ URL completa de Cloudinary
        await user.save();

        return res.status(201).json({
            ok: true,
            message: 'Foto de perfil actualizada ✅',
            data: user.profilePic
        });

    } catch (error) {
        next(error);
    }
};

module.exports = {
    register,
    login,
    verifyEmail,
    logout,
    getUserProfile,
    updateProfile,
    updateProfilePhoto
};
