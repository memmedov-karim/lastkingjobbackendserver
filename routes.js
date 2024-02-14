const express = require('express');
const router = express.Router();
const userRouter = require('./Router/userRouter.js');
const adminRouter = require('./Router/adminRouter.js');
const companyRouter = require('./Router/companyRouter.js');
const jobRouter = require('./Router/jobRouter.js');
const applyRouter = require('./Router/applyRouter.js');
const newsletterRouter = require('./Router/newsletterRouter.js');
const useradmincompanyOtpRouter = require('./Router/useradmincompanyRouter.js');
const cvanalyzerRouter = require('./Router/cvAnalyzRouter.js');
const messageRouter = require('./Router/messageRouter.js');
const meetingRouter = require('./Router/meetingRouter.js');
const taskRouter = require('./Router/taskRouter.js');
const categoryRouter = require('./Router/categoryRouter.js');
const jobtypeRouter = require('./Router/jobtypeRouter.js')
const applystatusRouter = require('./Router/applystatusRouter.js');
const { default: axios } = require('axios');
router.use(userRouter);
router.use(adminRouter);
router.use(companyRouter);
router.use(jobRouter);
router.use(applyRouter);
router.use(newsletterRouter);
router.use(useradmincompanyOtpRouter);
router.use(cvanalyzerRouter);
router.use(messageRouter);
router.use(meetingRouter);
router.use(taskRouter);
router.use(categoryRouter);
router.use(jobtypeRouter);
router.use(applystatusRouter);

module.exports = router;
