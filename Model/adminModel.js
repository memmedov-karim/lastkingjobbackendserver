const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const admin = new Schema({
    name:{
        type:String,
        require:true
    },
    surname:{
        type:String,
        require:true
    },
    email:{
        type:String,
        require:true
    },
    password:{
        type:String,
        require:true
    },
    passwordRepeat:{
        type:String,
        require:true
    }

},{timestamps:true});

const Admins = mongoose.model("admin",admin);
module.exports = {Admins}