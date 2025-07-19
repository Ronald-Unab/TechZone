const express = require("express");
const router = express.Router();
const Cart = require("../models/Cart");

// Obtener carrito del usuario autenticado
router.get("/", async (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ message: "No autenticado" });
  }

  try {
    const cart = await Cart.findOne({ user: req.session.user.username }).populate("items.product");
    res.json(cart || { user: req.session.user.username, items: [] });
  } catch (err) {
    res.status(500).json({ message: "Error al obtener el carrito" });
  }
});

// Crear o actualizar carrito del usuario autenticado
router.post("/", async (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ message: "No autenticado" });
  }

  const { items } = req.body;
  const username = req.session.user.username;

  try {
    const updatedCart = await Cart.findOneAndUpdate(
      { user: username },
      { user: username, items },
      { upsert: true, new: true }
    );
    res.json(updatedCart);
  } catch (err) {
    res.status(500).json({ message: "Error al guardar el carrito" });
  }
});

// Actualizar carrito del usuario autenticado
router.put("/", async (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ message: "No autenticado" });
  }

  const { items } = req.body;
  const username = req.session.user.username;

  try {
    const updatedCart = await Cart.findOneAndUpdate(
      { user: username },
      { items },
      { new: true, upsert: true }
    ).populate("items.product");

    res.json(updatedCart);
  } catch (err) {
    console.error("Error al actualizar el carrito:", err);
    res.status(500).json({ message: "Error al actualizar el carrito" });
  }
});

module.exports = router;