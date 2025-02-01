const mongoose = require("mongoose");

const PropertySchema = new mongoose.Schema({
  address: { type: String, required: true },
  city: { type: String, required: true },
  addedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // User who added it
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Property", PropertySchema);
