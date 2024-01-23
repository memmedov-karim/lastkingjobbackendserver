const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const categorySchema = new Schema({
    name:{
        type:String,
        required:true
    },
    skills:[
        {value:{type:String,required:true},label:{type:String,required:true}}
    ]
})

const Categories = mongoose.model("categories",categorySchema);
module.exports = {Categories}
