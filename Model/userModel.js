const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const users = new Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    userinfo:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"UserInfo"
    }
},{timestamps:true});

const Users = mongoose.model("Users",users);

module.exports = {Users}