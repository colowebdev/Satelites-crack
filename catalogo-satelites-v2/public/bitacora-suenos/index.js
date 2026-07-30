require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const path = require("path");

const Usuario = require("./models/Usuario");
const Sueno = require("./models/Sueno");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

mongoose
  .connect(process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/bitacoraSuenos")
  .then(() => {
    console.log("MongoDB conectado correctamente");
  })
  .catch((error) => {
    console.error("Error al conectar con MongoDB:", error);
  });

function verificarToken(req, res, next) {
  const encabezado = req.headers.authorization;
  if (!encabezado) {
    return res.status(401).json({
      mensaje: "Token no proporcionado"
    });
  }

  const token = encabezado.split(" ")[1];

  try {
    const datos = jwt.verify(token, process.env.JWT_SECRET);
    req.usuario = datos;
    next();
  } catch (error) {
    return res.status(401).json({
      mensaje: "Token invalido o vencido"
    });
  }
}

app.post("/api/auth/registro", async (req, res) => {
  try {
    const { nombre, correo, clave } = req.body;

    const usuarioExistente = await Usuario.findOne({ correo });
    if (usuarioExistente) {
      return res.status(400).json({
        mensaje: "El correo ya se encuentra registrado"
      });
    }

    const claveCifrada = await bcrypt.hash(clave, 10);

    const nuevoUsuario = new Usuario({
      nombre,
      correo,
      clave: claveCifrada
    });

    await nuevoUsuario.save();

    res.status(201).json({
      mensaje: "Usuario registrado correctamente"
    });
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al registrar el usuario"
    });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const { correo, clave } = req.body;

    const usuario = await Usuario.findOne({ correo });
    if (!usuario) {
      return res.status(401).json({
        mensaje: "Credenciales incorrectas"
      });
    }

    const claveCorrecta = await bcrypt.compare(clave, usuario.clave);
    if (!claveCorrecta) {
      return res.status(401).json({
        mensaje: "Credenciales incorrectas"
      });
    }

    const token = jwt.sign(
      {
        id: usuario._id,
        nombre: usuario.nombre,
        correo: usuario.correo
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "2h"
      }
    );

    res.json({
      mensaje: "Inicio de sesion correcto",
      token,
      usuario: {
        nombre: usuario.nombre,
        correo: usuario.correo
      }
    });
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al iniciar sesion"
    });
  }
});

app.get("/api/auth/perfil", verificarToken, async (req, res) => {
  res.json({
    usuario: req.usuario
  });
});

app.get("/api/suenos", verificarToken, async (req, res) => {
  try {
    const registros = await Sueno.find().sort({ fecha: -1 });
    res.json(registros);
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al consultar los registros"
    });
  }
});

app.get("/api/suenos/:id", verificarToken, async (req, res) => {
  try {
    const registro = await Sueno.findById(req.params.id);
    if (!registro) {
      return res.status(404).json({
        mensaje: "Registro no encontrado"
      });
    }
    res.json(registro);
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al consultar el registro"
    });
  }
});

app.post("/api/suenos", verificarToken, async (req, res) => {
  try {
    const nuevoRegistro = new Sueno(req.body);
    await nuevoRegistro.save();
    res.status(201).json({
      mensaje: "Registro creado correctamente",
      registro: nuevoRegistro
    });
  } catch (error) {
    res.status(400).json({
      mensaje: "Error al crear el registro"
    });
  }
});

app.put("/api/suenos/:id", verificarToken, async (req, res) => {
  try {
    const registroActualizado = await Sueno.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    if (!registroActualizado) {
      return res.status(404).json({
        mensaje: "Registro no encontrado"
      });
    }

    res.json({
      mensaje: "Registro actualizado correctamente",
      registro: registroActualizado
    });
  } catch (error) {
    res.status(400).json({
      mensaje: "Error al actualizar el registro"
    });
  }
});

app.delete("/api/suenos/:id", verificarToken, async (req, res) => {
  try {
    const registroEliminado = await Sueno.findByIdAndDelete(req.params.id);

    if (!registroEliminado) {
      return res.status(404).json({
        mensaje: "Registro no encontrado"
      });
    }

    res.json({
      mensaje: "Registro eliminado correctamente"
    });
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al eliminar el registro"
    });
  }
});

const PUERTO = process.env.PORT || 3000;
app.listen(PUERTO, () => {
  console.log(`Servidor ejecutandose en http://localhost:${PUERTO}`);
});
