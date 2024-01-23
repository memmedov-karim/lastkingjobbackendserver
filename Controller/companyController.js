//Every status code modifyed

//EXTERNAL LIBRARIES
const jwt = require('jsonwebtoken');
const mongoose = require("mongoose");

//MODELS
const { Companies } = require("../Model/companyModel.js");
const { UsersOtp } = require("../Model/UserOtp.js");
const { companydeletingDescriptions } = require("../Model/companydeletingDescriptions.js");
const { Jobs } = require("../Model/jobModel.js");
const { CompanyInfo } = require('../Model/companyInfoModel.js');
const { Applys } = require("../Model/applyModel.js");

//UTILS
const { generateOtp } = require("../Utils/CodeGenerator/CodeGenerator.js");
const { generateHtml } = require("../Utils/GenerateHtmlForSendEmail/generateHtml.js");
const { generateHtmlSendOtp } = require('../Utils/GenerateHtmlForSendEmail/generateHtmlSendOtp.js');
const { generateHtmlForLoginNotification } = require("../Utils/GenerateHtmlForSendEmail/generateHtmlForLoginNotification.js");
const { sendMail } = require('../Utils/EmailSend/SendEmail.js');
const { sendOneToManyEmails } = require("../Utils/SendMultiEmail/SendMailToMany.js");
const { deleFile } = require("../Utils/FileDelete/fileDelete.js");
const { validateRequiredFields } = require('../Utils/ValidateId/bodyValidator.js');
const { isValidId } = require("../Utils/ValidateId/IsValidId.js");
//SOCKETS
const {getSocketInstance} = require('../socket.js');

//CONSTANTS
const {errorConstants} = require("../Utils/Constants/errorConstants.js");
const {successConstants} = require("../Utils/Constants/successConstants.js");


const companyIsBlock = async (req,res,next) => {
    const {email} = req.params;
    try {
        const companyOne = await Companies.findOne({email});
        if(!companyOne) throw {status:404,message:'Company'+errorConstants.userErrors.doesntExsist
      }

        return res.status(200).json({success:companyOne.isBlock})
        
    } catch (error) {
        next(error);
    }
}
const getCompanies = async (req,res,next) => {
    
    try {
        const companies = await Companies.find({})
        .populate({
            path:'companyInfo',
        })
        .select('-password')
        return res.status(200).json({success:true,data:companies,message:'Companies'+successConstants.fetchingSuccess.fetchedSuccesfully});
    } catch (error) {
        next(error);
    }
}
const getCompaniesInfo = async (req,res,next) => {
    try {
        const companiesInfo = await CompanyInfo.find({})
        .populate({
            path:'company',
            select:'name'
        })
        .select('-info -originHistory')
        return res.status(200).json({succes:true,data:companiesInfo,message:"Cpmpanies info fetched succesfully"})
    } catch (error) {
        next(error);
    }
}
const getJobsSharedEachCompany = async (req,res,next) => {
    // const company_id = req.params.id;
    const {user_id:company_id} = req.user;
    try {
        // console.log(company_id)
        const company = await Companies.findById(company_id);
        if(!company) throw {status:404,message:'Company'+errorConstants.userErrors.doesntExsist}
        const jobs = await Jobs.aggregate([
          {$match:{company:new mongoose.Types.ObjectId(company_id)}},
          {
            $lookup:{
              from:'categories',
              localField:'category',
              foreignField:'_id',
              as:'categoryInfo'
            }
          },
          {$unwind:'$categoryInfo'},
          {
            $lookup:{
              from:'jobtypes',
              localField:'type',
              foreignField:'_id',
              as:'jobtypeInfo'
            }
          },
          {$unwind:'$jobtypeInfo'},
          {
            $project:{
              name:1,
              numberOfViews:1,
              numberOfApplys:1,
              active:1,
              salary:1,
              salaryType:1,
              agreedSalary:1,
              city:1,
              age:1,
              experience:1,
              education:1,
              createdAt:1,
              endTime:1,
              categoryInfo:1,
              jobtypeInfo:1,

            }
          }
        ]);
        return res.status(200).json({success:true,data:jobs,message:'Jobs'+successConstants.fetchingSuccess.fetchedSuccesfully});
    } catch (error) {
        next(error);
    }
}
const registerCompany = async (req,res,next) => {
    const {name,email,password,passwordRepeat,otp} = req.body;
    console.log(req.body)
    try {
        await validateRequiredFields(req,res,'name','email','password','passwordRepeat','otp');
        const userOtp = await UsersOtp.findOne({email:email});
        if(!userOtp) throw {status:404,message:errorConstants.registrationErrors.otpdoesntExsist};
        const expireTime = ((new Date().getTime()-userOtp.updatedAt.getTime())/1000)/60;
        if(expireTime>2.5) throw {status:400,message:errorConstants.registrationErrors.otpExpired};
        if(userOtp.otp !== otp) throw {status:400,message:errorConstants.registrationErrors.otpisnotCorrect};
        if(password !== passwordRepeat) throw {status:400,message:errorConstants.registrationErrors.passwordMismatch};
        if(password.length<6) throw {status:400,message:errorConstants.registrationErrors.invalidPassword};
        const companyOne = await Companies.findOne({email});
        if(companyOne) throw {status:400,message:email+errorConstants.userErrors.alreadyExsist}
        const newCompany = new Companies({
            name:name,
            email:email,
            password:password
        })
        const savedCompany = await newCompany.save();
        const newCompanyInfo = new CompanyInfo({
            company:savedCompany._id,
        })
        const savedCompanyInfo = await newCompanyInfo.save()
        newCompany.companyInfo = savedCompanyInfo._id;
        await newCompany.save();
        return res.status(200).json({success:true,message:successConstants.registrationSuccess.successRegistered,data:savedCompany});
    } catch (error) {
        next(error);
    }
}
const loginCompany = async (req,res,next) =>{
    const {email,password,time} = req.body;
    try {
        await validateRequiredFields(req,res,'email','password');
        const companyOne = await Companies.findOne({email});
        if(!companyOne) throw {status:404,message:'Company'+errorConstants.userErrors.doesntExsist};
        if(companyOne.password !== password) throw {status:401,message:errorConstants.loginErrors.passwordisnotCorrect};
        if(companyOne.isBlock) throw {status:403,message:'Account blocked by owner!'};
        const jwtSecretKey = process.env.JWT_SECRET_KEY;
        const token = jwt.sign({user_id:companyOne._id,u_t_p:'c_m_p' },jwtSecretKey);
        console.log("token:"+token);
        console.log("secretkey:"+jwtSecretKey);
        const [returneduser, infos] = await Promise.all([
          Companies.findById(companyOne._id).select('-password -isBlock -numberOfJobSharing -createdAt -updatedAt -companyInfo'),
          CompanyInfo.findOne({ company: companyOne._id })
      ]);
        const info = {...infos.toObject(),numberOfJobSharing:companyOne.numberOfJobSharing}
        // console.log(returneduser)
        const modified = {...returneduser.toObject(),u_t_p:'c_m_p'}
        res.cookie("user_token",token,{
            httpOnly:true,
            secure:true,
            sameSite:"None",
            expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        });
        res.status(200).json({ success: true, user:{modified,info},message:successConstants.loginSuccess.logedSuccess});
        const ms = generateHtml(companyOne?.name,time,companyOne?._id)
        await sendMail('notification',email,"Login",ms)
    } catch (error) {
        next(error);
    }
}
const updateCompanyInfo = async (req, res, next) => {
  const {
    info,
    phone,
    website,
    categories,
    city
  } = req.body;
  // console.log(req.body)
  const file = req.file;
  const { user_id: userId } = req.user;
  try {
    if (!isValidId(userId)) {
      throw { status: 400, message: errorConstants.generalErrors.isnotvalidId };
    }

    const companyOne = await Companies.findById(userId);
    if (!companyOne) {
      throw {
        status: 404,
        message: errorConstants.userErrors.userdoesntExsist + "ID",
      };
    }

    const companyInfo = await CompanyInfo.findById(companyOne.companyInfo);
    if (!companyInfo) {
      throw {
        status: 404,
        message: errorConstants.userErrors.userdoesntExsist + "User Info",
      };
    }

    // Update user career information
    const updatedInfo = await CompanyInfo.findByIdAndUpdate(
      companyOne.companyInfo,
      {
        info: info || companyInfo.info,
        phone: phone || companyInfo.phone,
        website: website || companyInfo.website,
        categories: categories || companyInfo.categories,
        logo:file ? file.location : companyInfo.logo,
        city:city || companyInfo.city
      },
      { new: true }
    );
    return res.status(200).json({
      success: true,
      message: "Company information updated successfully",
      data: updatedInfo,
    });
  } catch (error) {
    next(error);
  }
};
const getCompanyDeletingDescriptions = async (req,res,next) => {
    try {
        const deletingcompanyDescriptions = await companydeletingDescriptions.find({});
        return res.status(200).json({success:true,deletingcompanyDescriptions})
    } catch (error) {
        next(error);
        
    }
}
const deleteCompanyAccount = async (req,res,next) => {
    const {email,password,deletingDescription} = req.body;
    try {
        await validateRequiredFields(req,res,'email','password','deletingDescription');
        const companyOne = await Companies.findOne({email});
        if(!companyOne) throw {status:404,message:'Company'+errorConstants.userErrors.doesntExsist};
        const {_id:company_id,name:company_name,password:companyPassword} = companyOne;
        if(companyPassword !== password) throw {status:401,message:errorConstants.loginErrors.passwordisnotCorrect};
        const deletedCompany  = await Companies.findByIdAndDelete(company_id);
        const newdeletingDescription = new companydeletingDescriptions({
            email,
            name:company_name,
            deletingDescription
        })
        const savedDesc = await newdeletingDescription.save();
        return res.status(200).json({success:true,message:'Company'+successConstants.updatingSuccess.deletedSuccesfully});
    } catch (error) {
        next(error);
    }
}

const blockCompanyAccount = async (req, res,next) => {
    try {
      const {id:company_id} = req.params;
      const company = await Companies.findByIdAndUpdate(
        company_id,
        { $set: { isBlock: true } }
      );
      if (!company) throw {status:404,message:'Company'+errorConstants.userErrors.doesntExsist};
      const io = getSocketInstance();
        console.log(io.sockets.adapter.rooms)
        console.log("from socket")
        console.log(company_id)
        // console.log(io)
        if(io){
            io.to(company_id).emit('company-block',"companyblocked");
        }
      res.redirect(`https://kingjob.pro`);
    } catch (error) {
      next(error);
    }
  };
  

const changeCompanyForgottenPassword = async (req,res,next) => {
    const {email,otp,newpassword,newpasswordRepeat} = req.body;
    console.log(req.body)
    try {
        await validateRequiredFields(req,res,'email','otp','newpassword','newpasswordRepeat')
        const companyOne = await Companies.findOne({email});
        if(!companyOne) throw {status:404,message:'Company'+errorConstants.userErrors.doesntExsist};
        const userOtp = await UsersOtp.findOne({email,otp});
        if(!userOtp) throw {status:404,message:errorConstants.registrationErrors.otpdoesntExsist};
        if(newpassword!==newpasswordRepeat) throw {status:400,message:errorConstants.registrationErrors.passwordMismatch};
        if(newpassword.length<8) throw {status:400,message:errorConstants.registrationErrors.invalidPassword};
        const company_id = companyOne._id;
        await Companies.findByIdAndUpdate(company_id,
        {
            password:newpassword,
            isBlock:false
        },
        {new:true}
        );
        return res.status(200).json({succes:true,message:"Paasword changed succesfully!"})
        
    } catch (error) {
        next(error);
    }
}
const changeCompanyAccountPassword = async (req,res,next) => {
    const {email,password,newpassword,newpasswordRepeat,otp} = req.body;
    try {
        await validateRequiredFields(req,res,'email','password','newpassword','newpasswordRepeat','otp');
        const companyOne = await Companies.findOne({email});
        if(!companyOne) throw {status:404,message:'Company'+errorConstants.userErrors.doesntExsist};
        if(companyOne.password !== password) throw {status:401,message:errorConstants.loginErrors.passwordisnotCorrect};
        if(newpassword.length <6) throw {status:400,message:errorConstants.registrationErrors.invalidPassword};
        if(newpassword !== newpasswordRepeat) throw {status:400,message:errorConstants.registrationErrors.passwordMismatch};
        const userOtp = await UsersOtp.findOne({email});
        const expireTime = ((new Date().getTime()-userOtp.updatedAt.getTime())/1000)/60;
        if(expireTime>3) throw {status:400,message:errorConstants.registrationErrors.otpExpired};
        if(userOtp.otp !== otp) throw {status:400,message:errorConstants.registrationErrors.otpisnotCorrect};
        companyOne.password = newpassword;
        companyOne.isBlock = false;
        await companyOne.save();
        return res.status(200).json({success:true,message:"Password"+successConstants.updatingSuccess.updatedSuccesfully});
    } catch (error) {
        next(error);
        
    }
}
//--------------------------------------------------------------------------
const getNumbersForCompanyMenu = async (req, res,next) => {
    const { company_id } = req.params;
    try {
      const company = await Companies.findById(company_id);
      if (!company) throw {status:404,message:'Company'+errorConstants.userErrors.doesntExsist}
      const currentDate = new Date();
      const startOfThisMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const startOfPreviousMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
      const [companyStats,vacancyCreatedThisMonth,vacancyCreatedPreviosMonth, applyStats,applyStatsThisMonth, applyStatsPreviousMonth] = await Promise.all([
        // Get company statistics
        Jobs.aggregate([
          {
            $match: { company: mongoose.Types.ObjectId(company_id) }
          },
          {
            $group: {
              _id: null,
              jobsCount: { $sum: 1 },
              premJobsCount: { $sum: { $cond: { if: "$premium", then: 1, else: 0 } } },
              allView:{$sum:"$numberOfViews"}
            }
          }
        ]),

        Jobs.aggregate([
          {
            $match: { company: mongoose.Types.ObjectId(company_id),
              createdAt: { $gte: startOfThisMonth }
            },
            
          },
          {
            $group: {
              _id: null,
              jobsCount: { $sum: 1 },
            }
          }
        ]),

        Jobs.aggregate([
          {
            $match: { company: mongoose.Types.ObjectId(company_id),
            createdAt: { $gte: startOfPreviousMonth, $lt: startOfThisMonth } 
            },
            
          },
          {
            $group: {
              _id: null,
              jobsCount: { $sum: 1 },
            }
          }
        ]),

  
        // Get apply statistics
        Applys.aggregate([
            {
              $lookup: {
                from: "jobs",
                localField: "job",
                foreignField: "_id",
                as: "jobInfo"
              }
            },
            {
              $unwind: "$jobInfo"
            },
            {
              $match: { "jobInfo.company": mongoose.Types.ObjectId(company_id)}
            },
            {
              $group: {
                _id: null,
                numOfAllApply: { $sum: 1 },
                numOfApproved: { $sum: { $cond: { if: { $eq: ["$status", "approved"] }, then: 1, else: 0 } } },
                numOfRejected: { $sum: { $cond: { if: { $eq: ["$status", "rejected"] }, then: 1, else: 0 } } }
              }
            }
          ]),
          Applys.aggregate([
            {
              $lookup: {
                from: "jobs",
                localField: "job",
                foreignField: "_id",
                as: "jobInfo"
              }
            },
            {
              $unwind: "$jobInfo"
            },
            {
              $match: {
                "jobInfo.company": mongoose.Types.ObjectId(company_id),
                createdAt: { $gte: startOfThisMonth } // Filter for this month
              }
            },
            {
              $group: {
                _id: null,
                numOfAllApplyThisMonth: { $sum: 1 }
              }
            }
          ]),
    
          // Get apply statistics for the previous month
          Applys.aggregate([
            {
              $lookup: {
                from: "jobs",
                localField: "job",
                foreignField: "_id",
                as: "jobInfo"
              }
            },
            {
              $unwind: "$jobInfo"
            },
            {
              $match: {
                "jobInfo.company": mongoose.Types.ObjectId(company_id),
                createdAt: { $gte: startOfPreviousMonth, $lt: startOfThisMonth } // Filter for the previous month
              }
            },
            {
              $group: {
                _id: null,
                numOfAllApplyPreviousMonth: { $sum: 1 }
              }
            }
          ])

      ]);
      // console.log(vacancyCreatedThisMonth[0]?.jobsCount,vacancyCreatedPreviosMonth[0]?.jobsCount)
    //   console.log(companyStats)
      // console.log(applyStats)
      const thisMonthNumOfAllApply = applyStatsThisMonth[0]?.numOfAllApplyThisMonth || 0;
      const previousMonthNumOfAllApply = applyStatsPreviousMonth[0]?.numOfAllApplyPreviousMonth || 0;
      const thisMonthCreatedVacancy = vacancyCreatedThisMonth[0]?.jobsCount || 0;
      const previosMonthCreatedVacancy = vacancyCreatedPreviosMonth[0]?.jobsCount || 0;
      // console.log(thisMonthNumOfAllApply,previousMonthNumOfAllApply)
      const percentageChangeNumOfAllApply = calculatePercentageChange(previousMonthNumOfAllApply, thisMonthNumOfAllApply);
      const percentageChangeCreatedVacancy = calculatePercentageChange(previosMonthCreatedVacancy,thisMonthCreatedVacancy)
      return res.status(200).json({
        success: true,
        message: 'Numbers'+successConstants.fetchingSuccess.fetchedSuccesfully,
        values: {
          jobsCount: companyStats[0]?.jobsCount || 0,
          premJobsCount: companyStats[0]?.premJobsCount || 0,
          allView:companyStats[0]?.allView || 0,
          numOfAllApply: applyStats[0]?.numOfAllApply || 0,
          numOfApproved: applyStats[0]?.numOfApproved || 0,
          numOfRejected: applyStats[0]?.numOfRejected || 0,
          percentageChangeNumOfAllApply,
          percentageChangeCreatedVacancy
        }
      });
    } catch (error) {
      next(error);
    }
  }
function calculatePercentageChange(previousValue, currentValue) {
    if (previousValue === 0) {
      return currentValue > 0 ? 100 : 0;
    }
    return parseInt(((currentValue - previousValue) / previousValue) * 100);
  }

const getMontlhyVakansyData = async (req,res,next) => {
  const { user_id:company_id } = req.user;
    try {
      const company = await Companies.findById(company_id);
      if (!company) throw {status:404,message:'Company'+errorConstants.userErrors.doesntExsist}
      const currentDate = new Date();
      const monthsData = [];
    for (let i = 0; i < 12; i++) {
      const startDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - i + 1, 0);

      const jobStatus = await Jobs.aggregate([
        {
          $match: {
            company: mongoose.Types.ObjectId(company_id),
            createdAt: { $gte: startDate, $lte: endDate }
          }
        },
        {
          $group: {
            _id: null,
            jobsCount: { $sum: 1 },
            premJobsCount: { $sum: { $cond: { if: "$premium", then: 1, else: 0 } } },
            allView:{$sum:"$numberOfViews"}
          }
        }
      ]);
      
      const monthName = startDate.toLocaleDateString('default', { month: 'long' });
      monthsData.push({
        name: monthName,
        Adi: jobStatus[0]?.jobsCount-jobStatus[0]?.premJobsCount || 0,
        Premium: jobStatus[0]?.premJobsCount || 0,
        amt: 0
      });
    }
    const jobsAll = await Jobs.find({company:company_id});
      const adi = jobsAll.filter(job=>job.premium===false).length;
      const premiumNum = jobsAll.length-adi;
      console.log(adi,premiumNum)
      return res.status(200).json({
        success: true,
        message: 'Data'+successConstants.fetchingSuccess.fetchedSuccesfully,
        values: {
          monthlyData:monthsData.reverse(),    
        }
      });
    } catch (error) {
      next(error);
    }
}



const getcompanydetail = async(req,res,next) => {
  const {id:companyId} = req.params
  console.log("fromcompany",companyId)
  try {

    const data = await Companies.aggregate([
      {$match:{_id:new mongoose.Types.ObjectId(companyId)}},
      {
        $lookup:{
          from:'companyinfos',
          localField:'companyInfo',
          foreignField:'_id',
          as:'companyInfoInfo'
        }
      },
      {$unwind:'$companyInfoInfo'},
      {
        $project:{
          name:1,
          email:1,
          companyInfo:'$companyInfoInfo'
        }
      }
    ])
    // console.log(data)
    return res.status(200).json({success:true,message:'Fetched',data:data[0] || null})
  }catch (error){
    next(error)
  }
}
module.exports = {
  companyIsBlock,
  getCompanies,
  getJobsSharedEachCompany,
  registerCompany,
  loginCompany,
  updateCompanyInfo,
//   logoutCompany,
  getCompanyDeletingDescriptions,
  deleteCompanyAccount,
  blockCompanyAccount,
  changeCompanyAccountPassword,
  changeCompanyForgottenPassword,
  getCompaniesInfo,
  getNumbersForCompanyMenu,
  getMontlhyVakansyData,
  getcompanydetail
};