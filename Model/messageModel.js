const mongoose = require('mongoose');

const Schema  = mongoose.Schema;


const message = new Schema({
    chat:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Chats'
    },
    text:{
        type:String,
        required:true
    },
    sender:{
        type:String
    }
},{timestamps:true})

const Messages = mongoose.model('messages',message);
module.exports = {Messages}


