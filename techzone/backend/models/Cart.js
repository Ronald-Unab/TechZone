const mongoose = require("mongoose");

const cartItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product"
  },
  quantity: Number
});

const cartSchema = new mongoose.Schema({
  user: String, // Puedes cambiar a ObjectId si quieres relacionarlo con el modelo User
  items: [cartItemSchema]
});

module.exports = mongoose.model("Cart", cartSchema);