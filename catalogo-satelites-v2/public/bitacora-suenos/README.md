# Bitácora de Sueños

Aplicación web para registrar sueños y organizarlos por fecha, tipo y nivel de claridad.
Proyecto individual desarrollado con Node.js, Express, MongoDB y JWT.

## Estudiante
_(Escribe aquí tu nombre)_

## Descripción del proyecto
Permite a un usuario registrarse, iniciar sesión y administrar de forma privada su propia
bitácora de sueños: crear, consultar, editar y eliminar registros, además de buscar por
título, filtrar por tipo y marcar sueños recurrentes.

## Tecnologías utilizadas
- Node.js
- Express
- MongoDB (local) + Mongoose
- JSON Web Token (jsonwebtoken)
- bcryptjs
- dotenv
- cors
- HTML5, CSS3, JavaScript clásico
- Fetch API + Local Storage

## Dependencias
```
express, mongoose, bcryptjs, jsonwebtoken, dotenv, cors
```
Dependencia de desarrollo: `nodemon`

## Pasos de instalación
1. Clonar o descomprimir el proyecto.
2. Instalar dependencias:
   ```
   npm install
   ```
3. Copiar `.env.example` a `.env` y ajustar los valores:
   ```
   MONGODB_URI=mongodb://127.0.0.1:27017/bitacoraSuenos
   JWT_SECRET=clave_secreta
   PORT=3000
   ```
4. Asegurarse de que MongoDB esté corriendo localmente.

## Dirección de MongoDB
```
mongodb://127.0.0.1:27017/bitacoraSuenos
```

## Forma de ejecutar el proyecto
```
npm run dev
```
o
```
npm start
```
Luego abrir: `http://localhost:3000/registro.html`

## Rutas de la API

### Autenticación
- `POST /api/auth/registro`
- `POST /api/auth/login`
- `GET /api/auth/perfil` (requiere token)

### CRUD de sueños
- `GET /api/suenos` (requiere token)
- `GET /api/suenos/:id` (requiere token)
- `POST /api/suenos` (requiere token)
- `PUT /api/suenos/:id` (requiere token)
- `DELETE /api/suenos/:id` (requiere token)

## Capturas
_(Agregar aquí capturas del sistema)_

## Credenciales de prueba
_(Agregar aquí si corresponde)_
