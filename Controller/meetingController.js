//Every status code modifyed

//MODELS
const { Applys } = require("../Model/applyModel.js");
const { Meetings } = require("../Model/meetingModel.js");
const { Companies } = require("../Model/companyModel.js");
const { Users } = require("../Model/userModel.js");


//SOCKETS
const { getSocketInstance } = require('../socket.js');


//UTILS
const { sendMail } = require("../Utils/EmailSend/SendEmail.js");
const { sendNotificationToUser } = require('../Controller/userController.js');
const { validateRequiredFields } = require("../Utils/ValidateId/bodyValidator.js");

//CONSTANTS
const { successConstants } = require("../Utils/Constants/successConstants.js");
const { errorConstants } = require("../Utils/Constants/errorConstants.js");
//11-Sirket beyendiyi muracietin sahibi ile gorus vaxti teyin etmek ucun api
const makeAnAppointment = async (req,res,next) => {
    const apply_id = req.params.id;
    const {meetingType,dateTime} = req.body;
    try {
        await validateRequiredFields(req,res,'dateTime');
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
        const prevMeeting = await Meetings.findOne({apply:apply_id});
        if(prevMeeting) throw {status:400,message:'User'+errorConstants.userErrors.alreadyExsist};
        if(!apply) throw {status:404,message:'Apply'+errorConstants.userErrors.doesntExsist};
        if(apply.status !== "approved") throw {status:400,message:'Please approve applicant'};
        const {name:userName,email:userEmail,_id:userId} = apply.user;
        const {name:companyName,_id:companyId} = (apply.job).company
        console.log("before")
        await Applys.findByIdAndUpdate(apply_id,{$set:{isDate:true,dateTime:new Date(dateTime)}});
        console.log("after")
        const newMeet = new Meetings({
            apply:apply_id,
            user:userId,
            company:companyId,
            generalMembers:[userId.toString(),companyId.toString()],
            dateTime:new Date(dateTime),
            meetingType:meetingType,
        })
        const savedMeet = await newMeet.save();
        const [date,time] = dateTime.split('T')
        await sendMail('notification',userEmail,"Apply for job",`Hello dear ${userName},${companyName} has approved your application and scheduled an interview with you on ${date} at ${time},${meetingType==="online" ? "online" : "offline,please come to our head office without delay"} `);
        const result = await sendNotificationToUser(apply?.user?._id,apply_id,'1');
        const io = getSocketInstance();
        // console.log(io.sockets.adapter.rooms)
        if(io && apply?.user?._id){
            console.log(((apply.user)._id).toString())
            io.to(((apply.user)._id).toString()).emit('notification',result);
        }
        console.log("result:",result);
        return res.status(200).json({success:true,message:`Meeting created succesfully with ${userName}`})
    } catch (error) {
        next(error);
    }

}

//12-Umumi goruslerin yerlesdiyi api
const getAllMeetings = async (req,res,next) => {
    try {
        const meetings = await Meetings.find({})
        .populate({
            path:"apply",
            select:'file user name email',
            populate:[
            {
                path:'job',
                select:'name category company',
                populate:{
                    path:'company',
                    select:'name email'
                }
            },
            {
                path:'user',
                select:'name email'
            }
        ]
        })
        return res.status(200).json({success:true,message:"All meetings"+successConstants.fetchingSuccess.fetchedSuccesfully,data:meetings})
        
    } catch (error) {
        next(error);
    }
}

//13-Her userin goruslerinin yerlesdiyi api
const getMeetingsEachUser = async (req,res,next) => {
    const user_id = req.params.id;
    try {
        const userOne = await Users.findById(user_id);
        if(!userOne) throw {status:404,message:errorConstants.userErrors.userdoesntExsist};
        const meetings = await Meetings.find({user:user_id})
        .populate({
            path:'apply',
            select:'user',
            populate:[
            {
                path:'job',
                select:'name category'
            }
        ]
        })
        .populate({
            path:'company',
            select:'name email',
            populate:{
                path:'companyInfo',
                select:'logo'
            }
        })
        return res.status(200).json({success:true,message:"Meetings"+successConstants.fetchingSuccess.fetchedSuccesfully,data:meetings});
    } catch (error) {
        next(error);
    }
}

//14-Her sirketin teskil etdiyi goruun api-si
const getMeetingsEachCompany = async (req,res,next) => {
    const company_id = req.params.id;
    try {
        const companyOne = await Companies.findById(company_id);
        if(!companyOne) throw {status:404,message:'Company'+errorConstants.userErrors.doesntExsist};
        const meetings = await Meetings.find({company:company_id})
        .populate({
            path:'apply',
            select:'user',
            populate:[
                {
                    path:'job',
                    select:'name category',
                }
            ]

        })
        .populate({
            path:'user',
            select:'name email',
            populate:{
                path:'userinfo',
                select:'profilepic'
            }
        })
        return res.status(200).json({success:true,message:"Meetings"+successConstants.fetchingSuccess.fetchedSuccesfully,data:meetings});
    } catch (error) {
        next(error);
    }
}

const checkMeetingBetweenUserAndCompanyAndSet = async (req,res,next) => {
    const {meeting_id} = req.body;
    // console.log(req.user)
    const {user_id,u_t_p} = req.user
    try {
        await validateRequiredFields(req,res,'meeting_id','user_id')
        const meeting = await Meetings.findById(meeting_id)
        .populate({
            path:'apply',
            select:'job',
            populate:[
                {
                    path:'job',
                    select:'name category',
                }
            ]
        })
        .populate({
            path:'user',
            select:'name email',
            populate:{
                path:'userinfo',
                select:'profilepic'
            }
        })
        .populate({
            path:'company',
            select:'name email',
            populate:{
                path:'companyInfo',
                select:'logo'
            }
        })
        if(meeting){
            // console.log(meeting)
            if(meeting.generalMembers.includes(user_id)){
                console.log(meeting)
                return res.status(200).json({success:true,message:"Meeting"+successConstants.fetchingSuccess.fetchedSuccesfully,data:meeting})
            }
            else{
                throw {status:401,message:'You can not join this meeting'};
            }
        }
        throw {status:404,message:'Meeting'+errorConstants.userErrors.doesntExsist};
    } catch (error) {
        next(error);
    }
}
module.exports = {
    makeAnAppointment,
    getAllMeetings,
    getMeetingsEachUser,
    getMeetingsEachCompany,
    checkMeetingBetweenUserAndCompanyAndSet
}