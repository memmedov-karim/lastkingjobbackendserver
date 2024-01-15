const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const achievementsSchema = new Schema({
    name: String,
    certificateUrl: String,
    startDate:String,
    endDate:String,
  },{timestamps:true});
const educationsSchema = new Schema({
    name:String,
    school:String,
    startDate:String,
    endDate:String,
    description:String,
    continue:{
        type:Boolean,
        default:false
    }
},{timestamps:true});
const linksSchema = new Schema({
    url:String
});
const experiencesSchema = new Schema({
    companyName:{
        type:String,
        required:true
    },
    position:{
        type:String,
        required:true
    }
    ,
    startDate:{
        type:String,
        required:true
    },
    endDate:{
        type:String,
        default:""
    },
    description:{
        type:String,
        default:""
    }
},{timestamps:true});
const talkingSchema = new Schema({
    job:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:'job'
    },
    jobName:{
        type:String,
        required:true
    },
    content:{
        type:String
    }
},{timestamps:true});
const userinfo = new Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Users'
    },
    birthday:{
        type:String,
        default:''
    },
    jobTitle:{
        type:String,
        default:""
    },
    phone:{
        type:String,
        default:""
    },
    currentSalary:{
        type:String,
        default:""
    },
    expestedSalary:{
        type:String,
        default:""
    },
    experiencesYear:{
        type:String,
        default:""
    },
    age:{
        type:String,
        default:""
    },
    educationlevelNow:{
        type:String,
        default:""
    },
    languages:{
        type:String,
        default:""
    },
    city:{
        type:String,
        default:''
    },
    profilepic:{
        type:String,
        default:""
    },
    skills:{
        type:Array,
        default:[]
    },
    file:{
        type:String,
        default:""
    },
    coverLetter:{
        type:String,
        default:''
    },
    chancesForCoverLetter:{
        type:Number,
        default:1
    },
    educations:[educationsSchema],
    achievements:[achievementsSchema],
    links:[linksSchema],
    experiences:[experiencesSchema],
    talks:[talkingSchema]
},{timestamps:true})
const UserInfo = mongoose.model('UserInfo', userinfo);

module.exports = {UserInfo};