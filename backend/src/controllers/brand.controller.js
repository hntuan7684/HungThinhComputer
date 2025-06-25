const brandService = require("../services/brand.service.js");
const cloudinary = require("../config/cloudinary");

exports.getBrands = async (req, res) => {
  try {
    const brands = await brandService.getBrands();
    if (!brands || brands.length === 0) {
      return res.status(404).json({ message: "No Brands found!" });
    }
    return res.json(brands);
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


exports.deleteBrand = async (req, res) => {
    try {
        const { slug } = req.params;
        const brand = await brandService.getBrandBySlug(slug);

        if (!brand) {
            return res.status(404).json({ message: "Brand not found" });
        }

        // Nếu Brand có ảnh → Xóa ảnh trên Cloudinary
        if (brand.logo && brand.logo.public_id) {
            await cloudinary.uploader.destroy(brand.logo.public_id);
        }

        // Xóa Brand trong DB
        const deleted = await brandService.deleteBrand(brand.id);
        if (!deleted) {
            return res.status(500).json({ message: "Could not delete Brand" });
        }

        return res.status(200).json({ message: "Brand deleted successfully" });
    } catch (error) {
        console.error("Error while deleting Brand:", error.message);
        return res.status(500).json({ message: "Internal server error" });
    }
};

exports.deleteAllBrand = async (req, res) => {
    try {
        await brandService.deleteAllBrand();
        return res.status(200).json({ message: "All brands deleted successfully" });
    } catch (error) {
        console.error("Error while deleting all brands:", error.message);
        return res.status(500).json({ message: "Internal server error" });
    }
};
