const express = require("express");
require("dotenv").config();
const morgan = require("morgan");
const path = require('path');
const cookieParser = require("cookie-parser");
const cors = require("cors");

//IMPORTAMOS 
const authRoutes = require("./routes/auth.routes");
const songRoutes = require("./routes/song.routes");
const userRoutes = require("./routes/user.routes");
const connectDB = require("./config/database");
const createSuperAdmin = require("./utils/createSuperAdmin");
const errorHanlder = require("./middlewares/errorHandler");
const { globalLimiter } = require("./middlewares/rateLimiter");
const favoritesRoutes = require("./routes/favorite.routes");
const playlistRoutes = require("./routes/playlist.routes");

const app = express();

connectDB()

createSuperAdmin();

app.use(cors({
    origin: [process.env.FRONTEND_URL, "http://localhost:5173"],
    credentials: true
}));
app.use(morgan("dev"));
app.use(globalLimiter);
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({extended: true}));

app.use('/uploads', express.static(path.join(__dirname, '../uploads'), {
    setHeaders: (res, path) => {
        // 🛠️ 1. Permitir que el frontend (Vite) lea el archivo
        res.set('Access-Control-Allow-Origin', 'https://rolling-music-frontend.vercel.app');
        
        // 🛠️ 2. FORZAR REPRODUCCIÓN (Esto mata la descarga)
        // 'inline' le dice al navegador que lo abra en el reproductor interno
        res.set('Content-Disposition', 'inline');
        
        // 🛠️ 3. Asegurar el tipo de archivo para audios
        if (path.endsWith('.mp3')) {
            res.set('Content-Type', 'audio/mpeg');
        }
    }
}));

//ENRUTADORES
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/song", songRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/favorites", favoritesRoutes);
app.use("/api/v1/playlists", playlistRoutes);

//ACA HAY QUE LLAMAR AL MIDDELWARE MANEJADOR DE ERRORES
app.use(errorHanlder);

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Servidor corriendo en ${port}`)
})