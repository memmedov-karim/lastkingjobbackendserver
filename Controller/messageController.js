//Every status code modifyed
const mongoose = require('mongoose')

//MODELS
const { Users } = require('../Model/userModel.js');
const { Companies } = require('../Model/companyModel.js');
const { Applys } = require("../Model/applyModel.js");
const { Jobs } = require("../Model/jobModel.js");
const { CompanyInfo } = require("../Model/companyInfoModel.js");
const { UserInfo } = require("../Model/userInfoModel.js");
const { Chats } = require("../Model/chatModel.js");
const { Messages } = require("../Model/messageModel.js");


//UTILS
const { validateRequiredFields } = require('../Utils/ValidateId/bodyValidator.js');


//SOCKETS
const { getSocketInstance } = require('../socket.js');

//CONSTANTS
const {errorConstants} = require('../Utils/Constants/errorConstants.js');
const {successConstants} = require('../Utils/Constants/successConstants.js');


const userMessagers = async (req,res,next) => {
    const {user_id:userId} = req.user;
    try {
        const user = await Users.findById(userId);
        if(!user) throw {status:404,message:errorConstants.userErrors.userdoesntExsist};
        const messager = await Chats.
        aggregate([
            {$match:{user:new mongoose.Types.ObjectId(userId)}},
            {
                $lookup:{
                    from:'companies',
                    localField:'company',
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
                $project:{
                    companyName:'$companyInfo.name',
                    companyLogo:'$companyInfoInfo.logo',
                    companyId:'$companyInfo._id',
                    createdAt:1
                }
            }
        ])
        return res.status(200).json({success:true,message:'Fetched',data:messager}); 
    } catch (error) {
        next(error);
    }
}
const companyMessagers = async (req,res,next) => {
    const {user_id:companyId} = req.user;
    try {
        const user = await Companies.findById(companyId);
        if(!user) throw {status:404,message:errorConstants.userErrors.userdoesntExsist};
        const messager = await Chats.
        aggregate([
            {$match:{company:new mongoose.Types.ObjectId(companyId)}},
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
                    from:'userinfos',
                    localField:'userInfo.userinfo',
                    foreignField:'_id',
                    as:'userInfoInfo'
                }
            },
            {$unwind:'$userInfoInfo'},
            {
                $project:{
                    chatId:'$_id',
                    userName:'$userInfo.name',
                    userLogo:'$userInfoInfo.profilepic',
                    userJobTitle:'$userInfoInfo.jobTitle',
                    userId:'$userInfo._id',
                    createdAt:1
                }
            }
        ])
        return res.status(200).json({success:true,message:'Fetched',data:messager}); 
    } catch (error) {
        next(error);
    }
}
const getMessagesBetwenOneUserAndOneCompany = async (req,res,next) => {
    const {chatId} = req.params;
    try {
        
    } catch (error) {
        next(error);
    }
}
const userSendMessage = async (req,res,next) => {
    const {chatId} = req.params
    console.log(chatId)
    const {content} = req.body;
    const {user_id:sender} = req.user;
    try {
        // const user  = await Users.findById(userId);
        // if(!user) throw {status:404,message:errorConstants.userErrors.userdoesntExsist};
        const chat = await Chats.findById(chatId);
        if(!chat) throw {status:404,message:'Chat'+errorConstants.userErrors.doesntExsist};
        await validateRequiredFields(req,res,'content');
        const newMessage = new Messages({
            chat:chatId,
            sender,
            text:content
        });
        const savedMessage = await newMessage.save();
        return res.status(200).json({success:false,message:'Message sent succesfully!',data:savedMessage});
    } catch (error) {
        next(error);
    }
}
const companySendMessage = async (req,res,next) => {
    const {chatId} = req.params;
    const {companyId,content} = req.body;
    try {
        const company = await Companies.findById(companyId);
        if(!company) throw {status:404,message:'Company'+errorConstants.userErrors.doesntExsist}
        const chat = await Chats.findById(chatId);
        if(!chat) throw {status:404,message:'Chat'+errorConstants.userErrors.doesntExsist};
        if(chat.company.toString() !== companyId.toString()) throw {status:401,message:'You can not send message in this chat'}
        await validateRequiredFields(req,res,'content');
        const newMessage = new Messages({
            chat:chatId,
            sender:companyId,
            text:content
        });
        const savedMessage = await newMessage.save();
        return res.status(200).json({success:false,message:'Message sent succesfully',data:savedMessage})
    } catch (error) {
        next(error);
    }
}
const getChatMessages = async (req,res) => {
    const {chatId} = req.params;
    const {user_id} = req.user;
    try {
        const chat = await Chats.findById(chatId);
        if(!chat) throw {status:404,message:'Chat'+errorConstants.userErrors.doesntExsist};
        const {user,company} = chat;
        let enduserinfo;
        if(user_id.toString() === user.toString()){
            enduserinfo = await UserInfo.findOne({user:user_id}); 
        }
        if(user_id.toString() === company.toString()){
            enduserinfo = await CompanyInfo.findOne({company:user_id});
        }
        const messages = await Messages.find({chat:chatId});
        return res.status(200).json({success:true,message:'Messages'+successConstants.fetchingSuccess.fetchedSuccesfully,data:{messages,myprofilelogo:enduserinfo?.logo || enduserinfo?.profilepic}});
        
    } catch (error) {
        next(error);
    }
}
module.exports = {
    userMessagers,
    companyMessagers,
    getMessagesBetwenOneUserAndOneCompany,
    userSendMessage,
    companySendMessage,
    getChatMessages
}