const express = require('express');
const { 
    getUsers,
    registerUser,
    loginUser,
    // logedIn,
    deleteUser,
    updateUser,
    // verifyEmailandSendOtp,
    // getUsersOtp,
    // verifyOtp,
    updatePassword,
    // verifyEmailandSendOtpForUserRegister,
    // emailIsUserorCompany,
    userAddJobToSavedJobs,
    getAllUserSavedJob,
    userDeleteFile,
    userAddFile,
    // checkUserAndValidate,
    getUserNotifications,
    updateUserCarierInfo,
    deleteEducation,
    updateEducation,
    addEducation,
    fetchSchools,
    addLinks,
    updateLink,
    deleteLink,
    addAchievement,
    updateAchievement,
    deleteAchievement,
    addExperience,
    updateExperience,
    deleteExperience,
    getUserWithId,
    userUpdateProfilePhoto,
    userDeleteProfilePhoto
} = require('../Controller/userController.js');
const auth = require('../Middleware/auth.js');
const authAdmin = require('../Middleware/authAdmin.js');
const {upload} = require('../Utils/FileUpload/fileUpload.js')
const {postProducts} = require('../Controller/customerControllers.js');
const router = express.Router();
router.get('/api/users',getUsers);//Umumi istifadecilerin olduqu api
router.get('/api/getusernotifications/:id',getUserNotifications);
router.get('/api/user/:userId',getUserWithId);
router.post('/api/registerUser',registerUser);//User qeydiyytdan kecmesi
// router.post('/api/checkuserandvalidate',checkUserAndValidate);
router.post('/api/loginUser',loginUser);//Userin login olmasi
// router.get('/api/logoutUser',logoutUser);//Userin cixisi
// router.get('/api/loggeIn',logedIn);//Userin login ve ya logut olmasi
router.delete('/api/deleteUser/:id',deleteUser);//Userin silinmesi
router.put('/api/updateUser/:id',updateUser);//Useri update olunmasi
// router.post('/api/verifyEmail',verifyEmailandSendOtp);//Parol deyismek isteyen userin birinci emailine otp code gedir+++
// router.get('/api/getUsersOtp',getUsersOtp); //Umumi otp kod geden userlerin olduqu api+++
// router.post('/api/verifyOtp',verifyOtp);//Userin daxil etdiyi otp duzgun olub olmadiqi yoxlanir+++
router.post('/api/updatePassword',updatePassword);//Otp duzgundurse parolunu deyise biler
// router.post('/api/verifyEmailandSendOtpForUserRegister',verifyEmailandSendOtpForUserRegister);//+++
router.post('/api/addJobToSaved/:userId/:jobId',userAddJobToSavedJobs);
router.get('/api/getAllUSerSavedJobs/:userId',getAllUserSavedJob);
// router.post('/api/postProduct',postProducts)



router.get('/api/fetchschools',fetchSchools);
//User profile update\\
router.put('/api/updateusercarierinfo/:id',updateUserCarierInfo);
router.delete('/api/deleteeducation/:userId/:educationId',deleteEducation);
router.put('/api/updateeducation/:userId/:educationId',updateEducation);
router.post('/api/addeducations/:userId',addEducation);
router.post('/api/addlinks/:userId',addLinks);
router.put('/api/updatelink/:userId/:linkId',updateLink);
router.delete('/api/deletelink/:userId/:linkId',deleteLink);
router.post('/api/addachievement/:userId',addAchievement);
router.put('/api/updateachievement/:userId/:achievementId',updateAchievement);
router.delete('/api/deleteachievement/:userId/:achievementId',deleteAchievement);
router.post('/api/addexperience/:userId',addExperience);
router.put('/api/updateexperience/:userId/:experienceId',updateExperience);
router.delete('/api/deleteexperience/:userId/:experienceId',deleteExperience);
router.put('/api/userupdatefile/:id',upload('uploads',['pdf']).single('file'),userAddFile);
router.delete('/api/userdeletefile/:userId',userDeleteFile);
router.put('/api/updateprofilephoto/:userId',upload('userprofilepic',['png','jpg','jpeg']).single('file'),userUpdateProfilePhoto);
router.delete('/api/userdeleteprofilephoto/:userId',userDeleteProfilePhoto)
//End of user profile update\\
module.exports = router


