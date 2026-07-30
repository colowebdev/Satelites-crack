const { Schema, model } = require('mongoose');

// Definir el esquema de Usuario (usa los mismos nombres de campo que pide la tarea)
const usuarioSchema = new Schema({
  nombre:        { type: String, required: true },                 // Nombre del usuario
  correo:        { type: String, required: true, unique: true },   // Correo único y obligatorio
  clave:         { type: String, required: true },                 // Aquí se guarda el hash, nunca el texto plano
  fechaRegistro: { type: Date, default: Date.now }                 // Fecha de registro automática
});

// Crear el modelo Usuario basado en el esquema
const Usuario = model('Usuario', usuarioSchema);

// BUG ARREGLADO: en el proyecto original faltaba esta línea, por eso
// al hacer require('./usuarioEsquema') en index.js llegaba "undefined"
// y cualquier ruta que usara Usuario se caía.
module.exports = Usuario;
