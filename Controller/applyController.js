//Every status code modifyed



//EXTERNAL LIBRARIES
const cron = require('node-cron');
const path = require('path');
const mongoose = require("mongoose");
const axios = require('axios');
const { AggregateGroupByReducers } = require("redis");

//MODELS
const { Applys } = require("../Model/applyModel.js");
const { Companies } = require("../Model/companyModel.js");
const { Users } = require("../Model/userModel.js");
const { Jobs } = require("../Model/jobModel.js");
const { Meetings } = require("../Model/meetingModel.js");
const { CompanyInfo } = require("../Model/companyInfoModel.js")
const { Chats } = require("../Model/chatModel.js");
const { UserInfo } = require("../Model/userInfoModel.js");



//UTILS
const {sendMail} = require("../Utils/EmailSend/SendEmail.js");
const {generateHtmlForToSendApplyMessage} = require('../Utils/GenerateHtmlForSendEmail/generateHtmlForSendApplyMessage.js');
const {generateHtmlForSendRejectStatusToUser} = require('../Utils/GenerateHtmlForSendEmail/generateHtmlForSendRejectStatusToUser.js');
const {generateHtmlForSendSuccesMessageForPassedFirstLevel} = require('../Utils/GenerateHtmlForSendEmail/generateHtmlForSendSuccesMessageForPassedFirstLevel.js')
const {deleteFile} = require('../Utils/FileDelete/fileDelete.js');
const {messageSenderToTelegram} = require("../Utils/TelegramBot/messageSenderToTelegram.js");
const {getPercentage} = require('../Utils/ProgressOfCv/ProgressCv.js');
const {checkUser} = require('../Utils/useLoginChecker/useLoginChecker.js');
const {upload} = require('../Utils/FileUpload/fileUpload.js');
const {sendNotificationToUser} = require('../Controller/userController.js')
const { validateRequiredFields } = require('../Utils/ValidateId/bodyValidator.js');


//CONSTANTS
const {errorConstants} = require('../Utils/Constants/errorConstants.js');
const {successConstants} = require('../Utils/Constants/successConstants.js');



//SOCKETS
const {getSocketInstance} = require('../socket.js')




// const Queue = require('bull')
// const emailQueue = new Queue('emails');
// emailQueue.process(async (job) => {
//     const { userEmail, userName, jobName, companyName, companyLogo, endTime } = job.data;
//     console.log(job.data)
//     const content = await generateHtmlForSendRejectStatusToUser(userName, jobName, companyName, companyLogo, endTime.toString().split('T')[0]);
  
//     await sendMail(userEmail, "Application Status Update", `Salam ${userName} bugun gələn mail bir yalışlıq nəticəsində olub buna görə üzr istəyirik seçim mərhələsi hələ bitməyib biz sizin ikə yenidən əlaqə quracıq`);
//   });
const getPdf = async (req,res,next) => {
    try{
        const response = await axios.get(req.query.url, {
            responseType: 'arraybuffer',
            headers: {
              'Accept': 'application/pdf',
            },
          });
          res.setHeader('Content-Type', 'application/pdf');
          res.send(response.data);

    } catch(error){
        next(error);
    }
}
//1-Umumi muracietlerin api-si
const getApplys = async (req,res,next) => {
    // console.log(getContent())
    // console.log("user loggedin",checkUser(req,res))
    try {
        const applys = await Applys.aggregate([
            {
                $lookup:{
                    from:'users',
                    localField:'user',
                    foreignField:'_id',
                    as:'userInfo'
                }
            },
            {$unwind:'$userInfo'},
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
                $project:{
                    file:1,
                    status:1,
                    show:1,
                    isDate:1,
                    dateTime:1,
                    isFinish:1,
                    folder:1,
                    userName:'$userInfo.name',
                    userEmail:'$userInfo.email',
                    jobName:'$jobInfo.name',
                    jobCategory:'$jobInfo.category',
                    companyName:'$companyInfo.name'
                }
            }
        ])
        // .populate({
        //     path:'user',
        //     select:'name email',
        // })
        // .populate({
        //     path:'job',
        //     select:'category name',
        //     populate:{
        //         path:'company',
        //         select:'name email',
            
        //     }
        // })

        return res.status(200).json({success:true,message:"Applys"+successConstants.fetchingSuccess.fetchedSuccesfully,data:applys})
    } catch (error) {
        next(error);
        
    }
}
//2-Her bir userin muraciet etdiyi islerin api-si
const getApplysForEachUser = async (req,res,next) => {

    const {user_id} = req.user;
    try {
        const user = await Users.findById(user_id);
        if(!user) throw {status:404,message:errorConstants.userErrors.userdoesntExsist}
        const applys = await Applys.aggregate([
            {$match:{user:mongoose.Types.ObjectId(user_id)}},
            {
                $lookup:{
                    from:'users',
                    localField:'user',
                    foreignField:'_id',
                    as:'userInfo'
                }
            },
            {$unwind:'$userInfo'},
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
                    from:'categories',
                    localField:'jobInfo.category',
                    foreignField:'_id',
                    as:'categoryInfo'
                }
            },
            {$unwind:'$categoryInfo'},
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
                    from:'applystatuses',
                    localField:'status',
                    foreignField:'_id',
                    as:'statusInfo'
                }
            },
            {$unwind:'$statusInfo'},
            {
                $project:{
                    createdAt:1,
                    file:1,
                    status:{name:'$statusInfo.name',color:'$statusInfo.color',_id:'$statusInfo._id'},
                    taskInfo:1,
                    companyName:'$companyInfo.name',
                    companyLogo:'$companyInfoInfo.logo',
                    jobName:'$jobInfo.name',
                    jobCity:'$jobInfo.city',
                    jobType:'$jobInfo.type',
                    category:'$categoryInfo.name',
                    jobId:'$jobInfo._id'

                }
            }
        ])
        // .populate({
        //     path:'user',
        //     select:'name email phoneNumber'
        // })
        // .populate({
        //     path:'job',
        //     select:'category name',
        //     populate:{
        //         path:'company',
        //         select:'name email',
        //         populate:{
        //             path:'companyInfo',
        //             select:'logo'
        //         }
        //     }
        // })
        return res.status(200).json({success:true,message:"User applys"+successConstants.fetchingSuccess.fetchedSuccesfully,data:applys})
    } catch (error) {
        next(error);
    }
}
const getApplysForEachCompanyOnlyTestLevel = async (req,res,next) => {
    const {company_id} = req.params;
    try {
        const companyapplyes = await Applys.aggregate([
            {
                $lookup:{
                    from:'jobs',
                    localField:'job',
                    foreignField:'_id',
                    as:'jobInfo'
                }
            },
            {$unwind:'$jobInfo'},
            {$match:{'jobInfo.company':mongoose.Types.ObjectId(company_id)}},
            {
                $lookup:{
                    from:'users',
                    localField:'user',
                    foreignField:'_id',
                    as:'userInfo'
                }
            },
            {$unwind:'$userInfo'},
            {
                $project:{
                    job:1,
                    file:1,
                    status:1,
                    userName:'$userInfo.name',
                    userEmail:'$userInfo.email',
                    jobName:'$jobInfo.name',
                }
            },
            // {
            //     $group: {
            //         _id: '$job', // Group by the job ID
            //         jobName:{ $first: '$jobName' },
            //         applies: { $push: '$$ROOT' } // Collect all applies for the same job
            //     }
            // }

        ])

        console.log(companyapplyes)

        return res.status(200).json({success:true,message:'fetched',data:companyapplyes})
    } catch (error) {
        next(error);
    }
}
//3-Her bir sirkete gelen is muracietleri
const getApplysForEachCompany = async (req,res,next) => {
    const company_id = req.params.id
    try {
        const company = await Companies.findById(company_id)
        if(!company) throw {status:404,message:'Company'+errorConstants.userErrors.doesntExsist};
        const applysForEachCompany = await Applys.find({ company: company_id })
      .populate({
        path:'job',
        select:'name category',
        populate:{
            path:'company',
            select:'name email',
            populate:{
                path:'companyInfo',
                select:'logo'
            }
        }
      })
      .populate({
        path:'user',
        select:'name email userinfo file',
        populate:{
            path:'userinfo',
            select:'profilepic birthday user'
        }
      }) // Assuming 'name' is the field containing the job name in the 'jobs' 
      .lean();
        const result = applysForEachCompany.reduce((acc, apply) => {
            const { job, ...rest } = apply;
            if (acc[job._id]) {
              acc[job._id].applys.push(rest);
            } else {
              acc[job._id] = {
                job: {
                  _id: job._id,
                  jobname: job.name,
                  category:job.category,
                  company:job.company
                },
                applys: [rest],
              };
            }
            return acc;
          }, {});
        return res.status(200).json({success:true,message:"Company applys"+successConstants.fetchingSuccess.fetchedSuccesfully,data:Object.values(result)});
    } catch (error) {
        next(error);
    }
}
//4-Userin is ucun muraciet etdiyi api
const postApply = async (req,res,next) => {
    const {user_id:user} = req.user;
    let {job} = req.body;
    const file = req.file || null;
    try {
        const users = await Users.findById(user);
        if(!users) throw {status:404,message:errorConstants.userErrors.userdoesntExsist};
        // if(file === null) throw {status:400,message:'Please select correct format for cv'};
        if(file && file.mimetype !== 'application/pdf') throw {status:400,message:'Cv file must be in pdf format'};
        const jobs = await Jobs.aggregate([
            {$match:{_id:mongoose.Types.ObjectId(job)}},
            {
              $lookup: {
                from: 'companies',
                localField: 'company',
                foreignField: '_id',
                as: 'companyInfo',
              },
            },
            {
              $unwind: '$companyInfo',
            },
            {
              $lookup: {
                from: 'companyinfos',
                localField: 'companyInfo.companyInfo',
                foreignField: '_id',
                as: 'companyInfoData',
              },
            },
            {
              $unwind: '$companyInfoData',
            },
            {
              $project: {
                category: 1,
                subCategory: 1,
                name: 1,
                city: 1,
                type: 1,
                experience: 1,
                education: 1,
                descriptionOfVacancy: 1,
                specialRequirements: 1,
                skills: 1,
                salary: 1,
                numberOfViews: 1,
                numberOfApplys: 1,
                premium: 1,
                endTime: 1,
                createdAt: 1,
                updatedAt: 1,
                autoDelete: 1,
                active: 1,
                companyName: '$companyInfo.name',
                companyId: '$companyInfo._id',
                logo: '$companyInfoData.logo',
              },
            },
          ]);
        if(!jobs || jobs.length ===0) throw {status:404,message:'Job not found'};
        const {companyId:companyInfoId} = jobs[0];
        const userInfo = await UserInfo.findOne({user});
        if(file===null && userInfo.file==="") throw {status:404,message:'You have not cv in your profile'}
        const applyOne = await Applys.find({user,job});
        // console.log(applyOne)
        if(applyOne.length!==0) throw {status:400,message:'You can apply one time'};
        console.log("after apply")
        // console.log(req.body)
        // const filePath = path.join(__dirname, '..','public' ,'uploads', myCv ? users.file : file.filename);
        // console.log(filePath)
        const lastFile = file ? file.location : userInfo?.file
        const percentageOfCv = await getPercentage(lastFile,jobs[0].skills);
        // console.log("faiz",percentageOfCv)
        const newApply = new Applys({
            user:user,
            job:job,
            file: lastFile,
            percentageOfCv
        })
        const savedApply = await newApply.save();
        // console.log(user,(jobs?.company)?._id.toString())
        const exsistedChat = await Chats.findOne({user:user,company:jobs[0].companyId});
        // console.log(exsistedChat)
        if(!exsistedChat){
            const newChat = new Chats({
                user:user,
                company:jobs[0].companyId
            })
            const newchat = await newChat.save();
        }
        const content = generateHtmlForToSendApplyMessage(users?.name,jobs[0].name,jobs[0].companyName,jobs[0].logo);
        await sendMail('notification',users.email,"Application Feedback",content);
        const updatedJob = await Jobs.findByIdAndUpdate(job,{$inc : {numberOfApplys:1}},{new:true})
        const checkcvHasnot = (userInfo.file==="");
        if(checkcvHasnot){
            await UserInfo.findByIdAndUpdate(users.userinfo,{file:file.location})
        }
        const updatedCompany = await CompanyInfo.findByIdAndUpdate(companyInfoId,{$inc:{applynum:1}},{new:true});
        // console.log(updatedCompany)
        return res.status(200).json({success:true,message:`Your apply as a ${jobs[0].name} at ${jobs[0].companyName} sended successfully to ${jobs[0].companyName} ${checkcvHasnot ? 'We set this cv to your profile' : ''}`,data:{...jobs[0],numberOfApplys:updatedJob.numberOfApplys}});

    } catch (error) {
        next(error);
    }
}
//5-Umumi qebul edilen muracietlerin siyahisi
const getAcceptedApplys = async (req,res,next) => {
    try {
        const acceptedApplys = await Applys.find({status:"approved"});
        return res.status(200).json({success:true,message:"Accepted applys"+successConstants.fetchingSuccess.fetchedSuccesfully,data:acceptedApplys});
        
    } catch (error) {
        next(error);
    }
}
//6-Her bir sirketin qebul etdiyi muracietlerin api-si
const getAcceptedApplysEachCompany = async (req,res,next) => {
    const company_id = req.params.id;
    try {
        const company = await Companies.findById(company_id);
        if(!company) throw {status:404,message:'Company'+errorConstants.userErrors.doesntExsist};
        const acceptedApplys = await Applys.find({status:"approved"})
        .populate({
            path:'job',
            select:'name category',
            populate:{
                path:'company',
                match:{_id:company_id},
                select:'name email',
                populate:{
                    path:'companyInfo',
                    select:'logo'
                }
            }
        });
        const result = acceptedApplys.filter(obj=>(obj.job).company!==null);
        return res.status(200).json({success:true,message:"Accepted applys for each company fetched succesfully",data:result});
    } catch (error) {
        next(error);
    }
}
//7-Sirketin beyendiyi muracietleri qebul etdiyi api
const companyAcceptUserApply = async (req,res,next) => {
    const appy_id = req.params.id;
    const {status} = req.body;
    if(!['pending','approved','thinking','rejected'].includes(status)) throw {status:400,message:'Invalid status string'};
    try {
        const apply = await Applys.aggregate([
            {$match:{_id:mongoose.Types.ObjectId(appy_id)}},
            {
                $lookup:{
                    from:'users',
                    localField:'user',
                    foreignField:'_id',
                    as:'userInfo'
                }
            },
            {$unwind:'$userInfo'},
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
                    as:'companyInfoData'
                }
            },
            {$unwind:'$companyInfoData'},
            {
                $project:{
                    createdAt:1,
                    userId:'$user',
                    job:'$job',
                    file:1,
                    status:1,
                    userName:'$userInfo.name',
                    userEmail:'$userInfo.email',
                    jobName:'$jobInfo.name',
                    companyName:'$companyInfo.name',
                    companyLogo:'$companyInfoData.logo'
                }
            }

        ]);
        if(!apply || apply[0].length === 0) throw {status:404,message:'Apply'+errorConstants.userErrors.doesntExsist}
        const {_id,createdAt,job,file,userId,userName,userEmail,jobName,companyName,companyLogo} = apply[0];
        const updatedApply = await Applys.findByIdAndUpdate(appy_id,{$set:{status:status}},{new:true});
        let cnt="";
        if(status === 'approved'){
            cnt = await generateHtmlForSendSuccesMessageForPassedFirstLevel(userName,jobName,companyName,companyLogo,createdAt.toISOString().split('T')[0]);
        }
        else if(status === 'rejected'){
            cnt = await generateHtmlForSendRejectStatusToUser(userName,jobName,companyName,companyLogo,createdAt.toISOString().split('T')[0]);
        }
        if(cnt){
            await sendMail('notification',userEmail,"Application Status Update",cnt);

        }
        
        // const result = await sendNotificationToUser(userId,appy_id,'3')
        // const io = getSocketInstance();
        // if(io && userId){
        //     io.to(userId.toString()).emit('notification',result);
        // }
        const newData = {_id,job,file,status,userName,userEmail,jobName}
        return res.status(200).json({success:true,message:`${userName} apply accepted succesfully`,data:newData});
    } catch (error) {
        next(error);
    }
}
//8-Umumi muracietleri beyenilmeyen api-si
const getUserRemovedApplysAll = async (req,res,next) => {
    try {
        const deletedApplys = await Applys.find({status:"rejected"})
        .populate({
            path:'user',
            select:'name email'
        })
        .populate({
            path:'job',
            select:'name category',
            populate:{
                path:'company',
                select:'name email',
                populate:{
                    path:'companyInfo',
                    select:'logo'
                }
            }
        })
        return res.status(200).json({success:true,message:"RemovedApplysAll fetched succesfully",data:deletedApplys});
    } catch (error) {
        next(error);
    }
}
//9-Her bir userin beyenilmeyen muracietlerinin api-si
const getRemovedApplysEachUser = async (req,res,next) => {
    const user_id = req.params.id
    try {
        const user = await Users.findById(user_id);
        if(!user) throw {status:404,message:errorConstants.userErrors.doesntExsist};
        const deletedApplys = await Applys.find({status:"rejected"})
        .populate({
            path:'user',
            match:{_id:user_id},
            select:'name email'
        })
        .populate({
            path:'job',
            select:'name category',
            populate:{
                path:'company',
                select:'name email',
                populate:{
                    path:'companyInfo',
                    select:'logo'
                }
            }
        })
        const result = deletedApplys.filter(obj=>obj.user!==null);
        return res.status(200).json({success:true,message:"RemovedApplysForEachUser fetched succesfully",data:result});
    } catch (error) {
        next(error);
    }
}
//10-Company muracieti silmek ucun api-si
const companyDeleteApply = async (req,res,next) => {
    const apply_id = req.params.id;
    try {
        const apply = await Applys.findById(apply_id)
        .populate({
            path:'user',
            select:'name email'
        })
        .populate({
            path:'job',
            select:'name category',
            populate:{
                path:'company',
                select:'name email',
                populate:{
                    path:'companyInfo',
                    select:'logo'
                }
            }
        });
        
        if(!apply) throw {status:404,message:'Apply'+errorConstants.userErrors.doesntExsist};
        const {name:userName,email:userEmail,_id:userId} = apply.user;
        const {_id:companyId,name:companyName} = (apply.job).company;
        const {status} = apply;
        const company = await Companies.findById(companyId);
        if(!company) throw {status:404,message:'Company'+errorConstants.userErrors.doesntExsist};
        await Applys.findByIdAndUpdate(apply_id,{$set:{show:false}});
        if(status!=="approved"){
            await Applys.findByIdAndUpdate(apply_id,{$set:{status:"rejected"}});
            sendMail(userEmail,"Applys for job",`dear ${userName}, your application was considered by ${companyName}, we regret to inform you that it was not successful this time, so don't be upset, it will definitely be successful one day`);
            const result = await sendNotificationToUser(userId,apply_id,'2');
            const io = getSocketInstance();
            if(io && userId){
                // console.log(((apply.user)._id).toString())
                io.to(userId.toString()).emit('notification',result);
            }

            // console.log(result)
        }
        return res.status(200).json({success:true,message:"Apply"+successConstants.updatingSuccess.deletedSuccesfully});
    } catch (error) {
        next(error);
    }

}


//  cron.schedule('0 * * * * *',async()=>{
//      const now = new Date();
//      try {
        //  const applyes = await Applys.aggregate([
        //      {$match :{status:'rejected'}},
        //      {
        //          $lookup:{
        //              from:'jobs',
        //              localField:'job',
        //              foreignField:'_id',
        //              as:'jobInfo'
        //          }
        //      },
        //      {
        //          $unwind:'$jobInfo'
        //      },
        //      {
        //          $project:{
        //              user:1,
        //              createdAt:1,
        //              company:'$jobInfo.company',
        //              jobName:'$jobInfo.name',
        //              endTime:'$jobInfo.endTime'
        //          }
        //      },
        //      {$match :{endTime:{$lte:now}}},
        //      {
        //          $lookup:{
        //              from:'users',
        //              localField:'user',
        //              foreignField:'_id',
        //              as:'userInfo'
        //          }
        //      },
        //      {$unwind:'$userInfo'},
        //      {
        //          $lookup:{
        //              from:'companies',
        //              localField:'company',
        //              foreignField:'_id',
        //              as:'companyInfo'
        //          }
        //      },
        //      {$unwind:'$companyInfo'},
        //      {
        //          $lookup:{
        //              from:'companyinfos',
        //              localField:'companyInfo.companyInfo',
        //              foreignField:'_id',
        //              as:'companyInfoData'
        //          }
        //      },
        //      {$unwind : '$companyInfoData'},
        //      {
        //          $project:{
        //              jobName:1,
        //              endTime:1,
        //              createdAt:1,
        //              userName:'$userInfo.name',
        //              userEmail:'$userInfo.email',
        //              companyName:'$companyInfo.name',
        //              companyLogo:'$companyInfoData.logo'
        //          }
        //      }

        //  ])

    //  const applyess = await Jobs.find({endTime:{$lt:now}});
    //  console.log(applyes);
    //  console.log(results);
    //  console.log(applyes.length)
    // console.log(applyess)
    //   for(let i of applyes){
    //     emailQueue.add({
    //         userEmail: i.userEmail,
    //         userName: i.userName,
    //         jobName: i.jobName,
    //         companyName: i.companyName,
    //         companyLogo: i.companyLogo,
    //         endTime: i.endTime.toString().split('T')[0],
    //       });
        // console.log(i.userEmail)
        // const content = await generateHtmlForSendRejectStatusToUser(i.userName,i.jobName,i.companyName,i.companyLogo,i.endTime.toString().split('T')[0]);
        // await sendMail(i.userEmail,"Application Status Update",`Salam ${i.userName} bugun gələn mail bir yalnışlıq nəticəsində olub buna görə üzr istəyirik seçim mərhələsi hələ bitmiyib biz sizin ikə yenidən əlaqə quracıq`);
    //   }
//      } catch (error) {
//        console.log("error at auto deleting expired jobs",error.name)
//      }
//  })
// console.log(emailQueue)
module.exports = {
    getApplys,
    getApplysForEachUser,
    getApplysForEachCompany,
    postApply,
    getAcceptedApplys,
    getAcceptedApplysEachCompany,
    companyAcceptUserApply,
    getUserRemovedApplysAll,
    getRemovedApplysEachUser,
    companyDeleteApply,
    getApplysForEachCompanyOnlyTestLevel,
    getPdf

    
}
