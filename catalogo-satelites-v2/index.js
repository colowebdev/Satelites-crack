require('dotenv').config();

const express = require('express');
const path = require('path');
const bcrypt = require('bcryptjs'); // BUG ARREGLADO: el original nunca importaba bcrypt
const jwt = require('jsonwebtoken');

const app = express();

app.use(express.json());

const Usuario = require('./usuarioEsquema');
const Satelite = require('./saliteEsquema');
const conectarBD = require('./conexion');

app.use(express.static(path.join(__dirname, 'public')));

async function iniciarServidor() {
  await conectarBD();
}
iniciarServidor();

// Secreto para firmar los tokens. BUG ARREGLADO: en el original estaba
// escrito directo en el código ('SECRETO_SUPER_SEGUR0'); ahora sale del .env
const SECRETO = process.env.SECRETO || 'secreto_de_desarrollo_cambiame';


// =====================================================
// MIDDLEWARE DE AUTENTICACIÓN
// BUG ARREGLADO: en el proyecto original se usaba "verificarToken" en
// varias rutas pero la función nunca se definía en ningún archivo,
// así que el servidor ni siquiera lograba arrancar.
// =====================================================
function verificarToken(req, res, next) {
  const authHeader = req.headers['authorization'];

  if (!authHeader) {
    return res.status(401).json({ error: 'No se proporcionó un token' });
  }

  const partes = authHeader.split(' ');
  if (partes.length !== 2 || partes[0] !== 'Bearer') {
    return res.status(401).json({ error: 'Formato de token inválido' });
  }

  const token = partes[1];

  try {
    const datosDecodificados = jwt.verify(token, SECRETO);
    req.usuarioId = datosDecodificados.id; // igual que en el proyecto de referencia
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Token inválido o expirado' });
  }
}


// =====================================================
// AUTENTICACIÓN
// =====================================================

// Registro de usuario (esta ruta NO existía como página en el proyecto original)
app.post('/api/registro', async (req, res) => {
  try {
    const { nombre, correo, clave } = req.body;

    if (!nombre || !correo || !clave) {
      return res.status(400).json({ error: 'Nombre, correo y clave son obligatorios' });
    }

    const existente = await Usuario.findOne({ correo });
    if (existente) {
      return res.status(409).json({ error: 'Ya existe un usuario con ese correo' });
    }

    // BUG ARREGLADO: el proyecto original guardaba la clave tal cual,
    // sin cifrar. Aquí la ciframos con bcrypt ANTES de guardarla.
    const claveCifrada = await bcrypt.hash(clave, 10);

    const nuevoUsuario = new Usuario({ nombre, correo, clave: claveCifrada });
    const usuarioGuardado = await nuevoUsuario.save();

    const token = jwt.sign({ id: usuarioGuardado._id }, SECRETO, { expiresIn: '1h' });

    res.status(201).json({ token });
  } catch (error) {
    console.error('Error al registrar usuario:', error);
    res.status(400).json({ error: 'Error al registrar usuario' });
  }
});

// Login de usuario (autenticación)
app.post('/api/login', async (req, res) => {
  try {
    const { correo, clave } = req.body;

    const usuario = await Usuario.findOne({ correo });
    if (!usuario) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    // BUG ARREGLADO: bcrypt.compare ahora sí funciona porque bcrypt está importado
    const passwordOk = await bcrypt.compare(clave, usuario.clave);
    if (!passwordOk) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const token = jwt.sign({ id: usuario._id }, SECRETO, { expiresIn: '1h' });

    res.json({ token });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

// Verificar si el token todavía es válido (lo usan las páginas del frontend)
app.post('/api/verificatoken', verificarToken, async (req, res) => {
  res.send('verificado');
});

// Obtener los datos del usuario logueado (para mostrarlos en index.html)
app.get('/api/usuario-logueado', verificarToken, async (req, res) => {
  try {
    const usuario = await Usuario.findById(req.usuarioId).select('-clave');
    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    res.json(usuario);
  } catch (error) {
    console.error('Error obteniendo el usuario:', error);
    res.status(500).json({ error: 'Error al obtener los datos del usuario' });
  }
});


// =====================================================
// CRUD DE SATÉLITES
// Todas las rutas requieren un token válido
// =====================================================

// Obtener los satélites del usuario autenticado
app.get('/api/satelites', verificarToken, async (req, res) => {
  try {
    const satelites = await Satelite.find({ creador: req.usuarioId }).sort({ fechaRegistro: -1 });
    res.json(satelites);
  } catch (error) {
    console.error('Error al obtener satélites:', error);
    res.status(500).json({ error: 'Error al obtener los satélites' });
  }
});

// Obtener un satélite específico del usuario
app.get('/api/satelites/:id', verificarToken, async (req, res) => {
  try {
    const satelite = await Satelite.findOne({ _id: req.params.id, creador: req.usuarioId });
    if (!satelite) {
      return res.status(404).json({ error: 'Satélite no encontrado' });
    }
    res.json(satelite);
  } catch (error) {
    console.error('Error al obtener satélite:', error);
    res.status(400).json({ error: 'Identificador de satélite inválido' });
  }
});

// Crear un nuevo satélite
app.post('/api/satelites', verificarToken, async (req, res) => {
  try {
    const { nombre, pais, agencia, fechaLanzamiento, tipoOrbita, objetivo, masaKg, estado } = req.body;

    const nuevoSatelite = new Satelite({
      creador: req.usuarioId,
      nombre,
      pais,
      agencia,
      fechaLanzamiento,
      tipoOrbita,
      objetivo,
      masaKg,
      estado
    });

    const saliteGuardado = await nuevoSatelite.save();
    res.status(201).json(saliteGuardado);
  } catch (error) {
    console.error('Error al crear satélite:', error);
    res.status(400).json({ error: 'Error al crear el satélite' });
  }
});

// Actualizar un satélite del usuario autenticado
app.put('/api/satelites/:id', verificarToken, async (req, res) => {
  try {
    const { nombre, pais, agencia, fechaLanzamiento, tipoOrbita, objetivo, masaKg, estado } = req.body;

    // BUG ARREGLADO: el proyecto original solo filtraba por _id, así que
    // cualquier usuario logueado podía editar registros ajenos. Aquí también
    // exigimos que el creador coincida con el usuario del token.
    const saliteActualizado = await Satelite.findOneAndUpdate(
      { _id: req.params.id, creador: req.usuarioId },
      { nombre, pais, agencia, fechaLanzamiento, tipoOrbita, objetivo, masaKg, estado },
      { new: true, runValidators: true }
    );

    if (!saliteActualizado) {
      return res.status(404).json({ error: 'Satélite no encontrado' });
    }

    res.json(saliteActualizado);
  } catch (error) {
    console.error('Error al actualizar satélite:', error);
    res.status(400).json({ error: 'Error al actualizar el satélite' });
  }
});

// Eliminar un satélite del usuario autenticado
app.delete('/api/satelites/:id', verificarToken, async (req, res) => {
  try {
    // Mismo arreglo aquí: solo se puede borrar lo propio
    const saliteEliminado = await Satelite.findOneAndDelete({ _id: req.params.id, creador: req.usuarioId });

    if (!saliteEliminado) {
      return res.status(404).json({ error: 'Satélite no encontrado' });
    }

    res.json({ mensaje: 'Satélite eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar satélite:', error);
    res.status(400).json({ error: 'Error al eliminar el satélite' });
  }
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor API escuchando en http://localhost:${PORT}`);
});
