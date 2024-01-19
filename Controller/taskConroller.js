//Every status code modifyed


//EXTERNAL LIBRARIES
const  mongoose  = require('mongoose');

//MODELS
const {Companies} = require('../Model/companyModel.js');
const {Folders} = require('../Model/folderForTaskModel.js');
const { Applys } = require("../Model/applyModel.js");

//UTILS
const {sendMail} = require('../Utils/EmailSend/SendEmail.js');//email,subject,content
const {generateHtmlForSendTaskToUser} = require('../Utils/GenerateHtmlForSendEmail/generateHtmlForSendTaskToUser.js');//username,positionName,companyName,companyLogo,deadline
const { validateRequiredFields } = require('../Utils/ValidateId/bodyValidator.js');

//SOCKET


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
        const apply = await Applys.findById(applyId);
        if(!apply) throw {status:404,message:'Apply does not exsist'};
        const {folder,endTime,numberOfTry} = apply.taskInfo;
        const differTime = new Date(joiningTime).getTime()-endTime.getTime();
        console.log(differTime);
        if(!folder) throw {status:404,message:'Task does not exsist for this user'};
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
        apply.taskInfo.numberOfTry = numberOfTry-1;
        await apply.save();
    //    const tasks = await Tasks.find({folder:mongoose.Types.ObjectId(folder)});
        return res.status(200).json({success:false,message:'Questions'+successConstants.fetchingSuccess.fetchedSuccesfully,data:tasks[0]});
    } catch (error) {
        next(error);
    }

}

const checkApplicantTask = async (req,res,next) => {
    const {folderId,applyId} = req.params;
    const {crtans} = req.body;
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
        for(let task of tasks){
            const submitedans = crtans[task._id];
            const correctAnswer = task.options.find((option) => option.isCorrect);
            console.log(submitedans===correctAnswer._id.toString())
            if(submitedans === correctAnswer._id.toString()){
                result+=task.point
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
        await apply.save();
        return res.status(200).json({success:true,result,correctedAnswers,message:'Calculated'});
    } catch (error) {
        next(error);
    }
}
//Sirket beyendiyi applicanta task gonderir
const companySendTasksFolderToApplicant = async (req,res,next) =>{
    const {companyId,applyId,folderId,endTime,numberOfTry} = req.body;
    await validateRequiredFields(req,res,'endTime');
    try {
        const [company,apply,folder] = await  Promise.all([   
            Companies.findById(companyId)
            .populate({
                path:'companyInfo',
                select:'logo'
            })
            ,
            Applys.findById(applyId)
            .populate({
                path:'user',
                select:'name email'
            })
            .populate({
                path:'job',
                select:'name'
            })
            ,
            Folders.findById(folderId)            
        ]);
        console.log(company)
        if(!company) throw {status:404,message:'Company'+errorConstants.userErrors.doesntExsist};
        if(!apply) throw {status:404,message:'Apply'+errorConstants.userErrors.doesntExsist};
        if(!folder) throw {status:404,message:'Folder'+errorConstants.userErrors.doesntExsist};
        const username = (apply?.user)?.name;
        const email = (apply?.user)?.email;
        const positionName = (apply?.job)?.name;
        const companyName = company?.name;
        const companyLogo = (company?.companyInfo)?.logo;
        // apply.folder = folderId
        apply.taskInfo.folder = folderId;
        apply.taskInfo.endTime = new Date(endTime);
        apply.taskInfo.numberOfTry = numberOfTry;
        //username,positionName,companyName,companyLogo,deadline
        await apply.save();
        const content = generateHtmlForSendTaskToUser(username,positionName,companyName,companyLogo,endTime);
        await sendMail('notification',email,"New Task Assignment",content);
        return res.status(200).json({success:true,message:'Task sended to succesfully'});
    } catch (error) {
        next(error);
    }
}
module.exports = {
    getFolders,
    creatFolder,
    creatTask,
    getFolderQuestionsForApplicant,
    checkApplicantTask,
    companySendTasksFolderToApplicant
}