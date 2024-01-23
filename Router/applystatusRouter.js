const express = require('express');
const router = express.Router();
const {getapplystatuses,addstatus,companygiveanstatustoapplyer} = require('../Controller/applystatusController.js');
const auth = require("../Middleware/auth.js");
router.get('/api/applystatuses',getapplystatuses);
router.post('/api/addstatus',addstatus);
router.post('/api/companygiveanstatus/:applyerId/:statusId',auth,companygiveanstatustoapplyer)
module.exports = router