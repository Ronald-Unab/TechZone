const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: String,
  desc: String,
  price: Number,
  category: String,
  image: String,
  owner: String
});

module.exports = mongoose.model("Product", productSchema);