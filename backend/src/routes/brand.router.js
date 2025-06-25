const express = require('express');
const router = express.Router();

const { uploadSingleOptional } = require('../middlewares/uploadImage.middleware');

const brandController = require('../controllers/brand.controller.js');

router.get('/', brandController.getBrands);

router.get("/:slug", brandController.getBrandBySlug);

router.post('/upload', uploadSingleOptional('uploads/brand'), brandController.createBrand);

router.put('/update/:slug', uploadSingleOptional('uploads/brand'), brandController.updateBrand);

router.delete('/delete/:slug', brandController.deleteBrand);

router.delete('/delete-all', brandController.deleteAllBrand)

module.exports = router;
