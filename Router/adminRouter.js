const { 
    getAdmins,
    registerAdmin,
    loginAdmin,
    loggedInAdmin,
    logoutAdmin,
    deleteAdmin 
} = require("../Controller/adminController.js");
const authAdmin = require("../Middleware/authAdmin.js");
const express = require('express');
const router = express.Router();
router.get('/api/admins',getAdmins);//Umumi adminler olduqu api
router.post('/api/registerAdmin',registerAdmin);//Admin qeydiyyati
router.post('/api/loginAdmin',loginAdmin);//Adminin logini
router.get('/api/logoutAdmin',logoutAdmin);//Admin cixisi
router.get('/api/loggedInAdmin',loggedInAdmin);//Admin hesabda var yoxsa yox
router.delete('/api/deleteAdmin/:id',deleteAdmin);//Admini silmek
module.exports =  router