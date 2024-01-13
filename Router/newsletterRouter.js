const express = require('express');
const { getNewsLetter,addEmail,getAllCategories } = require('../Controller/newsletterControlller.js');

const router = express.Router();

router.get('/api/newsletter',getNewsLetter);
router.get('/api/allcategories',getAllCategories);
router.post('/api/addEmail',addEmail);
module.exports =  router