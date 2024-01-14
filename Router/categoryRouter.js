const express = require('express');
const router = express.Router();
const {getCategories,addCategory,
    updateCategory} = require('../Controller/categoryController.js')

router.get('/api/categories',getCategories);
router.post('/api/addcategory',addCategory);
router.put('/api/updatecategory/:categoryId',updateCategory);
module.exports = router;