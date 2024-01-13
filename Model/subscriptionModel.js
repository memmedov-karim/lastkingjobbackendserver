const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const subscriptionSchema = new Schema({
    name:{
        type:String,
        require:true,
    },
    minimumvacancycount:{
        type:Number,
    },
    subscriptiondate:{
        type:Date,
    },
    subscriptionenddate:{
        type:Date,
    },
    costofsubscription:{
        type:String,
    },
    users:[{type:mongoose.Schema.Types.ObjectId,ref:'User'}]
},{timestamps:true});

const Subscription = mongoose.model("subscription",subscriptionSchema);
module.exports = {Subscription}