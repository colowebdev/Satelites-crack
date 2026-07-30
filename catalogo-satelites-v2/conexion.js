const mongoose = require('mongoose');

// BUG ARREGLADO: en el proyecto original la URI no tenía nombre de base
// de datos, entonces Mongo usaba la base "test" por defecto sin que
// te dieras cuenta. Aquí la traemos desde el .env y le damos un nombre claro.
const uri = process.env.mongo || 'mongodb://127.0.0.1:27017/catalogoSatelites';

async function conectarBD() {
  try {
    await mongoose.connect(uri);
    console.log('Conectado correctamente a MongoDB con Mongoose');
  } catch (error) {
    console.log('Error conectando con Mongoose:', error.message);
  }
}

module.exports = conectarBD;
