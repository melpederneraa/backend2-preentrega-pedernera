# Backend 2 - Preentrega Final

## Alumna
Melina Pedernera

## Descripción del proyecto

Proyecto backend desarrollado con Node.js y Express para un ecommerce, implementando autenticación mediante JWT y Passport.

El sistema permite:

- Registro de usuarios
- Login de usuarios
- Autenticación mediante JWT
- Protección de rutas
- Manejo de cookies
- Validación de usuarios autenticados

## Tecnologías utilizadas

- Node.js
- Express.js
- MongoDB Atlas
- Mongoose
- Passport
- Passport-JWT
- bcrypt
- JWT
- Handlebars
- Socket.io

## Estructura del proyecto

```txt
src/
├── config/
├── models/
├── routes/
├── utils/
├── public/
├── views/
└── app.js
```

## Variables de entorno

Crear un archivo `.env` en la raíz del proyecto:

```env
MONGO_URI=
JWT_SECRET=
PORT=8080
```

## Instalación

Instalar dependencias:

```bash
npm install
```

Ejecutar el proyecto:

```bash
npm run dev
```

## Endpoints principales

### Register

POST `/api/sessions/register`

### Login

POST `/api/sessions/login`

### Current

GET `/api/sessions/current`

### Logout

POST `/api/sessions/logout`

## Funcionalidades implementadas

- Hash de contraseñas con bcrypt
- JWT con expiración
- Cookies httpOnly
- Passport JWT Strategy
- Middleware de autenticación
- Validación de usuarios duplicados
- MongoDB Atlas como base de datos

## Autor

Melina Pedernera
Coderhouse Backend 2
