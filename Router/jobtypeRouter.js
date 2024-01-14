const express = require('express');
const router = express.Router();
const {getjobtypes,addjobtype} = require('../Controller/jobtypeController.js');



router.get('/api/types',getjobtypes);
router.post('/api/addtype',addjobtype)



module.exports  = router;