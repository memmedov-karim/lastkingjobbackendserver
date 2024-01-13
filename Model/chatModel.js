const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const chat = new Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Users'
    },
    company:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'company'
    }
},{timestamps:true});


const Chats = mongoose.model("chats",chat);
module.exports = {Chats};