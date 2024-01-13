const express = require('express');
const {getFolders,creatFolder,creatTask,getFolderQuestionsForApplicant,checkApplicantTask,companySendTasksFolderToApplicant} = require('../Controller/taskConroller.js');

const router = express.Router();



router.get('/api/folders',getFolders);

router.post('/api/creatfolder',creatFolder);

router.post('/api/creattask',creatTask);

router.get('/api/getfolderquestionforapplicant/:applyId/:folderId',getFolderQuestionsForApplicant);

router.get('/api/checkapplicanttask/:applyId/:folderId',checkApplicantTask)

router.put('/api/companysendtasksfoldertoapplicant',companySendTasksFolderToApplicant);
module.exports = router;