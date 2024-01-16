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
        require:true
    },
    file:{
        type:String,
        require:true,
    },
    status:{
        type:Schema.Types.ObjectId,
        required:true,
        default:mongoose.Types.ObjectId('65a6e9f5788f1a9ccd9f0e21'),
        ref:'applystatuses'
    },
    percentageOfCv:{
        type:Number,
    },
    show:{
        type:Boolean,
        require:true,
        default:true
    },
    isDate:{
        type:Boolean,
        require:true,
        default:false
    },
    dateTime:{
        type:String,
        default:null
    },
    isFinish:{
        type:Boolean,
        require:true,
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