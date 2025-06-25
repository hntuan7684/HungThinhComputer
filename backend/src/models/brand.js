const mongoose = require("mongoose");

const brandSchema = mongoose.Schema({
    name: { type: String, required: true},
    slug: { type: String, required: true, unique: true},
    logo: {
        public_id: { type: String },
        url: { type: String }
    },
    description: { type: String}
},{ timestamps: true });

module.exports = mongoose.model('Brand', brandSchema);