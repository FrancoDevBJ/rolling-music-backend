const express = require("express");
const { validateUserId, validateMongoID, validateUpdateRole } = require("../middlewares/validator");
const { auth, verifyAdmin } = require("../middlewares/auths");
const { getAllUsers, getUserById, changeUserRole, deleteUser } = require("../controllers/user.controller");

const router = express.Router();

//TODAS LAS RUTAS REQUIEREN AUTENTICACION Y PERMISOS DE ADMIN 
router.use(auth, verifyAdmin);

//ENDPOINTS PRIVADAS PARA ADMINISTRACION DE USUARIOS
router.get("/", getAllUsers); //PEDIR TODOS LOS USUARIOS
router.get("/:id", validateUserId, getUserById); //PEDIR USUARIOS POR ID
router.patch("/:id/role", validateMongoID, validateUpdateRole, changeUserRole); //EDITAR ROL DE USUARIO
router.delete("/:id", validateMongoID, deleteUser); //ELIMINAR USUARIO

module.exports = router;