const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    seriNumber: { type: String },
    model: { type: String },
    shortDes: { type: String },
    description: { type: String },
    thumbnail: {
        public_id: String,
        url: String,
    },
    normalPrice: { type: Number, default: 0 },
    brand: { type: mongoose.Types.ObjectId, ref: 'Brand' },
    category: { type: mongoose.Types.ObjectId, ref: 'Categories' },
    
    specifications: [
        {
            name: String,       // Tên thông số (VD: "Màn hình", "CPU", "RAM")
            value: String,      // Nội dung thông số (VD: "6.7 inch", "Snapdragon 8 Gen 2")
            unit: String,       // Đơn vị (nếu có), ví dụ: "GB", "inch", "kg"
            group: String       // Nhóm thông số (VD: "Hiệu năng", "Thiết kế") - tùy chọn
        }
    ],

    warrantyPeriod: { type: String },
    isActive: { type: Boolean, default: true },
    isFeatured: { type: Boolean, default: false },

    variants: [
        {
            name: { type: String },    // VD: Đỏ - 128GB
            price: { type: Number },
            stock: { type: Number, default: 0 },
            images: [
                {
                    public_id: String,
                    url: String
                }
            ],
            specifications: [
                {
                    name: String,
                    value: String,
                    unit: String,
                    group: String
                }
            ],
            isActive: { type: Boolean, default: true }
        }
    ]
}, { timestamps: true });

module.exports = mongoose.model("Product", productSchema);
