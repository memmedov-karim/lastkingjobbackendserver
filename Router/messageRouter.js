const express = require('express');
const router = express.Router();
const {
    userMessagers,
    companyMessagers,
    userSendMessage,
    companySendMessage,
    getChatMessages
} = require('../Controller/messageController.js');
const auth = require('../Middleware/auth.js');
//<-------------------------------------GET REQUEST--------------------------------------->\\
router.get('/api/usermessagers',auth,userMessagers);
router.get('/api/companymessagers',auth,companyMessagers);
router.get('/api/chatmessages/:chatId',auth,getChatMessages);
//<---------------------------------------POST REQUEST------------------------------------>\\

router.post('/api/usersendmessage/:chatId',auth,userSendMessage);
router.post('/api/companysendmessage/:chatId',auth,companySendMessage);
module.exports = router;