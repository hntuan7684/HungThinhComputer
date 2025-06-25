const express = require("express");
const router = express.Router();

const brandRouter = require("./brand.router.js");
const categoriesRouter = require("./categorie.router.js");

router.use("/brand", brandRouter);
router.use("/categories", categoriesRouter);

module.exports = router;