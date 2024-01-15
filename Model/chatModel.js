const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const chat = new Schema({
    user:{
        type:Schema.Types.ObjectId,
        ref:'Users'
    },
    company:{
        type:Schema.Types.ObjectId,
        ref:'company'
    }
},{timestamps:true});


const Chats = mongoose.model("chats",chat);
module.exports = {Chats};