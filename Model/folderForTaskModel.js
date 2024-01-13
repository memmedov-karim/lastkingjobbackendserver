const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const option = new Schema({
    ans:{
        type:String,
        required:true
    },
    isCorrect:{
        type:Boolean,
        required:true,
        default:false
    }
})
const task = new Schema({
    question:{
        type:String,
        required:true
    },
    options:[option],
    point:{
        type:Number,
        required:true,
        default:1
    }

},{timestamps:true});
const folder = new Schema({
    company:{
        type:Schema.Types.ObjectId,
        required:true,
        ref:'company'
    },
    name:{
        type:String,
        required:true,
    },
    description:{
        type:String,
        required:true
    },
    questions:[task]
},{timestamps:true});

const Folders = mongoose.model('folder',folder);

module.exports = {Folders};