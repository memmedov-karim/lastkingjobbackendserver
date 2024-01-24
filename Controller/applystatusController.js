//MODELS
const { Applys } = require("../Model/applyModel.js");
const { Companies } = require("../Model/companyModel.js");
const { Users } = require("../Model/userModel.js");
const { Jobs } = require("../Model/jobModel.js");
const { Meetings } = require("../Model/meetingModel.js");
const { CompanyInfo } = require("../Model/companyInfoModel.js")
const { Chats } = require("../Model/chatModel.js");
const { UserInfo } = require("../Model/userInfoModel.js");
const {Applystatuses} = require('../Model/applystatusModel.js');
const {validateRequiredFields} = require('../Utils/ValidateId/bodyValidator.js');
const {generateHtmlForStatusUpdateFeedback} = require('../Utils/GenerateHtmlForSendEmail/generateHtmlForStatusUpdateFeedback.js')
const { sendMail } = require('../Utils/EmailSend/SendEmail.js');
const mongoose = require('mongoose');
const {getSocketInstance,getConnectedUsers} = require('../socket.js')
const getapplystatuses = async (req,res,next) => {
    try {
        const data = await Applystatuses.find({});

        return res.status(200).json({success:true,message:'Statuses fetched succesfully',data});
    } catch (error) {
        next(error)
    }
}
const addstatus = async (req,res,next) => {
    const {name,color} = req.body;
    try {
        await validateRequiredFields(req,res,'name','color')
        const exsisitingStatus = await Applystatuses.findOne({name});
        if(exsisitingStatus) throw {status:400,message:'This status already exsist'};
        const statusinstances = new Applystatuses({
            name,color
        });
        const saved = await statusinstances.save();
        return res.status(200).json({success:true,messge:'Status created succesfully',data:saved})
    } catch (error) {
        next(error)
    }
}


const companygiveanstatustoapplyer = async (req, res, next) => {
    const {user_id:companyId} = req.user;
    const {applyerId, statusId } = req.params;
    const { emailsend:sendemail } = req.body;
    console.log(req.body)
    try {
        const company = await Companies.findById(companyId);
        if (!company) throw { status: 404, message: 'Company not found' };
        const applyer = await Applys.findById(applyerId).populate('user job')
        if (!applyer) throw { status: 404, message: 'Applyer not found' };
        const status = await Applystatuses.findById(statusId);
        if (!status) throw { status: 404, message: 'Status not found' };
        const applyerIdObj = mongoose.Types.ObjectId(applyerId);
        const alreadyInStatus = applyer?.status?.map(st => st.toString())?.includes(statusId);
        if (alreadyInStatus) throw { status: 400, message: `Applyer already in ${status.name} status` };
        await Applys.findByIdAndUpdate(applyerIdObj, { $push: { status: statusId } });
        if (sendemail) {
            const user = applyer.user;
            const job = applyer.job;
            const companyInfo = await CompanyInfo.findOne({ company: companyId });
            const content = await generateHtmlForStatusUpdateFeedback(user.name, job.name, company.name, companyInfo.logo);
            await sendMail('notification', user.email, 'Müraciət', content);
        }
        const updatedApplyer = await Applys.aggregate([
            { $match: { _id: applyerIdObj } },
            {
                $lookup: {
                    from: 'jobs',
                    localField: 'job',
                    foreignField: '_id',
                    as: 'jobInfo'
                }
            },
            { $unwind: '$jobInfo' },
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
                    from: 'applystatuses',
                    let: { statusIds: '$status' },
                    pipeline: [
                        { $match: { $expr: { $in: ['$_id', '$$statusIds'] } } },
                        { $addFields: { order: { $indexOfArray: ['$$statusIds', '$_id'] } } },
                        { $sort: { order: 1 } }
                    ],
                    as: 'statusInfo'
                }
            },
            {
                $project: {
                    job: 1,
                    file: 1,
                    percentageOfCv: 1,
                    profilepic: '$userInfoInfo.profilepic',
                    status: '$statusInfo',
                    jobName: '$jobInfo.name',
                    userName: '$userInfo.name',
                    skills: '$userInfoInfo.skills',
                    jobTitle: '$userInfoInfo.jobTitle',
                    userCity: '$userInfoInfo.city'
                }
            },
        ]);

        const usId = applyer?.user?._id;
        const notificationData = {company:companyId,type:"status"}
        await UserInfo.findOneAndUpdate({usId},{$push:{notifications:notificationData}});
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
            io.to(receiverId).emit('notification',{companyName:company?.name,type:"status"});
        }
        return res.status(200).json({ success: true, message: 'Status updated', data: updatedApplyer[0] });
    } catch (error) {
        next(error);
    }
};


module.exports = {
    getapplystatuses,
    addstatus,
    companygiveanstatustoapplyer
}