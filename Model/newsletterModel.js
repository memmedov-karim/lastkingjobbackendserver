const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const newsletter = new Schema({
    email:{
        type:String
    },
    categories:{
        type:Array
    }

},{timestamps:true});
const NewsLetter = mongoose.model("newsletter",newsletter);

module.exports = {NewsLetter}