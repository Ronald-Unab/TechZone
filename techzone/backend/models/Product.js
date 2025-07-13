const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: String,
  desc: String,
  price: Number,
  category: String,
  image: String, // Aquí se guardará el nombre del archivo
  owner: String
});

module.exports = mongoose.model("Product", productSchema);