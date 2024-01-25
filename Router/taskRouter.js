const express = require('express');
const {getFolders,creatFolder,creatTask,getFolderQuestionsForApplicant,checkApplicantTask,companySendTasksFolderToApplicant,fetchUserTasks} = require('../Controller/taskConroller.js');
const auth = require('../Middleware/auth.js');
const router = express.Router();



router.get('/api/folders',auth,getFolders);

router.post('/api/creatfolder',auth,creatFolder);

router.post('/api/creattask',creatTask);

router.get('/api/getfolderquestionforapplicant/:applyId/:folderId',auth,getFolderQuestionsForApplicant);
router.get('/api/usertasks',auth,fetchUserTasks)
router.post('/api/checkapplicanttask/:applyId/:folderId',checkApplicantTask)

router.put('/api/companysendtasksfoldertoapplicant',auth,companySendTasksFolderToApplicant);
module.exports = router;