const express = require("express");
const router = express.Router();

const categoriesController = require("../controllers/categories.controller");

router.get("/", categoriesController.getCategories);

router.get("/:slug", categoriesController.getCategoryBySlug);

router.post("/upload", categoriesController.createCategory);

router.put("/update/:slug", categoriesController.updateCategory);

router.delete("/delete/:slug", categoriesController.deleteCategory);

router.delete("/delete-all", categoriesController.deleteAllCategory);


module.exports = router;