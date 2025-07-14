const Product = require("../models/Product");

exports.addProduct = async (req, res) => {
    
  try {
    const { name, desc, price, category, owner } = req.body;
    const image = req.file ? req.file.filename : null;

    const newProduct = new Product({ name, desc, price, category, image, owner });
    await newProduct.save();

    res.status(201).json(newProduct);
  } catch (error) {
    res.status(500).json({ message: "Error al guardar producto" });
  }
};

exports.getProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener productos" });
  }
};