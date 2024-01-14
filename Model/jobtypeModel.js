const mongoose = require('mongoose');
const Schema  = mongoose.Schema;

const jobtypeSchema = new Schema({
    name:{
        type:String,
        required:true
    }
})

const Jobtypes = mongoose.model("jobtypes",jobtypeSchema);
module.exports = {Jobtypes}
