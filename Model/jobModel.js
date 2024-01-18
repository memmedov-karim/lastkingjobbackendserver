const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const user = new Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Users'
    }
})
const job = new Schema({
    company:{
        type:Schema.Types.ObjectId,
        require:true,
        ref:"company"
    },
    category:{
        type:Schema.Types.ObjectId,
        required:true,
        ref:'categories'
    },
    name:{
        type:String,
        require:true
    },
    city:{
        type:String,
        require:true
    },
    type:{
        type:Schema.Types.ObjectId,
        required:true,
        ref:'jobtypes'
    },
    experience:{
        type:String,
        require:true
    },
    education:{
        type:String,
        require:true
    },
    descriptionOfVacancy:{
        type:String,
        require:true
    },
    skills:{
        type:Array,
        require:true
    },
    salary:{
        type:Number,
        default:null
    },
    numberOfViews:{
        type:Number,
        default:0
    },
    numberOfApplys:{
        type:Number,
        default:0
    },
    premium:{
        type:Boolean,
        default:false
    },
    endTime:{
        type:Date,
        require:true
    },
    active:{
        type:Boolean,
        required:true,
        default:true
    },
    salaryType:{
        type:String,
        default:'Aylıq'
    },
    agreedSalary:{
        type:Boolean,
        default:false
    },
    age:{
        type:String,
        default:"18-25"
    },
    taskInfo:{
        folder:{
            type:mongoose.Schema.Types.ObjectId,
            ref:'Folders',
            default:null
        },
        minPoint:{
            type:Number,
            default:0
        },
        participants:[user]
    }

},{timestamps:true})

const Jobs = mongoose.model("job",job);
module.exports = {Jobs}