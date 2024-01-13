const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const savedJob = new Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        require:true,
        ref:'Users'
    },
    job:{
        type:mongoose.Schema.Types.ObjectId,
        require:true,
        ref:"job"
    }
},{timestamps:true});

const SavedJobs = mongoose.model("savedJob",savedJob);
module.exports = {SavedJobs}