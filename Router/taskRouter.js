const express = require('express');
const {getFolders,creatFolder,creatTask,getFolderQuestionsForApplicant,checkApplicantTask,companySendTasksFolderToApplicant,fetchUserTasks,detectIllegalActionOnExam,uploadexamscreenrocerder,getWaitingTasksEachCompany} = require('../Controller/taskConroller.js');
const auth = require('../Middleware/auth.js');
const router = express.Router();
const {upload} = require('../Utils/FileUpload/fileUpload.js');


router.get('/api/folders',auth,getFolders);

router.post('/api/creatfolder',auth,creatFolder);

router.post('/api/creattask',creatTask);

router.get('/api/getfolderquestionforapplicant/:applyId/:folderId',auth,getFolderQuestionsForApplicant);
router.get('/api/usertasks',auth,fetchUserTasks)
router.get('/api/getwaitingtask',auth,getWaitingTasksEachCompany);
router.post('/api/checkapplicanttask/:applyId/:folderId/:sendedTime',checkApplicantTask)
router.post('/api/examillegalactiondetector',detectIllegalActionOnExam);
router.put('/api/companysendtasksfoldertoapplicant',auth,companySendTasksFolderToApplicant);
router.post('/api/uploadexamscreenrocerder',upload('uploads',['webm']).single('file'),uploadexamscreenrocerder)
module.exports = router;