const { Schema, model } = require('mongoose');

// Esquema de Satélite, según el enunciado del proyecto 9
const saliteSchema = new Schema({
  creador:          { type: Schema.Types.ObjectId, ref: 'Usuario', required: true }, // dueño del registro
  nombre:           { type: String, required: true },
  pais:             { type: String, required: true },
  agencia:          { type: String, required: true },
  fechaLanzamiento: { type: Date, required: true },
  tipoOrbita:       { type: String, required: true }, // LEO, MEO, GEO, Polar...
  objetivo:         { type: String, required: true }, // comunicaciones, observación, científico...
  masaKg:           { type: Number, required: true },
  estado: {
    type: String,
    enum: ['Activo', 'Inactivo', 'Reentrada', 'Desconocido'],
    default: 'Activo'
  },
  fechaRegistro: { type: Date, default: Date.now }
});

const Satelite = model('Satelite', saliteSchema);

module.exports = Satelite;
