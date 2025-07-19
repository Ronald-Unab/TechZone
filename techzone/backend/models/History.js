// models/History.js
const mongoose = require("mongoose");

const historySchema = new mongoose.Schema({
  user: { type: String, required: true },
  orderNumber: { type: Number, required: true },
  items: [
    {
      productId: String,
      name: String,
      image: String,
      price: Number,
      quantity: Number
    }
  ],
  createdAt: { type: Date, default: Date.now },
  archived: { type: Boolean, default: false }
});

module.exports = mongoose.model("History", historySchema);