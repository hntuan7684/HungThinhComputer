const express = require('express');
const router = express.Router();

const { uploadSingleOptional } = require('../middlewares/uploadImage.middleware');

const brandController = require('../controllers/brand.controller.js');

router.get('/', brandController.getBrands);

router.get("/:slug", brandController.getBrandBySlug);

router.post('/upload', uploadSingleOptional('uploads/brand'), brandController.createBrand);

router.put('/update/:slug', uploadSingleOptional('uploads/brand'), brandController.updateBrand);

router.delete('/hard-delete/:slug', brandController.deletehardBrand);

router.delete('/hard-delete-all', brandController.deleteAllBrand)

router.delete("/soft-delete/:slug", brandController.deleteSoftBrand);


module.exports = router;
