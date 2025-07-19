const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: String,
  desc: String,
  price: Number,
  category: String,
  image: String,
  owner: String,
  archived: { type: Boolean, default: false },
  stock: { type: Number, default: 0 }
});

module.exports = mongoose.model("Product", productSchema);