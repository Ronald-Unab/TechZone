const express = require("express");
const multer = require("multer");
const router = express.Router();
const { addProduct, getProducts } = require("../controllers/productController");
const Product = require("../models/Product");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  }
});
const upload = multer({ storage: storage });

router.post("/", upload.single("image"), addProduct);
router.get("/", getProducts);

// En routes/productRoutes.js
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

// PUT /api/products/archive/:id
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

// GET /api/products/archived
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

module.exports = router;