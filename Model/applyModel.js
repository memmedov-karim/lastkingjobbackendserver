const mongoose = require("mongoose");

const Schema = mongoose.Schema;
const apply = new Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Users',
        required:true
    },
    job:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'job',
        required:true
    },
    file:{
        type:String,
        required:true,
    },
    status:[{
        type:Schema.Types.ObjectId,
        ref:'applystatuses',
    }],
    percentageOfCv:{
        type:Number,
    },
    show:{
        type:Boolean,
        required:true,
        default:true
    },
    isDate:{
        type:Boolean,
        required:true,
        default:false
    },
    dateTime:{
        type:String,
        default:null
    },
    isFinish:{
        type:Boolean,
        required:true,
        default:false
    },
    taskInfo:{
        folder:{
            type:mongoose.Schema.Types.ObjectId,
            ref:'Folders',
            default:null
        },
        endTime:{
            type:Date,
            default:null
        },
        numberOfTry:{
            type:Number,
            default:1
        },
        totalPoint:{
            type:Number,
            default:0
        }
    }
},{timestamps:true})

const Applys = mongoose.model("applyes",apply);
module.exports = {Applys}