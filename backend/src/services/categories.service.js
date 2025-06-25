const Categories = require("../models/categories");

exports.getCategories = async () => {
    return await Categories.find();
}

exports.getCategoryBySlug = async (slug) => {
    return await Categories.findOne({ slug: slug});
}

exports.createCategory = async (data) => {
    return await Categories.create(data);
}

exports.updateCategory = async (id, data) => {
    return await Categories.findByIdAndUpdate(id, data, { new: true })
}

exports.saveCategory = async (category) => {
    return await category.save();
}


exports.deleteCategory = async (id) => {
    return await Categories.findByIdAndDelete(id);
}

exports.deleteAllCategory = async () => {
    return await Categories.deleteMany();
}