const express = require('express');
const router = express.Router();
const {
    userMessagers,
    userSendMessage,
    companySendMessage,
    getChatMessages
} = require('../Controller/messageController.js');
const auth = require('../Middleware/auth.js');
//<-------------------------------------GET REQUEST--------------------------------------->\\
router.get('/api/usermessagers',auth,userMessagers);
router.get('/api/chatmessages/:chatId',getChatMessages);
//<---------------------------------------POST REQUEST------------------------------------>\\

router.post('/api/usersendmessage/:chatId',userSendMessage);
router.post('/api/companysendmessage/:chatId',companySendMessage);
module.exports = router;