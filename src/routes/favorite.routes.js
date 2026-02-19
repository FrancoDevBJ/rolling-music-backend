const express = require("express");
const { getFavorites, toggleFavorite } = require("../controllers/favorite.controller");
const { auth } = require("../middlewares/auths");
const { validateMongoID } = require("../middlewares/validator");

const router = express.Router();

//Obtener la lista del usuario logueado
router.get("/", auth, getFavorites);

//Agregar o quitar una cancion de favoritos
router.patch("/:id", auth, toggleFavorite);

module.exports = router;