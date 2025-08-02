const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
    name: { type: String },
    account: { type: String, required: true, unique: true},
    password: { type: String, required: true },
    role: { type: String, enum: ["admin", "customer"]},
    gender: { type: String},
    address: { 
        province: String,
        district: String,
        detail: String
     },
    phone: String,

}, { timestamp: true});

module.exports = mongoose.model("User", userSchema);