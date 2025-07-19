// routes/historyRoutes.js
const express = require("express");
const router = express.Router();
const History = require("../models/History");
const Product = require("../models/Product"); // ✅ importar modelo de productos

// Obtener historial de compras del usuario (NO archivadas)
router.get("/", async (req, res) => {
  const username = req.session?.user?.username;
  if (!username) return res.status(401).json({ message: "No autorizado" });

  try {
    const history = await History.find({ user: username, archived: { $ne: true } }).sort({ createdAt: -1 });
    res.json(history);
  } catch (error) {
    console.error("Error al obtener historial:", error);
    res.status(500).json({ message: "Error del servidor" });
  }
});

// Obtener compras archivadas del usuario
router.get("/archived", async (req, res) => {
  const username = req.session?.user?.username;
  if (!username) return res.status(401).json({ message: "No autorizado" });

  try {
    const archivedHistory = await History.find({ user: username, archived: true }).sort({ createdAt: -1 });
    res.json(archivedHistory);
  } catch (error) {
    console.error("Error al obtener archivados:", error);
    res.status(500).json({ message: "Error al obtener archivados" });
  }
});

// Archivar o desarchivar una compra
router.put("/archive/:id", async (req, res) => {
  try {
    const username = req.session?.user?.username;
    if (!username) return res.status(401).json({ error: "No autenticado" });

    const { archived } = req.body;

    const updatedHistory = await History.findOneAndUpdate(
      { _id: req.params.id, user: username },
      { archived },
      { new: true }
    );

    if (!updatedHistory) return res.status(404).json({ error: "Compra no encontrada" });

    res.json({ message: `Compra ${archived ? "archivada" : "desarchivada"}` });
  } catch (err) {
    console.error("Error al actualizar compra:", err);
    res.status(500).json({ error: "Error al actualizar compra" });
  }
});

// Guardar historial de compra
router.post("/", async (req, res) => {
  try {
    if (!req.session.user) return res.status(401).json({ error: "No autenticado" });

    const { items } = req.body;
    const username = req.session.user.username;

    // Buscar el historial más reciente del usuario
    const lastOrder = await History.findOne({ user: username }).sort({ orderNumber: -1 });

    // Calcular el siguiente número de compra
    const nextOrderNumber = lastOrder ? lastOrder.orderNumber + 1 : 1;

    // Validar stock de todos los productos antes de guardar
    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(400).json({ error: `Producto con ID ${item.productId} no encontrado` });
      }
      if (product.stock < item.quantity) {
        return res.status(400).json({
          error: `No hay suficiente stock para el producto "${product.name}". Stock disponible: ${product.stock}, solicitado: ${item.quantity}`
        });
      }
    }

    // Si todo ok, guardar historial
    const newEntry = new History({
      user: username,
      items,
      orderNumber: nextOrderNumber
    });

    await newEntry.save();

    // Descontar stock de los productos
    for (const item of items) {
      const product = await Product.findById(item.productId);
      product.stock -= item.quantity;
      await product.save();
    }

    res.status(201).json({ message: "Historial guardado" });

  } catch (err) {
    console.error("Error al guardar historial:", err); // Ya lo tienes
    res.status(500).json({ error: "Error al guardar historial", details: err.message }); // <-- añade esto
  }
});

module.exports = router;