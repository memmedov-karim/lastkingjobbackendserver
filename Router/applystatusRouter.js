const express = require('express');
const router = express.Router();
const {getapplystatuses,addstatus} = require('../Controller/applystatusController.js');

router.get('/api/applystatuses',getapplystatuses);
router.post('/api/addstatus',addstatus)
module.exports = router