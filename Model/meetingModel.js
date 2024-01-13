const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const meeting = new Schema({
    apply :{
        type:mongoose.Schema.Types.ObjectId,
        require:true,
        ref:'applyes'
    },
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Users'
    },
    company:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'company'
    },
    generalMembers:{
        type:Array,
        required:true
    },
    meetingType:{
        type:String,
        require:true
    },
    dateTime:{
        type:Date,
        require:true
    }
})

const Meetings = mongoose.model("meeting",meeting);

module.exports = {Meetings}