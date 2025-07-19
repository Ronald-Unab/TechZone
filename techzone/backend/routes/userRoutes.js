const express = require("express");
const router = express.Router();
const User = require("../models/User");

// Registro
router.post("/register", async (req, res) => {
  const { username, password } = req.body;

  const exists = await User.findOne({ username });
  if (exists) {
    return res.status(400).json({ message: "El usuario ya existe" });
  }

  const newUser = new User({ username, password });
  await newUser.save();

  res.status(201).json({ message: "Usuario creado con éxito" });
});

// Login
router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  const user = await User.findOne({ username, password });
  if (!user) {
    return res.status(401).json({ message: "Usuario o contraseña incorrectos" });
  }

  // Guardar sesión
  req.session.user = { username };

  res.json({ username });
});

// Verificar sesión activa
router.get("/me", (req, res) => {
  const user = req.session.user;
  if (!user) {
    return res.status(401).json({ message: "No autenticado" });
  }
  res.json(user);
});

// Cerrar sesión
router.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Error al cerrar sesión:", err);
      return res.status(500).json({ message: "Error al cerrar sesión" });
    }

    res.clearCookie("connect.sid"); // Borra la cookie de sesión
    res.sendStatus(200); // Todo ok
  });
});

module.exports = router;