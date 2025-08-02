const categoriesService = require("../services/categories.service.js");
const productService = require("../services/product.service.js");

const cloudinary = require("../config/cloudinary");

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
    const category = await categoriesService.getCategoryBySlug(slug);

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    // Tìm toàn bộ sản phẩm thuộc category
    const products = await Product.find({ category: category._id });

    for (const product of products) {
      // Xóa ảnh đại diện sản phẩm nếu có
      if (product.thumbnail && product.thumbnail.public_id) {
        await cloudinary.uploader.destroy(product.thumbnail.public_id);
      }

      // Xóa từng ảnh của các Variant nếu có
      for (const variant of product.variants) {
        if (variant.images && Array.isArray(variant.images)) {
          for (const img of variant.images) {
            if (img.public_id) {
              await cloudinary.uploader.destroy(img.public_id);
            }
          }
        }
      }

      await Product.findByIdAndDelete(product.id);
    }

    await categoriesService.deleteCategory(category.id);
    return res.status(200).json({
      message: `Category and ${products.length} products hard deleted successfully`
    });

  } catch (error) {
    console.error("Error hard deleting category:", error.message);
    return res.status(500).json({ message: "Internal server error!" });
  }
};

exports.deleteSoftCategories = async (req, res) => {
  try {
    const { slug } = req.params;
    const category = await categoriesService.getCategoryBySlug(slug);

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    const result = await productService.filterProducts({ categoryId: category._id }) || {};
    const products = result.products || [];

    if (!Array.isArray(products)) {
      console.error("Expected array of products but got:", products);
      return res.status(500).json({ message: "Product data format is invalid!" });
    }

    await Promise.all(
      products.map(product =>
        productService.updateProduct(product.id, { isActive: false })
      )
    );

    category.isActive = false;
    await category.save();

    return res.status(200).json({
      message: `Soft delete category and ${products.length} products successfully!`,
      category,
      products
    });

  } catch (error) {
    console.error("Error while soft deleting Category and Products:", error.message);
    return res.status(500).json({ message: "Internal server error!" });
  }
};



exports.deleteAllCategory = async (req, res) => {
  try {
    const categories = await categoriesService.getCategories();

    let totalDeletedCategories = 0;
    let totalDeletedProducts = 0;

    for (const category of categories) {
      const products = await Product.find({ category: category._id });

      for (const product of products) {
        if (product.thumbnail && product.thumbnail.public_id) {
          await cloudinary.uploader.destroy(product.thumbnail.public_id);
        }
        for (const variant of product.variants) {
          if (variant.images && Array.isArray(variant.images)) {
            for (const img of variant.images) {
              if (img.public_id) {
                await cloudinary.uploader.destroy(img.public_id);
              }
            }
          }
        }
        await Product.findByIdAndDelete(product.id);
        totalDeletedProducts++;
      }

      await categoriesService.deleteCategory(category.id);
      totalDeletedCategories++;
    }

    return res.status(200).json({
      message: "All categories and related products deleted successfully",
      totalDeletedCategories,
      totalDeletedProducts
    });

  } catch (error) {
    console.error("Error deleting all categories:", error.message);
    return res.status(500).json({ message: "Internal server error!" });
  }
};
