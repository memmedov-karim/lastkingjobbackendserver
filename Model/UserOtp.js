const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userotp = new Schema({
    email:{
        type:String,
        require:true
    },
    otp:{
        type:String,
        require:true
    },
},{timestamps:true});

const UsersOtp = mongoose.model("userotp",userotp);

module.exports = {UsersOtp}