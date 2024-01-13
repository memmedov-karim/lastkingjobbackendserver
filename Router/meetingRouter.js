const express = require("express");
const router = express.Router();
const auth = require("../Middleware/auth.js");
const {makeAnAppointment,getAllMeetings,getMeetingsEachUser,getMeetingsEachCompany,checkMeetingBetweenUserAndCompanyAndSet} = require("../Controller/meetingController.js");
router.get('/api/getAllMeetings',getAllMeetings) //Umumi goruslerin api-si
router.get('/api/getMeetingsEachUser/:id',getMeetingsEachUser) //Her user ucun olan gorus api-si
router.get('/api/getMeetingsEachCompany/:id',getMeetingsEachCompany) //Her sirketin gorusu


router.post('/api/makeAnAppointment/:id',makeAnAppointment) //Sirket beyendiyi muraciet sahibi ile gorus teyin edir
router.post('/api/checkMeetingBetweenUserAndCompanyAndSet',auth,checkMeetingBetweenUserAndCompanyAndSet);





module.exports =  router;