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

const getMessagesBetwenOneUserAndOneCompany = async (req,res,next) => {
    const {chatId} = req.params;
    try {
        
    } catch (error) {
        next(error);
    }
}
const userSendMessage = async (req,res,next) => {
    const {chatId} = req.params
    const {userId,content} = req.body;
    try {
        const user  = await Users.findById(userId);
        if(!user) throw {status:404,message:errorConstants.userErrors.userdoesntExsist};
        const chat = await Chats.findById(chatId);
        if(!chat) throw {status:404,message:'Chat'+errorConstants.userErrors.doesntExsist};
        await validateRequiredFields(req,res,'content');
        const newMessage = new Messages({
            chat:chatId,
            sender:userId,
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
        if(chat.company !== companyId) throw {status:401,message:'You can not send message in this chat'}
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
    try {
        const chat = await Chats.findById(chatId);
        if(!chat) throw {status:404,message:'Chat'+errorConstants.userErrors.doesntExsist};

        const messages = await Messages.find({chat:chatId});


        return res.status(200).json({success:true,message:'Messages'+successConstants.fetchingSuccess.fetchedSuccesfully,data:messages});
        
    } catch (error) {
        next(error);
    }
}
module.exports = {
    userMessagers,
    getMessagesBetwenOneUserAndOneCompany,
    userSendMessage,
    companySendMessage,
    getChatMessages
}