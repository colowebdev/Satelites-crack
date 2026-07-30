const mongoose = require("mongoose");

const usuarioSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: true,
    trim: true
  },
  correo: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  clave: {
    type: String,
    required: true
  },
  rol: {
    type: String,
    default: "usuario"
  },
  fechaRegistro: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Usuario", usuarioSchema);
