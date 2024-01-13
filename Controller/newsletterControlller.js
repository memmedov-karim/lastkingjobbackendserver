//Every status code modifyed


//EXTERNAL LIBRARIES
const {v4:uuid} = require('uuid');

//MODELS
const { NewsLetter } = require("../Model/newsletterModel.js");
const { Users } = require("../Model/userModel.js");
const { Jobs } = require("../Model/jobModel.js");

//UTILS
const { validateRequiredFields } = require('../Utils/ValidateId/bodyValidator.js');

//CONSTANTS
const {successConstants} = require('../Utils/Constants/successConstants.js');
const {errorConstants} = require('../Utils/Constants/errorConstants.js')

const getNewsLetter = async (req,res,next) => {
    try {
        const newsletters = await NewsLetter.find({});
        return res.status(200).json({success:true,message:"Newsletters"+successConstants.fetchingSuccess.fetchedSuccesfully,data:newsletters})
    } catch (error) {
        next(error);
    }
}
const getAllCategories = async (req,res,next) =>{
    try {
        const categories = await Jobs.distinct('category');
        const data = categories.map(ctg=>{
            return {
                selected:false,
                option_name:ctg,
                id:uuid()
            }
        })

        return res.status(200).json({success:true,message:'Categories'+successConstants.fetchingSuccess.fetchedSuccesfully,data})
    } catch (error) {
        next(error);
    }
}
const addEmail = async (req,res,next) => {
    const {email,categories} = req.body;
    try {
        const jobCtgs = await Jobs.distinct('category');
        console.log(jobCtgs)
        for(let i of categories){
            if(!jobCtgs.includes(i)){
                throw {status:400,message:'Invalid category'};
            }
        }
        await validateRequiredFields(req,res,'email');
        const newsLetterOne = await NewsLetter.findOne({email});
        if(newsLetterOne) throw {status:400,message:'Email'+errorConstants.userErrors.alreadyExsist};
        const newNewsLetter = new NewsLetter({
            email,
            categories
        });
        const savedLetter = await newNewsLetter.save();
        return res.status(200).json({success:true,message:"You subscribed succesfully"});
    } catch (error) {
        next(error);
    }
}

module.exports = {
    getNewsLetter,
    addEmail,
    getAllCategories
}