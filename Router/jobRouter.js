const express = require('express');

const { 
    getJobjs,
    addJob,
    increaseNumberOfViews,
    increaseNumberOfApplys,
    updateJob,
    deleteJob,
    getJobWithId,
    getCategoryandSubcategory,
    searchJobs,
    advancedSearch,
    searchJobsTest,
    deactivate,
    fetchFiltersValuesForJobs
 } 
= require('../Controller/jobController.js');
const router = express.Router();
const auth = require('../Middleware/auth.js');
router.get('/api/getJobs',getJobjs);//Saytda derc olunan umumi islerin olduqu api
router.get('/api/searchJobs',searchJobs) //Saytda yerlesen islerde axtaris
router.get('/api/advancesearch',advancedSearch);//Search bardan axtaris
router.get('/api/searchJobsTest',searchJobsTest);
router.get('/api/getJobWithId/:id',getJobWithId) //Id ye gore isin yerlesdiyi api
router.post('/api/addJob',auth,addJob);//Sayta yeni is derc etmek
router.put('/api/increaseNumberOfViews/:id',increaseNumberOfViews) //Ise tiklayanda baxis sayinin artmasi
router.put('/api/increaseNumberOfApplys/:id',increaseNumberOfApplys);//Ise muraciet edende muraciet sayinin artmasi
router.put('/api/updateJob/:id',updateJob);//Sirket paylasdiqi isi yeniden deyisir
router.put('/api/deactivate/:jobId',deactivate);
router.delete('/api/deleteJob/:id',deleteJob);//Sirket paylasdiqi isi silir 
// router.get('/api/checkExpiredJobsAndDelet',checkExpiredJobsAndDelet);
router.get('/api/getctgsubctg',getCategoryandSubcategory);
router.get('/api/fetchfiltersvaluesforjobs/:companyId',fetchFiltersValuesForJobs);
module.exports =  router;