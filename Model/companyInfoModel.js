const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const notificationSchema = new Schema({
    user:{
        type:Schema.Types.ObjectId,
        required:true,
        ref:'Users'
    },
    type:{
        type:String,
        required:true,
    }
})
const companyInfoSchema = new Schema({
    company:{
        type:Schema.Types.ObjectId,
        required:true,
        ref:'company'
    },
    info:{
        type:String,
        default:""
    },
    website:{
        type:String,
        default:""
    },
    phone:{
        type:String,
        defaulkt:""
    },
    categories:{
        type:Array,
        default:[]
    },
    logo:{
        type:String,
        default:""
    },
    city:{
        type:String,
        default:""
    },
    vacancynum:{
        type:Number,
        required:true,
        default:0
    },
    applynum:{
        type:Number,
        required:true,
        default:0
    },
    workers:[{type:String,ref:'Users'}],
    notifications:[notificationSchema],
    subscription:{
        type:Schema.Types.ObjectId,
        ref:'subscription'
    }

},{timestamps:true})
const CompanyInfo = mongoose.model('companyinfo',companyInfoSchema);
module.exports = {CompanyInfo}