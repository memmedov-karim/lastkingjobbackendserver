const {Jobtypes} = require('../Model/jobtypeModel.js');



const getjobtypes = async (req,res,next) => {
    try{
        const data = await Jobtypes.find();
        return res.status(200).json({success:true,message:'Type added succesfully',data})
    }catch(error){
        next(error)
    }
}
const addjobtype = async (req,res,next) => {
    try{
        const {name} = req.body;
        const typeinstances = new Jobtypes({
            name:name.toUpperCase()
        });
        const savedType = await typeinstances.save();
        return res.status(200).json({success:true,message:'Type added succesfully',data:savedType})
    }catch(error){
        next(error)
    }
}

module.exports = {
    getjobtypes,addjobtype
}