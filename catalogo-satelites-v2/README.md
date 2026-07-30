# Catálogo de Satélites

Estudiante: Fallix
CTP Don Bosco — 11°

## Descripción
Aplicación web para que cada usuario registre y administre su propio catálogo
personal de satélites artificiales. Requiere registro/login con JWT, y cada
usuario solo puede ver, editar y eliminar sus propios registros.

Este proyecto sigue la MISMA estructura plana (todo en `index.js`, sin
carpetas de `controllers/routes/middleware`) que usamos para aprender las
tecnologías, pero con los bugs de ese proyecto corregidos.

## Tecnologías
Node.js, Express, MongoDB (local), Mongoose, JWT, bcryptjs, dotenv, HTML5,
CSS3, JavaScript clásico, Fetch API, Local Storage.

## Instalación

1. `npm install`
2. Tener MongoDB corriendo localmente (`mongod`)
3. `cp .env.example .env` y completar los valores
4. `npm start`
5. Abrir `http://localhost:3000/registro.html`

## Rutas de la API

- `POST /api/registro` — { nombre, correo, clave }
- `POST /api/login` — { correo, clave }
- `POST /api/verificatoken` — requiere token
- `GET /api/usuario-logueado` — requiere token
- `GET /api/satelites` — requiere token
- `GET /api/satelites/:id` — requiere token
- `POST /api/satelites` — requiere token
- `PUT /api/satelites/:id` — requiere token
- `DELETE /api/satelites/:id` — requiere token

## Bugs corregidos respecto al proyecto de aprendizaje original

1. **`usuarioEsquema.js` sin `module.exports`** → al importar el modelo
   llegaba `undefined` y cualquier ruta con `Usuario` se caía.
2. **`verificarToken` nunca estaba definido** → el servidor no arrancaba
   (`ReferenceError`). Ahora está definido en `index.js`.
3. **`bcrypt` no estaba importado** en la ruta de login, aunque se usaba
   `bcrypt.compare`. Ahora se importa `bcryptjs` correctamente.
4. **Las contraseñas se guardaban en texto plano** al registrarse. Ahora
   se cifran con `bcrypt.hash` antes de guardarlas.
5. **El secreto del JWT estaba escrito directo en el código.** Ahora sale
   de la variable de entorno `JWT_SECRET` (vía `.env`, con `dotenv`).
6. **Faltaba control de dueño al editar/eliminar.** Ahora todas las rutas
   de satélites filtran por `{ _id, creador: req.usuarioId }`, así nadie
   puede modificar registros ajenos.
7. **No existía página de registro** en el frontend, solo login. Se agregó
   `registro.html`.

## Credenciales de prueba
Se generan al registrarte por primera vez desde `registro.html`.
