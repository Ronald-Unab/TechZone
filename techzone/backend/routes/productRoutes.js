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

module.exports = router;