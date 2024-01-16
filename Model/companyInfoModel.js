const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const levelSchema = new Schema({
    level:{
        type:String,
        required:true
    },
    color:{
        type:String,
        required:true
    },
    message:{
        type:String,
        required:true,
        default:""
    }
})
const companyInfoSchema = new Schema({
    company:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:'company'
    },
    info:{
        type:String,
        default:""
    },
    originHistory:{
        type:String, 
        default:""
    },
    logo:{
        type:String,
        default:null
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
    levelofapplyers:[levelSchema],
    subscription:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'subscription'
    }

},{timestamps:true})
const CompanyInfo = mongoose.model('companyinfo',companyInfoSchema);
module.exports = {CompanyInfo}