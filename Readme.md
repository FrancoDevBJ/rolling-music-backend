# 🚀 RollingMusic API

RollingMusic es una plataforma robusta de streaming de música desarrollada con el stack MERN (enfocada en el Backend). Permite la gestión integral de usuarios, canciones con archivos multimedia, sistemas de favoritos y playlists personalizadas.

## 🛠️ Tecnologías y Características
* **Entorno:** Node.js con Express.
* **Base de Datos:** MongoDB & Mongoose.
* **Autenticación:** JWT (JSON Web Tokens) y cookies de seguridad `httpOnly`.
* **Multimedia:** Procesamiento de archivos físicos (Audio/Imágenes) con Multer.
* **Seguridad:** Encriptación de contraseñas (Bcrypt), validación de esquemas, Rate Limiting y control de acceso por roles (Admin/User).

---

## ⚙️ Instalación y Configuración Local

Sigue estos pasos para poner en marcha el servidor:

### 1. Requisitos Previos
* **Node.js** (v16+)
* **MongoDB** (Local o Atlas)

### 2. Clonar e Instalar
```bash
git clone [https://github.com/tu-usuario/rolling-music-backend.git](https://github.com/tu-usuario/rolling-music-backend.git)
cd rolling-music-backend
npm install
```

### 3. Variables de Entorno
Crea un archivo .env en la raíz con lo siguiente:

```
PORT=3000
FRONTEND_URL=tu_url_de_frontend
MONGODB_URI=tu_url_de_mongodb
JWT_SECRET=tu_clave_secreta_para_tokens
EMAIL_USER=tu_correo@gmail.com
EMAIL_PASS=tu_password_de_aplicacion_google
ADMIN_EMAIL=tu_admin@gmail.com
ADMIN_PASSWORD=tu_contraseña_admin
ADMIN_NAME=nombre_de_administrador
ADMIN_SURNAME=apellido_de_administrador
ADMIN_ROLE=valor_del_rol
SUPER_ADMIN_ROLE=valor_del_rol
USER_ROLE=valor_del_rol
```

### 4. Ejecución

#### Modo desarrollo
```bash
npm run dev
```

#### Modo producción
```bash
npm start
```
El servidor iniciará en http://localhost:3000. Se ejecutará automáticamente un script para garantizar la existencia de un SuperAdmin.

## 📂 Gestión de Archivos (Multimedia)

La API organiza automáticamente los archivos en subcarpetas dentro de ```/uploads:```

Perfiles: ```"/uploads/profiles"``` (Key: ```profilePic```).

Portadas: ```"/uploads/covers"``` (Key: ```cover```).

Audio: ```"/uploads/songs"``` (Key: ```audio```).

Playlists: ```"/uploads/playlists"``` (Key: ```img```).

Nota: El sistema incluye limpieza automática de archivos físicos si una operación de base de datos falla o si un registro es eliminado.

## 🚀 API Reference

### 🔐 Autenticación y Usuarios (/auth)

```
Método   |   Endpoint          |   Descripción                                         |   Auth
```
```
POST     | "/register"         |   Registro con foto (profilePic).                     |   No
POST     | "/verify-email"     |   Verifica cuenta con código de mail.                 |   No
POST     | "/login"            |   Login y generación de Cookie/Token.                 |   No
GET      | "/profile"          |   Obtiene datos del perfil logueado.                  |   Sí
PUT      | "/profile/photo"    |   Actualiza foto de perfil (borra la anterior).       |   Sí
```
### 🎵 Canciones (/song)
```
Método   |   Endpoint    |   Descripción                                    |   Auth
```
```
GET      |   "/"         |   Lista todas las canciones.                     |   No
GET      |   "/search"   |   Buscador (Case-insensitive) + Paginación.      |   No
POST     |   "/"         |   Crea canción (Audio + Cover).                  |   Admin
PUT      |   "/:id"      |   Edita datos o archivos de la canción.          |   Admin
DELETE   |   "/:id"      |   Elimina registro y archivos físicos.           |   Admin
```

### 📂 Playlists (/playlists)

```
Método   |   Endpoint                     |   Descripción                                     |   Auth
```
```
POST     |   "/"                          |   Crea lista con imagen (img).                    |   Sí
GET      |   "/"                          |   Obtiene las listas del usuario.                 |   Sí
PATCH    |   "/add/:playlistId/:songId"   |   Vincula canción a la playlist.                  |   Sí
DELETE   |   "/:id"                       |   Elimina lista e imagen asociada.                |   Sí
```

### ❤️ Favoritos (/favorites)

- GET ```"/"```: Lista de canciones favoritas del usuario.

- PATCH ```"/:id"```: Agrega o quita una canción de la lista (Toggle).

### 🛡️ Administración (/users)

- GET ```"/"```: Lista de todos los usuarios (Admin Only).

- PATCH ```"/:id/role"```: Cambia el rol de un usuario.

- DELETE ```"/:id"```: Elimina una cuenta de forma permanente.

### ⚠️ Respuestas del Servidor

- ```200/201```: Operación exitosa.

- ```400```: Error de validación o ID de Mongo inválido.

- ```401/403```: Problemas de token o falta de permisos (Admin/Email verificado).

- ```404```: Recurso no encontrado.

- ```500```: Error interno (Middleware de errores centralizado).