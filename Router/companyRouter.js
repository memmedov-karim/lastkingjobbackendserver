const express = require('express');
const {upload} = require('../Utils/FileUpload/fileUpload.js')
const router = express.Router();
const { 
    getCompanies,
    // sendOtpForCompanyRegister,
    registerCompany,
    deleteCompanyAccount,
    getCompanyDeletingDescriptions,
    getJobsSharedEachCompany,
    loginCompany,
    blockCompanyAccount,
    // sendOtpForPasswordChanging,
    changeCompanyAccountPassword,
    // logoutCompany,
    updateCompanyInfo,
    companyIsBlock,
    // verifyOtp,
    changeCompanyForgottenPassword,
    getCompaniesInfo,
    getNumbersForCompanyMenu,
    getMontlhyVakansyData,
    getcompanydetail,
    getCompanyNotifications
    // validatecompanysignupdetail
} = require('../Controller/companyController.js');
const auth = require('../Middleware/auth.js');
router.use(express.static('public'))
router.get('/api/getCompanies',getCompanies); // Umumi qeydiyyatda olan sirketlerin api-si
router.get('/api/getcompanyinfos',getCompaniesInfo)
// router.post('/api/sendCompanyOtp',sendOtpForCompanyRegister);//Sirket qeydiyyatdan kecende mailine otp kodu gelir
router.post('/api/registerCompany',registerCompany);//Sirket maile gelen otp kodu daxil edir qeydiyyati tamamlayit 
// router.post('/api/validatecompanysignupdetail',validatecompanysignupdetail);
router.get('/api/getCompanyDeletingDescriptions',getCompanyDeletingDescriptions); //Sirketler oz hesablarini silende niye sildiklerini bildirirler onlari api-si
router.post('/api/deleteCompanyAccount',deleteCompanyAccount);//Sirket oz hesabini silir
router.get('/api/jobsEachCompany',auth,getJobsSharedEachCompany);//Her bir sirektin paylasdiqi islerin api-si
router.post('/api/loginCompany',loginCompany);//Sirket oz hesabina daxil olur
// router.get('/api/logoutCompany',logoutCompany); //Sirket hesabdan cixir
router.put('/api/updateCompanyInfo',auth,upload('logos',['png','jpg','jpeg']).single('file'),updateCompanyInfo);//Sirket melumatlarin update edir
router.get('/api/blockCompanyAccount/:id',blockCompanyAccount);//Sirketin mailine yad giris mesaji gelse maile gelen link ile sirket oz hesabin muveqqeti bloklaya biler,ve hesabini parolunu deyise biler
// router.post('/api/sendOtpForPasswordChanging',sendOtpForPasswordChanging);//Sirket oz parolun deyismek istedikde tehlukesiszlik ucun onun mailine otp kod gonderilir
router.post('/api/changeCompanyAccountPassword',changeCompanyAccountPassword);//Maile gelen otp kodu duzgun daxil etse hesabin parolunu deyise bilir ve eyer hesabi blokdadisa avtamatik olaraq blokdan cixir
router.get('/api/companyIsBlock/:email',companyIsBlock);// Company acoountun blok olub amamaqin yoxlamaq
router.get('/api/getNumbersForCompanyMenu/:company_id',getNumbersForCompanyMenu);
router.get('/api/getMontlhyVakansyData',auth,getMontlhyVakansyData);
// router.post('/api/verifyCompanyOtp',verifyOtp);
router.post('/api/changecompanyforgottenpassword',changeCompanyForgottenPassword);
router.get('/api/company/:id',getcompanydetail)
router.get('/api/companynotifications',auth,getCompanyNotifications)
//,upload('logos',['png','jpg','jpeg'],"companyreg").single('file')
module.exports =  router;