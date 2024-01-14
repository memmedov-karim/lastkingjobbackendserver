const express = require('express');
const cors = require('cors');
const errorHandler = require('./Middleware/errorHandler.js')
// const cron = require('node-cron');
// cron.schedule('* * * * * *',()=>{
//   console.log("Crone works")
// })
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const { ConnectToDb } = require('./Db/db.js');
const cluster = require('cluster');
const os = require('os');
const path = require('path');
const http = require('http');
const socketIo = require('socket.io');
const app = express();
const {getPercentage} = require('./Utils/ProgressOfCv/ProgressCv.js')
// const generateHtmlForToSendApplyMessage = require('./Utils/GenerateHtmlForSendEmail/generateHtmlForSendApplyMessage.js');
// const cn = generateHtmlForToSendApplyMessage("karim","fron","kapital","log")
// const {calculateSimilarity} = require('./Utils/stringSearching/findMatchingStrings.js')
// const {sendMail} = require('./Utils/EmailSend/SendEmail.js');
// sendMail('notification','sixkerimmemmedov2001@gmail.com',"OTP TESTING","mikkoo");
// sendMail('notification','sixkerimmemmedov2001@gmail.com',"notifytesting TESTING","OTP tES is working");
// for(let i=0;i<10;i++){
//   sendMail('sixkerimmemmedov2001@gmail.com',"OTP TESTING","OTP tES is working");

// }
const server = http.createServer(app);
const { initializeSocket } = require('./socket.js');
// const {takeOnlyIllegalLinkFromData} = require('./Utils/LinksValidator/linksValidator.js')
const numCPUs = os.cpus().length;
dotenv.config();
// const thanksForRegister = require('./Utils/GenerateHtmlForSendEmail/thnaksForRegister.js')
// sendMail('sixkerimmemmedov2001@gmail.com',"thanks for register",thanksForRegister("Karim"))
// console.log(thanksForRegister("Karim"))
// sendMail('sixkerimmemmedov2001@gmail.com',"Login",
// `).catch(error=>console.log)
// Middleware
app.use(cors({
  origin: ['https://kingjob.vercel.app','http://localhost:3000','https://kigjob.com'],
  credentials: true
}));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

// Serve static files
app.use('/', express.static(path.join(__dirname, 'uploads')));
app.use('/', express.static(path.join(__dirname, 'logos')));
app.use('/', express.static(path.join(__dirname, 'userprofilepic')));
// Routers
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
const { default: axios } = require('axios');
app.use(userRouter);
app.use(adminRouter);
app.use(companyRouter);
app.use(jobRouter);
app.use(applyRouter);
app.use(newsletterRouter);
app.use(useradmincompanyOtpRouter);
app.use(cvanalyzerRouter);
app.use(messageRouter);
app.use(meetingRouter);
app.use(taskRouter);
app.use(categoryRouter);
app.use(jobtypeRouter);
//midleware
app.use(errorHandler);
ConnectToDb();
// const percentageOfCv = getPercentage('https://kingjobbackend.s3.eu-north-1.amazonaws.com/uploads/1694174057032-MyLastCv.pdf',['node','react','javascript','python','c#']);
// // console.log(percentageOfCv)
// percentageOfCv.then(dt=>console.log(dt))
//zolkxixiyxccfcpi
// Cluster setup
if (cluster.isMaster && process.env.NODE_ENV === 'production') {
  // Spawn workers equal to the number of CPUs
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }
} else {
  // Listen to port
  initializeSocket(server)
  const port = process.env.PORT;
  server.listen(port, () => {
    console.log(`Worker ${process.pid} is running on port ${port}`);
  });
}


// const t = new Date();
// console.log(t.toLocaleString());

//*************************************************************************\\
//My helper function in below
// async function createUserInfoForExistingUsers() {
//     try {
//       const existingUsers = await Companies.find(); 
  
//       for (const user of existingUsers) {

//         const newUserInfo = new CompanyInfo({
//           company: user._id,
//           info: "",
//           logo:null,
       
//         });
  
//         await newUserInfo.save();
//         user.companyInfo= newUserInfo._id;
//         await user.save();
//       }
  
//       console.log('UserInfo documents created for all existing users.');
//     } catch (err) {
//       console.error('Error creating userInfo documents:', err);
//     }
//   }
//   createUserInfoForExistingUsers();
