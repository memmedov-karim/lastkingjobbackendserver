const { getApplys,postApply,companyAcceptUserApply, getAcceptedApplys,companyDeleteApply,getUserRemovedApplysAll,getRemovedApplysEachUser,getAcceptedApplysEachCompany,getApplysForEachUser,getApplysForEachCompany,getApplysForEachCompanyOnlyTestLevel,getPdf } = require("../Controller/applyController.js");
const auth = require("../Middleware/auth.js");
const {upload} = require('../Utils/FileUpload/fileUpload.js');
const express = require('express');
const router = express.Router();
router.use(express.static('public'))
router.get('/api/applys',getApplys);
router.post('/api/postApply',upload('uploads',['pdf']).single('file'),postApply);//Userin yeni isi ucun muracieti
router.get('/api/getacceptedApplys',getAcceptedApplys);//Umumi qebul eilen muracietler
router.put('/api/companyAcceptUserApply/:id',companyAcceptUserApply);//Sirket userin muracietini beyenir ve onunla musahibe vaxtini teyin etmek ucun onu accepted apply elave edir
router.put('/api/companyDeleteApply/:id',companyDeleteApply);//Sirket muracieti silir eyer muracieti beyenmiyib silirse usere beyenilmemek ile bagli email gedir
router.get('/api/getUserRemovedApplysAll',getUserRemovedApplysAll);//Umumi userlerin beyenilmeyen muracietleri
router.get('/api/getRemovedApplysEachUser/:id',getRemovedApplysEachUser);//Userin beyenilmeyen muracietleri
router.get('/api/getAcceptedApplysEachCompany/:id',getAcceptedApplysEachCompany);//Her bir sirketin beyendiyi qebul etdiyi muracietler
router.get('/api/getApplysForEachCompanyOnlyTestLevel/:company_id',getApplysForEachCompanyOnlyTestLevel)
router.get('/api/getApplysForEachUser/:id',getApplysForEachUser)//Userin muraciet etdiyi is ler
router.get('/api/getApplysForEachCompany/:id',getApplysForEachCompany);//Sirketin qoyduqu ise gelen muracietler
router.get('/api/getPdf',getPdf)

module.exports =  router