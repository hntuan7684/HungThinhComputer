const Product = require("../models/product");

exports.getProducts = async () => {
    return await Product.find();
};

exports.getProductBySlug = async (slug) => {
    return await Product.findOne({ slug: slug });
};

exports.filterProducts = async (filters) => {
    const query = {};

    if(filters.brandId) {
        query.brand = filters.brandId;
    }

    if(filters.categoryId) {
        query.category = filters.categoryId;
    }

    if(filters.isActive !== undefined) {
        query.isActive = filters.isActive;
    }

    if(filters.keyword) {
        query.name = { $regex: filters.keyword, $options: "i"};
    }

    const page = parseInt(filters.page) || 1;
    const limit = parseInt(filters.limit) || 10;
    const skip = (page - 1) * limit;

    const sortField = filters.sortBy || "createdAt";
    const sortOrder = filters.order === "asc" ? 1 : -1;

    const products = await Product.find(query)
        .populate("brand")
        .populate("category")
        .sort({ [sortField] : sortOrder })
        .skip(skip)
        .limit(limit);

    const total = await Product.countDocuments(query);

    return {
        products,
        total,
        page,
        totalPages: Math.ceil(total / limit)
    };
}

exports.createProduct = async (data) => {
    return await Product.create(data);
};

exports.updateProduct = async (id, data) => {
    return await Product.findByIdAndUpdate(id, data, { new: true });
};

exports.saveProduct = async (product) => {
  return await product.save();
};


exports.deleteProduct = async (id) => {
    return await Product.findByIdAndDelete(id);
};

exports.deleteAllProducts = async () => {
    return await Product.deleteMany();
};
