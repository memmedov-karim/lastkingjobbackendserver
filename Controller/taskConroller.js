//Every status code modifyed


//EXTERNAL LIBRARIES
const  mongoose  = require('mongoose');
const axios = require('axios')
//MODELS
const {Companies} = require('../Model/companyModel.js');
const {Folders} = require('../Model/folderForTaskModel.js');
const { Applys } = require("../Model/applyModel.js");
const {UserInfo} = require("../Model/userInfoModel.js")
//UTILS
const {sendMail} = require('../Utils/EmailSend/SendEmail.js');//email,subject,content
const {generateHtmlForSendTaskToUser} = require('../Utils/GenerateHtmlForSendEmail/generateHtmlForSendTaskToUser.js');//username,positionName,companyName,companyLogo,deadline
const { validateRequiredFields } = require('../Utils/ValidateId/bodyValidator.js');

//SOCKET
const {getSocketInstance,getConnectedUsers} = require('../socket.js')

//CONSTANTS
const {successConstants} = require('../Utils/Constants/successConstants.js');
const {errorConstants} = require('../Utils/Constants/errorConstants.js');


const getFolders = async (req,res,next) => {
    const {user_id:companyId} = req.user;
    try {
        const fodlers = await Folders.find({company:companyId})
        return res.status(200).json({success:true,message:'Folders'+successConstants.fetchingSuccess.fetchedSuccesfully,data:fodlers});
        
    } catch (error) {
        next(error);
    }
}

const creatFolder = async (req,res,next) => {
    const {name,descriptionOfTask} = req.body;
    const {user_id:company} = req.user
    try {
        await validateRequiredFields(req,res,'name','descriptionOfTask');
        const companys = await Companies.findById(mongoose.Types.ObjectId(company));
        if(!companys) throw {status:404,message:'Company not found'};
        const exsistingFolder = await Folders.findOne({company:mongoose.Types.ObjectId(company),name:name.toLowerCase()});
        if(exsistingFolder) throw {status:400,message:`You created folder called ${name},please use another name`};
        const newFolder = new Folders({
            company,name:name.toLowerCase(),description:descriptionOfTask,questions:[]
        });
        const saved = await newFolder.save();
        return res.status(200).json({success:true,message:`${name.toLowerCase()} folder`+successConstants.updatingSuccess.addedSuccesfully,data:saved});
    } catch (error) {
        next(error);
    }
}

const creatTask = async (req,res,next) => {
    const {folder,question,options,point} = req.body;
    try {
        console.log(0)
        await validateRequiredFields(req,res,'folder','question');
        if(options.length === 0) throw {status:400,message:'Please select minimum 2 options'};
        console.log(1)
        const exsistingFolder = await Folders.findById(mongoose.Types.ObjectId(folder));
        console.log(2)
        if(!exsistingFolder) throw {status:404,message:'Folder'+errorConstants.userErrors.doesntExsist};
        console.log(3)
        // if(exsistingFolder.question.trim()===question.trim()) throw
        const havequestion = exsistingFolder.questions.some(q=>q.question.toLowerCase()===question.toLowerCase().trim());
        if(havequestion) throw {status:400,message:'This question already exsist'}
        const filteredAnswers =  options.filter(answer=>answer.isCorrect);
        console.log(4)
        if(filteredAnswers.length >1) throw {status:400,message:'You can select only 1 correct variant'}
        console.log(5)
        if(filteredAnswers.length === 0) throw {status:400,message:'You must select 1 correct answer'}
        console.log(6)
        exsistingFolder.questions.push({question,options,point})
        console.log(7)
        // const newTask = new Tasks({
        //     folder,question,options,point
        // });
        await exsistingFolder.save();
        console.log(8)
        return res.status(200).json({success:true,message:`Task added to ${exsistingFolder.name} succesfully!`,data:exsistingFolder}); 
    } catch (error) {
        next(error);
    }
}

const  getFolderQuestionsForApplicant = async (req,res,next) => {
    const {folderId,applyId} = req.params;
    const {joiningTime} = req.body;
    try {
        // const folder = await Folders.findById(folderId);
        // if(!folder) return res.status(200).json({succes:false,message:'There is not folder with the given Id!'});
        const apply = await Applys.findById(applyId)
        if(!apply) throw {status:404,message:'Apply does not exsist'};
        const {folder,endTime,numberOfTry,startDate} = apply.taskInfo;
        const differTime = new Date(joiningTime || new Date()).getTime()-endTime.getTime();
        const differTime1 = new Date(joiningTime || new Date()).getTime()-startDate.getTime();
        console.log(differTime);
        if(!folder) throw {status:404,message:'Task does not exsist for this user'};
        if(differTime1<0) throw {status:400,message:'Exam does not started yet'};
        if(differTime >0) throw {status:400,message:'You deadline expired'};
        if(numberOfTry === 0) throw {status:400,message:'You can not join this task,because your limit is 0'};
        const tasks = await Folders.aggregate([
            {$match : {_id : mongoose.Types.ObjectId(folderId)}},
            {
                $project: {
                    name:1,
                    description:1,
                    _id:1,
                 questions:{
                  question: 1,
                  _id:1,
                  point: 1,
                  createdAt: 1,
                  updatedAt: 1,
                  __v: 1,
                  options: {
                    ans: 1,
                    _id: 1,
                  },
                },
            }
              },
        ])
        
    //    const tasks = await Tasks.find({folder:mongoose.Types.ObjectId(folder)});
        return res.status(200).json({success:false,message:'Questions'+successConstants.fetchingSuccess.fetchedSuccesfully,data:tasks[0],additionalInfo:apply.taskInfo});
    } catch (error) {
        next(error);
    }

}

const checkApplicantTask = async (req,res,next) => {
    const {folderId,applyId,sendedTime} = req.params;
    const {crtans} = req.body;
    console.log(req.body)
    try {
        const [folder,apply] = await Promise.all([
            Folders.findById(folderId),
            Applys.findById(applyId)
        ])
        if(!apply) throw {status:404,message:'Apply'+errorConstants.userErrors.doesntExsist};
        if(!folder) throw {status:404,message:'Folder'+errorConstants.userErrors.doesntExsist};
        const tasks = folder.questions;
        const correctAnswers = {};
        let result = 0;
        let correct = 0;
        let empty = 0;
        for(let task of tasks){
            const submitedans = crtans[task._id];
            const correctAnswer = task.options.find((option) => option.isCorrect);
            console.log(submitedans===correctAnswer._id.toString())
            if(submitedans === null){
                empty+=1;
            }
            if(submitedans === correctAnswer._id.toString()){
                result+=task.point;
                correct+=1;
            }
        }
        const correctedAnswers = folder.questions.map((item,index) => ({
            index:index+1,
            questionId: item._id,
            correctVariantId:item.options.find(option => option.isCorrect)?._id,
            correctVariant: item.options.find(option => option.isCorrect)?.ans
        }));
        console.log(correctAnswers);
        apply.taskInfo.totalPoint = result;
        apply.taskInfo.correct = correct;
        apply.taskInfo.wrong =tasks?.length-correct-empty ;
        apply.taskInfo.empty = empty;
        const sendedTimeInBaku = new Date(sendedTime);
        sendedTimeInBaku.setHours(sendedTimeInBaku.getHours() + 4);
        apply.taskInfo.sendedTime = sendedTimeInBaku;
        apply.taskInfo.numberOfTry -=1;
        console.log(sendedTime)
        await apply.save();
        return res.status(200).json({success:true,result,d:{correct,empty,wrong:tasks?.length-correct-empty},correctedAnswers,message:'Calculated'});
    } catch (error) {
        next(error);
    }
}
//Sirket beyendiyi applicanta task gonderir
const companySendTasksFolderToApplicant = async (req,res,next) =>{
    const {user_id:companyId} = req.user;
    const {applyIds,folderId,endTime,numberOfTry,examdurationTime,startDate} = req.body;
    console.log(req.body)
    await validateRequiredFields(req,res,'endTime');
    try {
        const [company,folder] = await  Promise.all([   
            Companies.findById(companyId)
            .populate({
                path:'companyInfo',
                select:'logo'
            })
            ,
            Folders.findById(folderId)            
        ]);
        // console.log(company)
        if(!company) throw {status:404,message:'Company'+errorConstants.userErrors.doesntExsist};
        if(!folder) throw {status:404,message:'Folder'+errorConstants.userErrors.doesntExsist};
        const batchSize = 20;
        const applyersCount = applyIds.length;

        for (let i = 0; i < applyersCount; i += batchSize) {
            const batchIds = applyIds.slice(i, i + batchSize);
            
            const result = await Applys.updateMany(
                { _id: { $in: batchIds } },
                {
                    $set: {
                        'taskInfo.folder': folderId,
                        'taskInfo.endTime': new Date(endTime),
                        'taskInfo.numberOfTry': numberOfTry,
                        'taskInfo.examdurationTime':examdurationTime,
                        'taskInfo.startDate':startDate,
                        'taskInfo.illegalDetection':[],
                        'taskInfo.sendedTime':null
                    }
                }
            );

            console.log(result.modifiedCount);

            for (const applyId of batchIds) {
                const apply = await Applys.findById(applyId)
                    .populate({
                        path: 'user',
                        select: 'name email'
                    })
                    .populate({
                        path: 'job',
                        select: 'name'
                    });

                if (apply) {
                    const username = apply.user.name;
                    const email = apply.user.email;
                    const positionName = apply.job.name;
                    const companyName = company.name;
                    const companyLogo = company.companyInfo.logo;
                    const content = await generateHtmlForSendTaskToUser(username, positionName, companyName, companyLogo);
                    await sendMail('notification', email, 'Yeni tapşırıq', content);
                }
                const usId = apply?.user?._id;
                const notificationData = {company:companyId,type:"exam"}
                await UserInfo.findOneAndUpdate({user:usId},{$push:{notifications:notificationData}});
                const io = getSocketInstance();
                // console.log(io.sockets.adapter.rooms)
                const onlineUsers = getConnectedUsers();
                // console.log(onlineUsers);
                const receiverId = usId?.toString();
                const lastOnlineUsers = Object.keys(onlineUsers)
                const receiverIsOnline = lastOnlineUsers.includes(receiverId);
                console.log(receiverIsOnline)
                // console.log(receiverId)
                if(io && receiverIsOnline){
                    io.to(receiverId).emit('notification',{companyName:company?.name,      type:"exam"});
                }

            }
        }
        return res.status(200).json({success:true,message:'Task sended to succesfully '+applyIds.length + " users"});
    } catch (error) {
        next(error);
    }
}

const fetchUserTasks = async (req,res,next) => {
    const {user_id} = req.user;
    try {
        const applys = await Applys.aggregate([
            {$match:{user:new mongoose.Types.ObjectId(user_id),'taskInfo.folder':{$ne:null}}},
            {
                $lookup:{
                    from:'jobs',
                    localField:'job',
                    foreignField:'_id',
                    as:'jobInfo'
                }
            },
            {$unwind:'$jobInfo'},
            {
                $lookup:{
                    from:'companies',
                    localField:'jobInfo.company',
                    foreignField:'_id',
                    as:'companyInfo'
                }
            },
            {$unwind:'$companyInfo'},
            {
                $lookup:{
                    from:'companyinfos',
                    localField:'companyInfo.companyInfo',
                    foreignField:'_id',
                    as:'companyInfoInfo'
                }
            },
            {$unwind:'$companyInfoInfo'},
            {
                $lookup:{
                    from:'folders',
                    localField:'taskInfo.folder',
                    foreignField:'_id',
                    as:'taskInfoInfo'
                }
            },
            {$unwind:'$taskInfoInfo'},
            {
                $project:{
                    createdAt:1,
                    taskInfo:1,
                    companyName:'$companyInfo.name',
                    companyLogo:'$companyInfoInfo.logo',
                    jobName:'$jobInfo.name',
                    taskInfoInfo:{
                        name:1,
                        numOfQuestion:{$size:'$taskInfoInfo.questions'},
                        description:1
                    }

                }
            }
        ]);

        return res.status(200).json({success:true,message:'Fetched',data:applys})
    } catch (error) {
        next(error);
    }
}

const detectIllegalActionOnExam = async (req,res,next) => {
    const {applyerId} = req.body;
    console.log(req.body)
    try {
        const apply = await Applys.findById(applyerId);
        if(!apply) throw {status:404,message:'Apply not found'};
        const {taskInfo} = apply;
        if(!taskInfo.folder) throw {status:404,message:'Exam not found'};
        apply.taskInfo.illegalDetection.push(req.body)
        await apply.save();
        return res.status(200).json({success:true,message:''})
    } catch (error) {
        next(error)
    }
}

const uploadexamscreenrocerder = async (req,res,next) => {
    try {
        console.log(req.file)
    } catch (error){
        next(error);
    }
}

const getWaitingTasksEachCompany = async (req, res, next) => {
    const { user_id: company_id } = req.user;

    try {
        const companyapplyes = await Applys.aggregate([
            {$match:{'taskInfo.folder':{$ne:null}}},
            {
                $lookup: {
                    from: 'jobs',
                    localField: 'job',
                    foreignField: '_id',
                    as: 'jobInfo'
                }
            },
            { $unwind: '$jobInfo' },
            { $match: { 'jobInfo.company': mongoose.Types.ObjectId(company_id) } },
            {
                $lookup: {
                    from: 'users',
                    localField: 'user',
                    foreignField: '_id',
                    as: 'userInfo'
                }
            },
            { $unwind: '$userInfo' },
            {
                $lookup: {
                    from: 'userinfos',
                    localField: 'userInfo.userinfo',
                    foreignField: '_id',
                    as: 'userInfoInfo'
                }
            },
            { $unwind: '$userInfoInfo' },
            {
                $lookup: {
                    from: 'folders',
                    localField: 'taskInfo.folder',
                    foreignField: '_id',
                    as: 'taskInfoInfo'
                }
            },
            {
                $unwind: {
                    path: '$taskInfoInfo',
                    preserveNullAndEmptyArrays: true  // Preserve if the array is empty or null
                }
            },
            {
                $project: {
                    job: 1,
                    taskInfo: {
                        $mergeObjects: [
                            '$taskInfo',
                            { name: { $ifNull: ['$taskInfoInfo.name', null] } },
                            { numOfQuestion: { $size: { $ifNull: ['$taskInfoInfo.questions', []] } } }
                        ]
                    },
                    jobName: '$jobInfo.name',
                    userName: '$userInfo.name',
                }
            }
            
        ]);
        return res.status(200).json({ success: true, message: 'fetched', data: companyapplyes });
    } catch (error) {
        next(error);
    }
};
module.exports = {
    getFolders,
    creatFolder,
    creatTask,
    getFolderQuestionsForApplicant,
    checkApplicantTask,
    companySendTasksFolderToApplicant,
    fetchUserTasks,
    detectIllegalActionOnExam,
    uploadexamscreenrocerder,
    getWaitingTasksEachCompany
}