const express = require('express');
const router = express.Router();
const {getresultfromapi,creatcoverletter} = require('../Controller/cvAnalyzController.js');



//<----------------------------------------POST REQUEST----------------------------------------->\\

router.post('/api/cvanalyzer',getresultfromapi);
router.post('/api/creatcoverletter/:user_id',creatcoverletter);



module.exports = router