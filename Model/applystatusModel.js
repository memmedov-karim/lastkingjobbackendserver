const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const applystatusSchema = new Schema({
    name:{
        type:String,
        required:true
    },
    color:{
        type:String,
        required:true
    },
    icon:{
        type:String,
        default:""
    }
})

const Applystatuses = mongoose.model("applystatuses",applystatusSchema);
module.exports = {Applystatuses}
