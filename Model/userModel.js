const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const notifySchema = new Schema({
    apply: {
        type:String,
        ref:'applyes'
    },
    types:{
        type:String
    },
    seen:{
        type:Boolean,
        default:false
    }


  },{timestamps:true});
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
    },
    notifications:[
       notifySchema
    ]
},{timestamps:true});

const Users = mongoose.model("Users",users);

module.exports = {Users}