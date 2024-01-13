const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const customers = new Schema({
    category:{
        type:String,
        require:true
    },
    marka:{
        type:String,
        require:true
    },
    name:{
        type:String,
        require:false,
        default:null
    },
    color:{
        type:String,
        require:true
    },
    price:{
        type:String,
        require:true
    },
})

const Products = mongoose.model("Customers",customers);

module.exports = {Products}