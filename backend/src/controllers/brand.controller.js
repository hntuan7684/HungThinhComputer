const brandService = require("../services/brand.service.js");
const productService = require("../services/product.service");


const cloudinary = require("../config/cloudinary");

exports.getBrands = async (req, res) => {
  try {
    const brands = await brandService.getBrands();
    if (!brands || brands.length === 0) {
      return res.status(404).json({ message: "No Brands found!" });
    }
    return res.status(200).json(brands);
  } catch (error) {
    console.error("Error while fetching brands:", error.message);
    return res.status(500).json({ message: "Internal server error!" });
  }
};

exports.getBrandBySlug = async (req, res) => {
    try {
        const { slug } = req.params;
        const brand = await brandService.getBrandBySlug(slug);

        if (!brand) {
            return res.status(404).json({ message: "Brand not found!" });
        }

        return res.status(200).json(brand);
    } catch (error) {
        console.error("Error while fetching brand:", error.message);
        return res.status(500).json({ message: "Internal server error!" });
    }
};

exports.createBrand = async (req, res) => {
  try {
    const data = req.body;

    const slugExist = await brandService.getBrandBySlug(data.slug);
    if (slugExist) {
      return res.status(409).json({ message: "Slug already exists!" });
    }

    const brandData = {
      ...data,
      logo: req.imageInfo ,
    };

    const brand = await brandService.createBrand(brandData);
    if (!brand) {
      return res.status(500).json({ message: "Could not create brand!" });
    }

    return res
      .status(201)
      .json({ message: "Brand created successfully!", brand });
  } catch (error) {
    console.error("Error while creating brand:", error.message);
    return res.status(500).json({ message: "Internal server error!" });
  }
};

exports.updateBrand = async (req, res) => {
  try {
    const { slug } = req.params;
    const updateData = req.body;

    const brand = await brandService.getBrandBySlug(slug);
    if (!brand) {
      return res.status(404).json({ message: "Brand not found" });
    }

    // Không cho phép cập nhật slug
    if (updateData.slug && updateData.slug !== brand.slug) {
      return res.status(400).json({ message: "Slug cannot be updated" });
    }

    // Cập nhật các trường cho phép
    if (updateData.name) brand.name = updateData.name;
    if (updateData.description) brand.description = updateData.description;

    // Cập nhật ảnh nếu có gửi ảnh mới
    if (req.imageInfo) {
      if (brand.logo && brand.logo.public_id) {
        await cloudinary.uploader.destroy(brand.logo.public_id);
      }
      brand.logo = req.imageInfo;
    }

    // Xóa ảnh nếu có yêu cầu
    if (updateData.removeImage === "true" && !req.imageInfo) {
      if (brand.logo && brand.logo.public_id) {
        await cloudinary.uploader.destroy(brand.logo.public_id);
      }
      brand.logo = null;
    }

    const brandUpdated = await brandService.saveBrand(brand);

    if (!brandUpdated) {
      return res.status(500).json({ message: "Could not update brand" });
    }

    return res
      .status(200)
      .json({ message: "Brand updated successfully", brand: brandUpdated });
  } catch (error) {
    console.error("Error while updating brand:", error.message);
    return res.status(500).json({ message: "Internal server error" });
  }
};


exports.deletehardBrand = async (req, res) => {
  try {
    const { slug } = req.params;
    const brand = await brandService.getBrandBySlug(slug);

    if (!brand) {
      return res.status(404).json({ message: "Brand not found" });
    }

    // Xóa toàn bộ sản phẩm liên quan
    const products = await Product.find({ brand: brand._id });

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

      await productService.deleteProduct(product.id);
    }

    // Xóa ảnh logo Brand nếu có
    if (brand.logo && brand.logo.public_id) {
      await cloudinary.uploader.destroy(brand.logo.public_id);
    }

    // Xóa Brand
    const deleted = await brandService.deleteBrand(brand.id);
    if (!deleted) {
      return res.status(500).json({ message: "Could not delete Brand" });
    }

    return res.status(200).json({
      message: `Brand and ${products.length} products hard deleted successfully`
    });
  } catch (error) {
    console.error("Error while hard deleting Brand and Products:", error.message);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.deleteSoftBrand = async (req, res) => {
  try {
    const { slug } = req.params;
    const brand = await brandService.getBrandBySlug(slug);

    if (!brand) {
      return res.status(404).json({ message: "Brand not found" });
    }

    const result = await productService.filterProducts({ brandId: brand._id }) || {};
    const products = result.products || [];

    if (!Array.isArray(products)) {
      console.error("Expected array of products but got:", products);
      return res.status(500).json({ message: "Product data is invalid format!" });
    }

    await Promise.all(
      products.map(product =>
        productService.updateProduct(product.id, { isActive: false })
      )
    );

    brand.isActive = false;
    await brand.save();

    return res.status(200).json({
      message: `Soft delete brand and ${products.length} products successfully!`,
      brand
    });

  } catch (error) {
    console.error("Error while soft deleting Brands and Products:", error.message);
    return res.status(500).json("Internal server error!");
  }
};



exports.deleteAllBrand = async (req, res) => {
  try {
    const brands = await Brand.find();

    let totalDeletedBrands = 0;
    let totalDeletedProducts = 0;

    for (const brand of brands) {
      // Tìm toàn bộ sản phẩm thuộc brand
      const products = await Product.find({ brand: brand._id });

      // Xóa từng sản phẩm và ảnh liên quan
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

        await productService.deleteProduct(product.id);
        totalDeletedProducts++;
      }

      // Xóa ảnh logo Brand nếu có
      if (brand.logo && brand.logo.public_id) {
        await cloudinary.uploader.destroy(brand.logo.public_id);
      }

      await brandService.deleteBrand(brand.id);
      totalDeletedBrands++;
    }

    return res.status(200).json({
      message: "All brands and related products deleted successfully",
      totalDeletedBrands,
      totalDeletedProducts
    });
  } catch (error) {
    console.error("Error while deleting all brands:", error.message);
    return res.status(500).json({ message: "Internal server error" });
  }
};
