const categoriesService = require("../services/categories.service.js");

exports.getCategories = async (req, res) => {
    try {
        const categories = await categoriesService.getCategories();
        if (!categories || categories.length === 0) {
            return res.status(404).json({ message: "No categories found!" });
        }
        return res.status(200).json(categories);
    } catch (error) {
        console.error("Error while fetching categories:", error.message);
        return res.status(500).json({ message: "Internal server error!" });
    }
};

exports.getCategoryBySlug = async (req, res) => {
    try {
        const { slug } = req.params;
        const category = await categoriesService.getCategoryBySlug(slug);
        if (!category) {
            return res.status(404).json({ message: "Category not found" });
        }
        return res.status(200).json(category);
    } catch (error) {
        console.error("Error while fetching category:", error.message);
        return res.status(500).json({ message: "Internal server error!" });
    }
};

exports.createCategory = async (req, res) => {
    try {
        const data = req.body;
        const slugExist = await categoriesService.getCategoryBySlug(data.slug);
        if (slugExist) {
            return res.status(409).json({ message: "Slug already exists!" });
        }
        const category = await categoriesService.createCategory(data);
        if (!category) {
            return res.status(500).json({ message: "Could not create category!" });
        }
        return res.status(201).json({
            message: "Category created successfully!",
            category
        });
    } catch (error) {
        console.error("Error while creating category:", error.message);
        return res.status(500).json({ message: "Internal server error!" });
    }
};

exports.updateCategory = async (req, res) => {
    try {
        const { slug } = req.params;
        const data = req.body;
        const categoryExist = await categoriesService.getCategoryBySlug(slug);
        if (!categoryExist) {
            return res.status(404).json({ message: "Category not found" });
        }
        if (data.slug && data.slug !== categoryExist.slug) {
            return res.status(400).json({ message: "Slug cannot be updated" });
        }
        const category = await categoriesService.updateCategory(categoryExist.id, data);
        if (!category) {
            return res.status(500).json({ message: "Could not update category!" });
        }
        return res.status(200).json({
            message: "Category updated successfully!",
            category
        });
    } catch (error) {
        console.error("Error while updating category:", error.message);
        return res.status(500).json({ message: "Internal server error!" });
    }
};

exports.deleteCategory = async (req, res) => {
    try {
        const { slug } = req.params;
        const categoryExist = await categoriesService.getCategoryBySlug(slug);
        if (!categoryExist) {
            return res.status(404).json({ message: "Category not found" });
        }
        await categoriesService.deleteCategory(categoryExist.id);
        return res.status(200).json({ message: "Category deleted successfully!" });
    } catch (error) {
        console.error("Error while deleting category:", error.message);
        return res.status(500).json({ message: "Internal server error!" });
    }
};

exports.deleteAllCategory = async (req, res) => {
    try {
        await categoriesService.deleteAllCategory();
        return res.status(200).json({ message: "All categories deleted successfully!" });
    } catch (error) {
        console.error("Error while deleting all categories:", error.message);
        return res.status(500).json({ message: "Internal server error!" });
    }
};
