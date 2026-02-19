const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { deleteOneFile, getCompleteRoute } = require('../utils/fileCleanup');

const getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password');

        if(!users.length === 0){
            return res.status(404).json({
                ok: false,
                message: 'No se encontraron usuarios en la base de datos 🙁'
            })
        }

        return res.status(200).json({
            ok: true,
            message: 'Usuarios obtenidos correctamente',
            data:{
                length: users.length,
                users: users
            }
        })
        
    } catch (error) {
        console.error(error)
        return res.status(500).json({
            ok: false,
            message: error.message
        })
    }
}

const getUserById = async (req, res, next) => {

    try {
        const user = await User.findById(req.params.id).select('-password --verificationCode -codeExpiration')

        if(!user){
            return res.status(404).json({
                ok: false,
                message: 'Usuario no econtrado'
            })
        }

        return res.status(200).json({
            ok: true,
            message: 'Usuario encontrado',
            data: user
        })
        
    } catch (error) {
        next(error)
    }
}

const changeUserRole = async (req, res) => {
    try {
        const {id} = req.params;
        const {role} = req.body;

        const updateUser = await User.findByIdAndUpdate(
            id,
            {role},
            {new: true, runValidators: true}
        ).select("-password");

        return res.status(200).json({
            ok: true,
            message: 'El rol del usuario se modificó correctamente ✅',
            user:{
                id: updateUser._id,
                email: updateUser.email,
                name: updateUser.name,
                role: updateUser.role
            }
        })
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            ok: false,
            message: error.message})
    }
}

const deleteUser = async (req, res) => {
    try {
        const {id} = req.params;

        const user = await User.findById(id);

        if(user.role === process.env.SUPER_ADMIN_ROLE){
            return res.status(403).json({
                ok: false,
                message: 'No se puede eliminar este usuario.'
            })
        }

        if(user.profilePic){
            const photoPath = getCompleteRoute(user.profilePic, 'profiles');
            deleteOneFile(photoPath)
        }

        const deleteUser = await User.findByIdAndDelete(id).select('-password');
        
        return res.status(200).json({
            ok: true,
            message: 'Usuario eliminado correctamente ✅',
            user: deleteUser
        })
        
    } catch (error) {
        console.log(error)
        return res.status(500).json(error.message)
    }
}


module.exports = {
    getAllUsers,
    changeUserRole,
    deleteUser,
    getUserById
}