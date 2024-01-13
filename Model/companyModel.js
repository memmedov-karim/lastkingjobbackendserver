const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const company = new Schema({
    name:{
        type:String,
        require:true
    },
    email:{
        type:String,
        require:true
    },
    password:{
        type:String,
        require:true
    },
    isBlock:{
        type:Boolean,
        require:true,
        default:false
    },
    numberOfJobSharing:{
        type:Number ,
        require:true,
        default:5

    },
    companyInfo:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'companyinfo'
    }
},{timestamps:true});
const Companies = mongoose.model("company",company);
module.exports = {Companies}