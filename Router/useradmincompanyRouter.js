const express = require('express');
const router = express.Router();
const auth = require('../Middleware/auth.js')
const {
    verifyEmailAndSendOtp,
    checkUserAndValidate,
    verifyOtp,
    getUsersOtp,
    profile,
    emailIsUserorCompany,
    logout,
    logedIn,
    login
} 
= require('../Controller/useradmincompanyOtpcontroller.js');
//<------------------------------------>GET REQUEST<-------------------------------------->\\
router.get('/api/usersotp',getUsersOtp);
router.get('/api/profile',auth,profile);
router.get('/api/logout',logout);
router.get('/api/loggedin',logedIn);
//<-------------------------------->END OF GET REQUEST<----------------------------------->\\


//<------------------------------------>POST REQUEST<------------------------------------->\\
router.post('/api/verifyEmailAndSendOtp',verifyEmailAndSendOtp);
//body
// email:"example@gmail.com"
// type: uc deyerden birini alir--> ["u_register","c_register","c_password_changing","u_password_changing"]
router.post('/api/checkUserAndValidate/',checkUserAndValidate);
//params
//type: bu deyerlerden birini alir--> ["c_register","u_register"]
//body
//email,name,password,passwordRepeat
router.post('/api/verifyOtp/',verifyOtp);
//body
//email,otp
router.post('/api/emailiusrorcmp',emailIsUserorCompany);
//body
//email:"useremail@gmail.com"
//permission_id: bu 3 deyerden birini ala biler ->>['0f12_j_1','0f32_i_2','0h43_o_1']
router.post('/api/login',login)
//<-------------------------------->END OF POST REQUEST<------------------------------------->\\
module.exports = router