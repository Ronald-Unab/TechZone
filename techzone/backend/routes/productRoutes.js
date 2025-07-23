const express = require("express");
const multer = require("multer");
const router = express.Router();
const { addProduct, getProducts } = require("../controllers/productController");
const Product = require("../models/Product");
const History = require("../models/History");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  }
});
const upload = multer({ storage: storage });

router.post("/", upload.single("image"), async (req, res) => {
  try {
    const { name, desc, price, category, owner } = req.body;
    const image = req.file ? req.file.filename : null;

    const product = new Product({
      name,
      desc,
      price,
      category,
      image,
      owner,
      stock: req.body.stock !== undefined ? parseInt(req.body.stock) : undefined
    });

    await product.save();
    res.status(201).json(product);
  } catch (err) {
    console.error("Error al crear producto:", err);
    res.status(500).json({ message: "Error al crear producto" });
  }
});

router.get("/", getProducts);

router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await Product.findByIdAndDelete(id);
    res.sendStatus(200);
  } catch (error) {
    res.status(500).json({ message: "Error al eliminar producto" });
  }
});

router.put("/:id", upload.single("image"), async (req, res) => {
  const { id } = req.params;
  const { name, desc, price, category } = req.body;
  const image = req.file ? req.file.filename : null;

  try {
    const updatedFields = {
      name,
      desc,
      price,
      category,
      stock: req.body.stock !== undefined ? parseInt(req.body.stock) : undefined
    };

    if (image) {
      updatedFields.image = image;
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      updatedFields,
      { new: true }
    );

    res.json(updatedProduct);
  } catch (error) {
    res.status(500).json({ message: "Error al actualizar producto" });
  }
});

router.put("/archive/:id", async (req, res) => {
  const username = req.session?.user?.username;
  if (!username) return res.status(401).json({ error: "No autenticado" });

  const { archived } = req.body;

  try {
    const product = await Product.findOneAndUpdate(
      { _id: req.params.id, owner: username },
      { archived },
      { new: true }
    );

    if (!product) return res.status(404).json({ error: "Producto no encontrado" });

    res.json({ message: `Producto ${archived ? "archivado" : "desarchivado"}`, product });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al actualizar producto" });
  }
});

router.get("/archived", async (req, res) => {
  const username = req.session?.user?.username;
  if (!username) return res.status(401).json({ message: "No autorizado" });

  try {
    const archived = await Product.find({ owner: username, archived: true });
    res.json(archived);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener productos archivados" });
  }
});

// Obtener productos más vendidos (con stock y no archivados)
router.get("/top-sold", async (req, res) => {
  try {
    const histories = await History.find({});
    const counter = {};

    histories.forEach(h => {
      h.items.forEach(item => {
        if (!counter[item.productId]) counter[item.productId] = 0;
        counter[item.productId] += item.quantity;
      });
    });

    const sorted = Object.entries(counter)
      .sort((a, b) => b[1] - a[1])
      .map(([productId]) => productId);

    const products = await Product.find({ stock: { $gt: 0 }, archived: false });

    const topSold = sorted
      .map(id => products.find(p => p._id.toString() === id))
      .filter(Boolean)
      .slice(0, 4);

    res.json(topSold);
  } catch (err) {
    console.error("Error al obtener productos más vendidos:", err);
    res.status(500).json({ error: "Error al obtener productos destacados" });
  }
});

// Obtener un producto por ID
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }
    res.json(product);
  } catch (err) {
    console.error("Error al buscar producto por ID:", err);
    res.status(500).json({ error: "Error al buscar producto" });
  }
});

module.exports = router;