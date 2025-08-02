const productService = require("../services/product.service");
const cloudinary = require("../config/cloudinary");

exports.getProducts = async (req, res) => {
  try {
    const products = await productService.getProducts();
    if (!products || products.length === 0) {
      return res.status(404).json({ message: "No Products found!" });
    }
    return res.json(products);
  } catch (error) {
    console.error("Error while fetching product", error.message);
    return res.status(500).json({ message: "Internal server error!" });
  }
};

exports.getProductBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const product = await productService.getProductBySlug(slug);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    return res.status(200).json(product);
  } catch (error) {
    console.error("Error while fetching product", error.message);
    return res.status(500).json({ message: "Internal server error!" });
  }
};

exports.filterProducts = async (req, res) => {
  try {
    const filters = req.query;

    const result = await productService.filterProducts(filters);

    return res.status(200).json(result);
  } catch (error) {
    console.error("Error filtering products:", error.message);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.createProduct = async (req, res) => {
  try {
    const data = req.body;
    console.log("Create product controller:", data);
    const slugExist = await productService.getProductBySlug(data.slug);
    if (slugExist) return res.status(409).json({ message: "Slug already exists!" });

    const productData = {
      ...data,
      thumbnail: req.imageInfo,
      variants: []
    };

    if (data.variants && Array.isArray(data.variants) && data.variants.length > 0) {
      productData.variants = data.variants.map(variant => ({
        ...variant,
        images: variant.images || [],
        isActive: variant.isActive !== undefined ? variant.isActive : true
      }));
    } else {
      productData.variants.push({
        name: data.name + " - Default",
        price: data.normalPrice || 0,
        stock: 0,
        images: req.imageInfoList || [],
        isActive: true,
      });
    }

    const product = await productService.createProduct(productData);
    if (!product) return res.status(500).json({ message: "Could not create product" });

    return res.status(201).json({ message: "Product created successfully", product });
  } catch (error) {
    console.error("Error creating product:", error.message);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.addVariant = async (req, res) => {
  try {
    const { slug } = req.params;
    const variantData = req.body;

    const product = await productService.getProductBySlug(slug);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    product.variants.push({
      ...variantData,
      images: req.imageInfoList || [],
      isActive: variantData.isActive !== undefined ? variantData.isActive : true
    });

    const updated = await productService.saveProduct(product);

    return res.status(200).json({
      message: "Variant added successfully",
      product: updated
    });
  } catch (error) {
    console.error("Error adding variant:", error.message);
    return res.status(500).json({ message: "Internal server error" });
  }
};


exports.updateProduct = async (req, res) => {
  try {
    const { slug } = req.params;
    const data = req.body;
    const productExist = await productService.getProductBySlug(slug);
    if (!productExist) return res.status(404).json({ message: "Product not found!" });

    if (data.slug && data.slug !== productExist.slug)
      return res.status(400).json({ message: "Slug cannot be updated!" });

    if (data.name) productExist.name = data.name;
    if (data.seriNumber) productExist.seriNumber = data.seriNumber;
    if (data.model) productExist.model = data.model;
    if (data.shortDes) productExist.shortDes = data.shortDes;
    if (data.description) productExist.description = data.description;
    if (data.normalPrice) productExist.normalPrice = data.normalPrice;
    if (data.brand) productExist.brand = data.brand;
    if (data.category) productExist.category = data.category;
    if (data.specifications) productExist.specifications = data.specifications;
    if (data.warrantyPeriod) productExist.warrantyPeriod = data.warrantyPeriod;
    if (data.isActive !== undefined) productExist.isActive = data.isActive;
    if (data.isFeatured !== undefined) productExist.isFeatured = data.isFeatured;

    if (req.imageInfo) {
      if (productExist.thumbnail && productExist.thumbnail.public_id) {
        await cloudinary.uploader.destroy(productExist.thumbnail.public_id);
      }
      productExist.thumbnail = req.imageInfo;
    }

    if (data.variants && Array.isArray(data.variants)) {
      for (const variant of productExist.variants) {
        if (variant.images && Array.isArray(variant.images)) {
          for (const img of variant.images) {
            if (img.public_id) await cloudinary.uploader.destroy(img.public_id);
          }
        }
      }
      productExist.variants = data.variants.map(variant => ({
        ...variant,
        images: variant.images || [],
        isActive: variant.isActive !== undefined ? variant.isActive : true
      }));
    }

    const updatedProduct = await productService.saveProduct(productExist);
    return res.status(200).json({ message: "Product updated successfully", product: updatedProduct });
  } catch (error) {
    console.error("Error updating product:", error.message);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.updateVariant = async (req, res) => {
  try {
    const { slug, variantIndex } = req.params;
    const data = req.body;

    const product = await productService.getProductBySlug(slug);
    if (!product || !product.variants[variantIndex]) {
      return res.status(404).json({ message: "Variant not found" });
    }

    const variant = product.variants[variantIndex];

    if (data.name) variant.name = data.name;
    if (data.price) variant.price = data.price;
    if (data.stock !== undefined) variant.stock = data.stock;
    if (data.specifications) variant.specifications = data.specifications;
    if (data.isActive !== undefined) variant.isActive = data.isActive;

    // Nếu có ảnh mới -> Xóa ảnh cũ trước
    if (req.imageInfoList && Array.isArray(req.imageInfoList)) {
      if (variant.images && Array.isArray(variant.images)) {
        for (const img of variant.images) {
          if (img.public_id) {
            await cloudinary.uploader.destroy(img.public_id);
          }
        }
      }
      variant.images = req.imageInfoList;
    }

    const updated = await productService.saveProduct(product);

    return res.status(200).json({
      message: "Variant updated successfully",
      product: updated
    });
  } catch (error) {
    console.error("Error updating variant:", error.message);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const { slug } = req.params;
    const product = await productService.getProductBySlug(slug);
    if (!product) return res.status(404).json({ message: "Product not found" });

    if (product.thumbnail && product.thumbnail.public_id) {
      await cloudinary.uploader.destroy(product.thumbnail.public_id);
    }
    for (const variant of product.variants) {
      if (variant.images && Array.isArray(variant.images)) {
        for (const img of variant.images) {
          if (img.public_id) await cloudinary.uploader.destroy(img.public_id);
        }
      }
    }
    await productService.deleteProduct(product.id);
    return res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("Error deleting product:", error.message);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.deleteAllProducts = async (req, res) => {
  try {
    const products = await productService.getProducts();

    for (const product of products) {
      // Xóa ảnh đại diện nếu có
      if (product.thumbnail && product.thumbnail.public_id) {
        await cloudinary.uploader.destroy(product.thumbnail.public_id);
      }

      // Xóa ảnh từng variant nếu có
      for (const variant of product.variants) {
        if (variant.images && Array.isArray(variant.images)) {
          for (const img of variant.images) {
            if (img.public_id) {
              await cloudinary.uploader.destroy(img.public_id);
            }
          }
        }
      }

      // Xóa từng sản phẩm
      await productService.deleteProduct(product.id);
    }

    return res.status(200).json({
      message: `All products and related images deleted successfully`,
      totalDeleted: products.length
    });

  } catch (error) {
    console.error("Error deleting all products:", error.message);
    return res.status(500).json({ message: "Internal server error" });
  }
};


exports.removeProductThumbnail = async (req, res) => {
  try {
    const { slug } = req.params;
    const product = await productService.getProductBySlug(slug);
    if (!product) return res.status(404).json({ message: "Product not found" });

    if (product.thumbnail && product.thumbnail.public_id) {
      await cloudinary.uploader.destroy(product.thumbnail.public_id);
    }
    product.thumbnail = null;

    const updated = await productService.saveProduct(product);
    return res.status(200).json({ message: "Thumbnail removed successfully", product: updated });
  } catch (error) {
    console.error("Error removing thumbnail:", error.message);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.removeVariantImage = async (req, res) => {
  try {
    const { slug, variantIndex, imageIndex } = req.params;

    const product = await productService.getProductBySlug(slug);
    if (!product || !product.variants[variantIndex]) {
      return res.status(404).json({ message: "Variant not found" });
    }

    const variant = product.variants[variantIndex];

    if (!variant.images || !variant.images[imageIndex]) {
      return res.status(404).json({ message: "Image not found" });
    }

    const image = variant.images[imageIndex];

    // Xóa ảnh trên Cloudinary nếu có public_id
    if (image.public_id) {
      await cloudinary.uploader.destroy(image.public_id);
    }

    // Xóa khỏi mảng
    variant.images.splice(imageIndex, 1);

    const updated = await productService.saveProduct(product);

    return res.status(200).json({
      message: "Variant image removed successfully",
      product: updated
    });

  } catch (error) {
    console.error("Error removing variant image:", error.message);
    return res.status(500).json({ message: "Internal server error" });
  }
};


exports.deleteVariant = async (req, res) => {
  try {
    const { slug, variantIndex } = req.params;

    const product = await productService.getProductBySlug(slug);
    if (!product || !product.variants[variantIndex]) {
      return res.status(404).json({ message: "Variant not found" });
    }

    const variant = product.variants[variantIndex];

    // Xóa ảnh của Variant trên Cloudinary nếu có
    if (variant.images && Array.isArray(variant.images)) {
      for (const img of variant.images) {
        if (img.public_id) {
          await cloudinary.uploader.destroy(img.public_id);
        }
      }
    }

    // Xóa Variant khỏi danh sách
    product.variants.splice(variantIndex, 1);

    const updated = await productService.saveProduct(product);

    return res.status(200).json({
      message: "Variant deleted successfully",
      product: updated
    });

  } catch (error) {
    console.error("Error deleting variant:", error.message);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.deleteAllVariants = async (req, res) => {
  try {
    const { slug } = req.params;

    const product = await productService.getProductBySlug(slug);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Dọn toàn bộ ảnh của các Variant
    for (const variant of product.variants) {
      if (variant.images && Array.isArray(variant.images)) {
        for (const img of variant.images) {
          if (img.public_id) {
            await cloudinary.uploader.destroy(img.public_id);
          }
        }
      }
    }

    product.variants = []; // Xóa toàn bộ Variants

    const updated = await productService.saveProduct(product);

    return res.status(200).json({
      message: "All variants deleted successfully",
      product: updated
    });
  } catch (error) {
    console.error("Error deleting all variants:", error.message);
    return res.status(500).json({ message: "Internal server error" });
  }
};
