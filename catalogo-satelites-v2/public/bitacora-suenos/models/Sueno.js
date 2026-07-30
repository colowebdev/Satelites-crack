const mongoose = require("mongoose");

const suenoSchema = new mongoose.Schema({
  titulo: String,
  fecha: Date,
  tipo: String,
  descripcion: String,
  emocionPrincipal: String,
  personaPrincipal: String,
  lugarPrincipal: String,
  nivelClaridad: Number,
  recurrente: Boolean
});

module.exports = mongoose.model("Sueno", suenoSchema);
