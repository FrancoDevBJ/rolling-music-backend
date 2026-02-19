const express = require("express");
const { validateRegister, validateVerifyEmail, validateLogin } = require("../middlewares/validator");
const { uploadProfile } = require("../config/multer");
const { authLimiter } = require("../middlewares/rateLimiter");
const { register, verifyEmail, login, logout, getUserProfile, updateProfilePhoto, updateProfile } = require("../controllers/auth.controller");
const { auth } = require("../middlewares/auths");

const router = express.Router();

//ENDPOINTS PUBLICOS 
router.post("/register", uploadProfile, validateRegister, register);
router.post("/verify-email", validateVerifyEmail, verifyEmail);
router.post("/login", validateLogin, login);

//ENDPOINTS PRIVADOS
router.post("/logout", auth, logout);
router.get("/profile", auth, getUserProfile );
router.put("/profile/update", auth, updateProfile);
router.put("/profile/photo", auth, uploadProfile, updateProfilePhoto  );

module.exports = router;