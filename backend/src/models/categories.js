const mongoose = require("mongoose");

const categoriesSchema = mongoose.Schema({
    name: { type: String, required: true},
    slug: { type: String, required: true, unique: true},
    isActive: { type: Boolean, default: true}
}, { timestamps: true});

module.exports = mongoose.model("Categories", categoriesSchema);