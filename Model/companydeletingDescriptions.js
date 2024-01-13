const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const deletingDescriptions = new Schema({
    email:{
        type:String,
        require:true
    },
    name:{
        type:String,
        require:true
    },
    deletingDescription:{
        type:String,
        require:true
    }
},{timestamps:true});

const companydeletingDescriptions = mongoose.model("deletingDescriptions",deletingDescriptions);

module.exports = {companydeletingDescriptions}

