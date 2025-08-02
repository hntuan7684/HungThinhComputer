const express = require("express");
const router = express.Router();

const brandRouter = require("./brand.router.js");
const categoriesRouter = require("./categories.router.js");
const productRouter = require("./product.router.js");

const userControllers = require("../controllers/user.controller");

router.use("/brands", brandRouter);
router.use("/categories", categoriesRouter);
router.use("/products", productRouter);

router.get("/", userControllers.getUsers);
router.get("/:id", userControllers.getUserById);

router.post("/", userControllers.createUser);

router.put("/:id", userControllers.updateUser);

router.delete("/", userControllers.deleteAllUser);
router.delete("/:id", userControllers.deleteUser);
module.exports = router;