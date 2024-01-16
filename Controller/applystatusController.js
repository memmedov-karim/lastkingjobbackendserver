const {Applystatuses} = require('../Model/applystatusModel.js');
const {validateRequiredFields} = require('../Utils/ValidateId/bodyValidator.js')
const getapplystatuses = async (req,res,next) => {
    try {
        const data = await Applystatuses.find({});

        return res.status(200).json({success:true,message:'Statuses fetched succesfully',data});
    } catch (error) {
        next(error)
    }
}
const addstatus = async (req,res,next) => {
    const {name,color} = req.body;
    try {
        await validateRequiredFields(req,res,'name','color')
        const exsisitingStatus = await Applystatuses.findOne({name});
        if(exsisitingStatus) throw {status:400,message:'This status already exsist'};
        const statusinstances = new Applystatuses({
            name,color
        });
        const saved = await statusinstances.save();
        return res.status(200).json({success:true,messge:'Status created succesfully',data:saved})
    } catch (error) {
        next(error)
    }
}


module.exports = {
    getapplystatuses,
    addstatus
}