const express = require('express');
const router = express.Router();
const { getProducts, getProductsById, addProduct, updateProduct, deleteProduct, getProductsByCategory, getCategories } = require('../controllers/productController');
var helpers = require('../helpers');
const { adminUser } = require('../middlewares/adminUser');

// Public Routes
router.get('/', getProducts);
router.get('/category/:category', getProductsByCategory);
router.get('/categories', getCategories);
router.get('/:id', getProductsById);


// Protected Routes (Admin Only CRUD Operations)
router.post('/', adminUser, helpers.validateInsertProduct, addProduct);
router.put('/', adminUser, helpers.validateInsertProduct, addProduct);
router.patch('/:id', adminUser, helpers.validateUpdateProduct, updateProduct);
router.delete('/:id', adminUser, deleteProduct);


module.exports = router;