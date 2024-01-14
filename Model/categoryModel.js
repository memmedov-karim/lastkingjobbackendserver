const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const categorySchema = new Schema({
    name:{
        type:String,
        required:true
    },
    skills:[
        {type:String}
    ]
})

const Categories = mongoose.model("categories",categorySchema);
module.exports = {Categories}
