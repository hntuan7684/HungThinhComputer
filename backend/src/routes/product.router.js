const router = require("express").Router();
const uploadImage = require("../middlewares/uploadImage.middleware");
const productController = require("../controllers/product.controller");

// Sản phẩm
router.get("/", productController.getProducts);
router.get("/filter", productController.filterProducts);
router.get("/:slug", productController.getProductBySlug);
router.post("/upload", uploadImage.uploadSingleOptional("uploads/products"), uploadImage.uploadMultipleOptional("uploads/products"), productController.createProduct);
router.put("/:slug", uploadImage.uploadSingleOptional("uploads/products"), uploadImage.uploadMultipleOptional("uploads/products"), productController.updateProduct);
router.delete("/:slug", productController.deleteProduct);
router.delete("/", productController.deleteAllProducts);
router.delete("/:slug/thumbnail", productController.removeProductThumbnail);

// Variants
router.post("/:slug/variant", uploadImage.uploadMultipleOptional("uploads/products"), productController.addVariant);
router.put("/:slug/variant/:variantIndex", uploadImage.uploadMultipleOptional("uploads/products"), productController.updateVariant);
router.delete("/:slug/variant/:variantIndex", productController.deleteVariant);
router.delete("/:slug/variant", productController.deleteAllVariants);
router.delete("/:slug/variant/:variantIndex/image/:imageIndex", productController.removeVariantImage);

module.exports = router;
