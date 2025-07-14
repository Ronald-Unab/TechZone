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

  res.json({ username });
});

module.exports = router;