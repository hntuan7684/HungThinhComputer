
const Brand = require("../models/brand");

exports.getBrands = async () => {
    return await Brand.find();
};

exports.getBrandBySlug = async (slug) => {
    return await Brand.findOne({ slug: slug });
};

exports.createBrand = async (data) => {
    return await Brand.create(data);
};

exports.updateBrand = async (id, data) => {
    return await Brand.findByIdAndUpdate(id, data, { new: true });
};

exports.saveBrand = async (brand) => {
    return await brand.save();
};

exports.deleteBrand = async (id) => {
    return await Brand.findByIdAndDelete(id);
}

exports.deleteAllBrand = async () => {
    return await Brand.deleteMany();
}