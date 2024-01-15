//Every status code modifyed


//EXTERNAL LIBRARIES
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const fs = require('fs');
const axios = require('axios');
const path = require('path');
const mongoose = require("mongoose");
const { resolveSoa } = require("dns");
const { readEnv } = require("openai/core.js");

//MODELS
const { Users } = require("../Model/userModel.js");
const { UsersOtp } = require("../Model/UserOtp.js");
const { Companies } = require("../Model/companyModel.js");
const { UserInfo } = require('../Model/userInfoModel.js');
const { Jobs } = require("../Model/jobModel.js");
const { SavedJobs } = require('../Model/savedJobsModel.js');

//UTILS
const { deleteFile } = require('../Utils/FileDelete/fileDelete.js');
const { thanksForRegister } = require('../Utils/GenerateHtmlForSendEmail/thnaksForRegister.js')
const { sendMail } = require('../Utils/EmailSend/SendEmail.js');
const { generateOtp } = require('../Utils/CodeGenerator/CodeGenerator.js');
const { isValidId } = require("../Utils/ValidateId/IsValidId.js");
const { isLinkValid,isLegalLink } = require('../Utils/LinksValidator/linksValidator.js');
const { CheckIdInCollection } = require("../Utils/IdChecker/CheckIdInCollection.js");
const { takeOnlyIllegalLinkFromData } = require('../Utils/LinksValidator/linksValidator.js');
const { validateRequiredFields } = require('../Utils/ValidateId/bodyValidator.js');

//SOCKET
const { getSocketInstance } = require('../socket.js');

//CONSTANTS
const {errorConstants } = require("../Utils/Constants/errorConstants.js");
const { successConstants } = require("../Utils/Constants/successConstants.js");


const getUserWithId = async (req,res,next) => {
  const {userId} = req.params;
  try {
    if(!isValidId(userId)) throw {status:400,message:userId+errorConstants.generalErrors.isnotvalidId};
    const user  = await Users.findById(userId);
    if(!user) throw({status:404,message:errorConstants.userErrors.userdoesntExsist+'ID'});
    // return res.status(404).json({success:false,message:'There is not user with the given Id!'});
     const userAllInfo = await user.populate({
      path:'userinfo',
     })
     return res.status(200).json({succes:true,message:"User"+successConstants.fetchingSuccess.fetchedSuccesfully,data:userAllInfo})
  } catch (error) {
    next(error);
  }
}
const getUsers = async (req, res) => {
  // console.log(req.header)
  // console.log(req.app)
  console.log(req.user)
  const io =getSocketInstance();
  // console.log(io)
  const ip  = req.header('x-forwarded-for') || req.connection.remoteAddress
  // console.log(ip)
  // const {data} = await axios.get(`https://ipinfo.io/185.43.191.138/json?token=e70a7600f44b48`);
  // console.log(data)
  let searching = req.query ? req.query : {};
  let keyWords = Object.keys(searching);
  for (let i of keyWords) {
    if (!searching[i]) {
      delete searching[i];
    }
  }
  try {
    const users = await Users.find().select('email')
    const returned = users.map(us=>us.email)
    // const users = await Users.find(searching).populate({
    //   path:'userinfo',
    // });
    // if (users.length === 0)
    //   return res
    //     .status(200)
    //     .json({ succes: false, message: "There are not users" });
    // return res.status(200).json({ succes: true, users });
    return res.status(200).json({returned})
  } catch (error) {
    return res
      .status(500)
      .json({ succes: false, message: `Error at fetching users,error:${error.name}` });
  }
};
//<-----------------------------USER CREDENTIALS ACYION-------------------------------->\\

const registerUser = async (req, res, next) => {
  const { name, email, password, passwordRepeat,otp } = req.body;
  try {
    await validateRequiredFields(req,res,'name','email','password','passwordRepeat','otp');
    if (password.length < 6) throw {status:400,message:errorConstants.registrationErrors.invalidPassword};
    if (password !== passwordRepeat) throw {status:400,message:errorConstants.registrationErrors.passwordMismatch};
    const [userone,userOtp] = await Promise.all([
      Users.findOne({ email }),
      UsersOtp.findOne({email})
    ])
    if (userone) throw {status:400,message:errorConstants.userErrors.userExists};
    if(!userOtp) throw {status:400,message:errorConstants.registrationErrors.otpdoesntExsist};
    if(((new Date().getTime()-userOtp?.updatedAt.getTime())/1000)/60>2) throw {status:400,message:errorConstants.registrationErrors.otpExpired};
    if(userOtp?.otp !== otp) throw {status:400,message:errorConstants.registrationErrors.otpisnotCorrect};
    // const salt = await bcrypt.genSalt();
    // const hashedPassword = await bcrypt.hash(password, salt);
    const newUser = new Users({
      name: name,
      email: email,
      password: password,
    });
    const savedUser = await newUser.save();
    const newUserInfo = new UserInfo({
      user:savedUser._id,
      education:[],
      achievements:[],
      links:[],
      experiences:[],
    })
    const savedUserInfo = await newUserInfo.save();
    newUser.userinfo = savedUserInfo._id;
    await newUser.save();
    await sendMail('notification',email,'Thanks for register',thanksForRegister(name));
    return res.status(200).json({success:true,savedUser,message:successConstants.registrationSuccess.successRegistered});
  } catch (error) {
    next(error);
  }
};

const loginUser = async (req, res,next) => {
  try {
    const { email, password } = req.body;
    await validateRequiredFields(req,res,'email','password');
    const exsisting_user = await Users.findOne({ email });
    if (!exsisting_user) throw {status:404,message:errorConstants.userErrors.userdoesntExsist+"email"};
    if (password !== exsisting_user.password) throw {status:401,message:errorConstants.loginErrors.passwordisnotCorrect};
    const jwtSecretKey = process.env.JWT_SECRET_KEY;
    const token = jwt.sign({ user_id: exsisting_user._id,u_t_p:'u_s_r' }, jwtSecretKey);
    const returneduser = await Users.findById(exsisting_user._id)
    .select('-password -notifications -userinfo -updatedAt -createdAt');
    const info = await UserInfo.findOne({user:exsisting_user._id});
    const modified = {...returneduser.toObject(),u_t_p:'u_s_r'}
    res.cookie("user_token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "None",
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    });
    res.status(200).json({ succes: true, user: {modified,info}});
  } catch (error) {
    next(error)
  }
};





const deleteUser = async (req,res) => {
  const user_id = req.params.id
  try {
    if(!isValidId(user_id)) return res.status(200).json({succes:false,message:"user_id format is not correct for mongo Db"});
    const user = await Users.findById(user_id)
    console.log(user)
    if(user===null) return res.status(200).json({succes:false,message:"User not found!..."});
    const deletedUser = await Users.findByIdAndDelete(user_id);
    return res.status(200).json({succes:true,message:`${deletedUser.email} deleted succesfully`})
  } catch (error) {
    res.status(500).json({succes:false,message:`Error at deleting user,error:${error.name}`})
  }
}


const updateUser = async (req,res,next) => {
  const user_id = req.params.id;
  const {name} = req.body;
  try {
    if(!isValidId(user_id)) throw {status:400,message:errorConstants.generalErrors.isnotvalidId};
    const user = await Users.findById(user_id);
    if(!user) throw {status:404,message:errorConstants.userErrors.userdoesntExsist+"ID"};
    const updatedValue = await Users.findByIdAndUpdate(
      user_id,
      {
        name:name || user.name,
      },
      {new:true},
    ) 
    return res.status(200).json({success:true,message:"Name"+successConstants.updatingSuccess.updatedSuccesfully,data:updatedValue})
  } catch (error) {
    console.log(error)
    next(error);
  }
}
const updatePassword = async (req,res,next) => {
  const {email,otp,newpassword,newpasswordRepeat} = req.body;
  try {
    await validateRequiredFields(req,res,'email','otp','newpassword','newpasswordRepeat');
    const [userOne,userOneOtp] = await Promise.all([
      Users.findOne({email}),
      UsersOtp.findOne({email})
    ])
    if(!userOne || !userOneOtp)  throw {status:404,message:errorConstants.userErrors.userdoesntExsist+"Email"}
    if(userOneOtp.otp !== otp) throw {status:400,message:errorConstants.registrationErrors.otpisnotCorrect};
    if(newpassword.length<6) throw {status:400,message:errorConstants.registrationErrors.invalidPassword};
    if(newpassword !== newpasswordRepeat) throw {status:400,message:errorConstants.registrationErrors.passwordMismatch};
    if(((new Date().getTime()-userOneOtp.updatedAt.getTime())/1000)/60>2) throw {status:400,message:errorConstants.registrationErrors.otpExpired};
    userOne.password = newpassword;
    await userOne.save();
    return res.status(200).json({success:true,message:"Password"+successConstants.updatingSuccess.updatedSuccesfully});
  } catch (error) {
    next(error);
  }
}
//<<--------------------------------User profile update---------------------------------------->>\\
const updateUserCareerInfo = async (req, res, next) => {
  const {
    jobTitle,
    phone,
    currentSalary,
    expestedSalary,
    experiencesYear,
    age,
    educationLevelNow,
    languages,
    coverLetter,
    city,skills
  } = req.body;
  const { user_id: userId } = req.user;

  try {
    if (!isValidId(userId)) {
      throw { status: 400, message: errorConstants.generalErrors.isnotvalidId };
    }

    const userOne = await Users.findById(userId);
    if (!userOne) {
      throw {
        status: 404,
        message: errorConstants.userErrors.userdoesntExsist + "ID",
      };
    }

    const userInfo = await UserInfo.findById(userOne.userinfo);
    if (!userInfo) {
      throw {
        status: 404,
        message: errorConstants.userErrors.userdoesntExsist + "User Info",
      };
    }

    // Update user career information
    const updatedInfo = await UserInfo.findByIdAndUpdate(
      userOne.userinfo,
      {
        jobTitle: jobTitle || userInfo.jobTitle,
        phone: phone || userInfo.phone,
        currentSalary: currentSalary || userInfo.currentSalary,
        expestedSalary: expestedSalary || userInfo.expestedSalary,
        experiencesYear: experiencesYear || userInfo.experiencesYear,
        age: age || userInfo.age,
        educationlevelNow: educationLevelNow || userInfo.educationlevelNow,
        languages: languages || userInfo.languages,
        coverLetter:coverLetter || userInfo.coverLetter,
        city:city || userInfo.city,
        skills:skills || userInfo.skills
      },
      { new: true }
    );

    return res.status(200).json({
      success: true,
      message: "User career information updated successfully",
      data: updatedInfo,
    });
  } catch (error) {
    next(error);
  }
};


const updateUserCarierInfo = async (req,res,next) => {
  const {birthday,city} = req.body;
  const {id:userId} = req.params;
  try {
    if(!isValidId(userId)) throw {status:400,message:errorConstants.generalErrors.isnotvalidId}
    const userOne = await Users.findById(userId);
    if(!userOne) throw {status:404,message:errorConstants.userErrors.userdoesntExsist+"ID"};
    const userInfo = await UserInfo.findById(userOne.userinfo);
    if(!userInfo) throw {status:404,message:errorConstants.userErrors.userdoesntExsist+"User Info"};
    const updatedInfo = await UserInfo.findByIdAndUpdate(userOne.userinfo,{
      birthday:birthday || userInfo.birthday,
      city:city || userInfo.city
    },{new:true});
    return res.status(200).json({succes:true,message:"User info"+successConstants.updatingSuccess.updatedSuccesfully,data:updatedInfo})
  } catch (error) {
    next(error);
  }
}
const addEducation = async (req,res,next) => {
  const {user_id:userId} = req.user;
  const {education} = req.body;
  console.log(req.body)
  try {
    const userOne = await Users.findById(userId);
    if(!userOne) throw {status:404,message:errorConstants.userErrors.userdoesntExsist+"ID"};
    const userInfo = await UserInfo.findOne({user:userId});
    if(!userInfo) throw {status:404,message:errorConstants.userErrors.userdoesntExsist+"User Info"};
    if(userInfo.educations.some(educ=>educ.name === education.name)) throw {status:400,message:education.name+ errorConstants.userErrors.alreadyExsist};
    userInfo.educations = [...userInfo.educations,education];
    await userInfo.save();
    return res.status(200).json({succes:true,message:education.name+successConstants.updatingSuccess.addedSuccesfully,data:userInfo.educations[userInfo.educations.length-1]});
  } catch (error) {
    next(error);
  }
}
const updateEducation = async (req,res,next) => {
  const {userId,educationId} = req.params
  const {newname,newstartdate,newenddate,newcontinue} = req.body;
  try {
    const userOne = await Users.findById(userId);
    if(!userOne) throw {status:404,message:errorConstants.userErrors.userdoesntExsist+"ID"}
    const userInfo = await UserInfo.findOne({user:userId});
    if(!userInfo) throw {status:404,message:errorConstants.userErrors.userdoesntExsist+"User Info"};
    const educationIndex = userInfo.educations.findIndex(educ=>educ._id.toString() === educationId);
    if(educationIndex === -1) throw {status:404,message:"Education"+errorConstants.userErrors.doesntExsist};
    const {name,startDate,endDate,continue:cont} = userInfo.educations[educationIndex]
    const updatedEducations = await UserInfo.findOneAndUpdate(
      { 'educations._id': educationId },
      { $set: { 
        'educations.$.name': newname || name,
        'educations.$.startDate': newstartdate || startDate,
        'educations.$.endDate': newenddate || endDate,
        'educations.$.continue': newcontinue || cont,
     } 
    },
      { new: true }
    );
    return res.status(200).json({success:true,message:'Education'+successConstants.updatingSuccess.updatedSuccesfully,data:updatedEducations.educations})
  } catch (error) {
    next(error);
  }
}
const deleteEducation = async (req,res,next) => {
  const {educationId} = req.params
  const {user_id:userId} = req.user;
  try {
    const user = await Users.findById(userId);
    if(!user) throw {status:404,message:errorConstants.userErrors.userdoesntExsist+"ID"};
    const {userinfo:userinfoId}  = user;
    const userInfo = await UserInfo.findById(userinfoId);
    if(!userInfo) throw {status:404,message:errorConstants.userErrors.userdoesntExsist+"User Info"};
    const educationIndex = userInfo.educations.findIndex(educ=>educ._id.toString() === educationId);
    if(educationIndex === -1) throw {status:404,message:"Education"+errorConstants.userErrors.doesntExsist};
    userInfo.educations = userInfo.educations.filter(educ=>educ._id.toString()!==educationId);
    await userInfo.save();
    return res.status(200).json({success:true,message:'Education'+successConstants.updatingSuccess.deletedSuccesfully,data:educationId});
  } catch (error) {
    next(error);
  }
}

const addLinks = async (req, res, next) => {
  const { links } = req.body;
  const { user_id: userId } = req.user;

  try {
    if (links.length === 0) throw { status: 400, message: 'Please add links' };

    const userOne = await Users.findById(userId);
    if (!userOne) throw { status: 404, message: errorConstants.userErrors.userdoesntExsist + 'ID' };

    const userInfo = await UserInfo.findOne({ user: userId });
    if (!userInfo) throw { status: 404, message: errorConstants.userErrors.userdoesntExsist + 'User Info' };

    const linksFromValidation = takeOnlyIllegalLinkFromData(links);

    // Helper function to remove duplicate links
    const removeDuplicateLinks = (linkArray) => {
      const uniqueLinks = [];
      const seenUrls = new Set();

      for (const link of linkArray) {
        if (!seenUrls.has(link.url)) {
          uniqueLinks.push(link);
          seenUrls.add(link.url);
        }
      }

      return uniqueLinks;
    };

    const uniqueLinks = removeDuplicateLinks(linksFromValidation);

    const haveIllegal = links.length !== linksFromValidation.length;

    // Check if the links already exist in the database
    const existingLinks = userInfo.links.map(link => link.url);
    const newLinks = uniqueLinks.filter(link => !existingLinks.includes(link.url));

    if (newLinks.length > 0) {
      userInfo.links = [...userInfo.links, ...newLinks];
      await userInfo.save();

      return res.status(200).json({
        success: true,
        message: `Links added successfully${haveIllegal ? ', and illegal links removed' : ''}`,
        data: userInfo.links
      });
    } else {
      return res.status(200).json({
        success: true,
        message: 'No new links added (links already exist in the database)',
        data: userInfo.links
      });
    }
  } catch (error) {
    next(error);
  }
};


const updateLink = async (req,res,next) => {
  const {userId,linkId} = req.params;
  const {url:newUrl} = req.body;
  try {
    const userOne = await Users.findById(userId);
    if(!userOne) throw {status:404,message:errorConstants.userErrors.userdoesntExsist+"ID"};
    const userInfo = await UserInfo.findOne({user:userId});
    if(!userInfo) throw {status:404,message:errorConstants.userErrors.userdoesntExsist+"User Info"};

    const linkIndex = userInfo.links.findIndex((link)=>link._id.toString() === linkId);
    const updatedLink = await UserInfo.findOneAndUpdate(
      { 'links._id': linkId },
      { $set: { 'links.$.url': newUrl || userInfo.links[linkIndex].url } },
      { new: true } 
    );
    return res.status(200).json({success:true,message:`Link`+successConstants.updatingSuccess.updatedSuccesfully,data:updatedLink.links[linkIndex]})
  } catch (error) {
    next(error);
  }
}
const deleteLink = async (req,res,next) => {
  const {userId,linkId} = req.params;
  try {
    const userOne = await Users.findById(userId);
    if(!userOne) throw {status:404,message:errorConstants.userErrors.userdoesntExsist+"ID"};
    const userInfo = await UserInfo.findOne({user:userId});
    if(!userInfo) throw {status:404,message:errorConstants.userErrors.userdoesntExsist+"User Info"};
    const linkIndex = userInfo.links.findIndex(link=>link._id.toString() === linkId);
    if(linkIndex === -1) throw {status:404,message:"Link"+errorConstants.userErrors.doesntExsist}
    userInfo.links = userInfo.links.filter(link=>link._id.toString() !== linkId);
    await userInfo.save();
    return res.status(200).json({success:true,message:'Link'+successConstants.updatingSuccess.deletedSuccesfully,data:linkId})
  } catch (error) {
    next(error);
  }
}
const addAchievement = async (req,res,next) => {
  const {user_id:userId} = req.user;
  const {name,certificateUrl,startDate,endDate} = req.body;
  try {
    await validateRequiredFields(req,res,'name','certificateUrl');
    if(!isLinkValid(certificateUrl)) throw {status:400,message:'URL'+errorConstants.generalErrors.isnotCorrect};
    if(!isLegalLink(certificateUrl)) throw {status:400,message:'LINK'+errorConstants.generalErrors.isnotLegal};
    const userOne = await Users.findById(userId);
    if(!userOne) throw {status:404,message:errorConstants.userErrors.userdoesntExsist+"ID"};
    const userInfo = await UserInfo.findOne({user:userId});
    if(!userInfo) throw {status:404,message:errorConstants.userErrors.userdoesntExsist+"User Info"};
    if(userInfo.achievements.some(ach=>ach.certificateUrl === certificateUrl)) throw {status:400,message:"Achievement"+errorConstants.userErrors.alreadyExsist};
    userInfo.achievements.push({name,certificateUrl,startDate,endDate});
    await userInfo.save()
    return res.status(200).json({succes:true,message:'Achievement'+successConstants.updatingSuccess.addedSuccesfully,data:userInfo.achievements[userInfo.achievements.length-1]})
  } catch (error) {
    next(error);
  }
}
const updateAchievement = async (req,res,next) => {
  const {userId,achievementId} = req.params;
  const {newName,newCertificateUrl}  = req.body;
  try {
    await validateRequiredFields(req,res,'newName','newCertificateUrl');
    if(!isLinkValid(newCertificateUrl)) throw {status:400,message:'URL'+errorConstantsgeneralErrors.isnotCorrect};
    if(!isLegalLink(newCertificateUrl)) throw {status:400,message:'LINK'+errorConstantsgeneralErrors.isnotLegal};
    const userOne = await Users.findById(userId);
    if(!userOne) throw {status:404,message:errorConstants.userErrors.userdoesntExsist+"ID"};
    const userInfo = await UserInfo.findOne({user:userId});
    if(!userInfo) throw {status:404,message:errorConstants.userErrors.userdoesntExsist+"User Info"};
    const achievementIndex = userInfo.achievements?.findIndex(ach=>ach._id.toString()===achievementId);
    if(achievementIndex === -1) throw {status:404,message:'Achievement'+errorConstants.userErrors.doesntExsist};
    const {name,certificateUrl} = userInfo.achievements[achievementIndex]
    const updatedAchievements = await UserInfo.findOneAndUpdate(
      { 'achievements._id': achievementId },
      { $set: { 
        'achievements.$.name': newName || name,
        'achievements.$.certificateUrl': newCertificateUrl || certificateUrl,
     } 
    },
      { new: true }
    );
    return res.status(200).json({success:true,message:`Achievement`+successConstants.updatingSuccess.updatedSuccesfully,data:updatedAchievements.achievements[achievementIndex]})
  } catch (error) {
    next(error);
  }
}
const deleteAchievement = async (req,res,next) => {
  const {achievementId} = req.params;
  const {user_id:userId} = req.user;
  try {
    const userOne = await Users.findById(userId);
    if(!userOne) throw {status:404,message:errorConstants.userErrors.userdoesntExsist+"ID"};
    const userInfo = await UserInfo.findOne({user:userId});
    if(!userInfo) throw {status:404,message:errorConstants.userErrors.userdoesntExsist+"User Info"};
    const achievementIndex = userInfo.achievements?.findIndex(ach=>ach._id.toString()===achievementId);
    if(achievementIndex === -1) throw {status:404,message:'Achievement'+errorConstants.userErrors.doesntExsist};
    userInfo.achievements = userInfo.achievements?.filter(ach=>ach._id.toString()!==achievementId);
    await userInfo.save();
    return res.status(200).json({success:true,message:'Achievement'+successConstants.updatingSuccess.deletedSuccesfully,data:achievementId});
  } catch (error) {
    next(error);
  }
}
//--------------------------------------------------------------------
const addExperience = async (req,res,next) => {
  const {user_id:userId} = req.user;
  const {companyName,position,startDate,endDate,description} = req.body;
  try {
    const user = await Users.findById(userId);
    if(!user) throw {status:404,message:errorConstants.userErrors.userdoesntExsist+"ID"};
    const userInfo = await UserInfo.findOne({user:userId});
    if(!userInfo) throw {status:404,message:errorConstants.userErrors.userdoesntExsist+"User Info"};
    await validateRequiredFields(req,res,'companyName','position','startDate');
    if(userInfo.experiences.some(exp=>exp.companyName === companyName && exp.position === position)) throw {status:400,message:'Experience'+errorConstants.userErrors.alreadyExsist};
    userInfo.experiences.push(req.body);
    await userInfo.save();
    return res.status(200).json({success:true,message:'Experience'+successConstants.updatingSuccess.addedSuccesfully,data:userInfo.experiences[userInfo.experiences.length-1]});
  } catch (error) {
    next(error);
  }
}
const updateExperience = async (req,res,next) => {
    const {userId,experienceId} = req.params;
    const {newcompanyName,newposition,newrelatedLink,newstartDate,newendDate,newcity,newdescription,newpresent} = req.body;
    const user = await Users.findById(userId);
    if(!user) throw {status:404,message:errorConstants.userErrors.userdoesntExsist+"ID"};
    const userInfo = await UserInfo.findOne({user:userId});
    if(!userInfo) throw {status:404,message:errorConstants.userErrors.userdoesntExsist+"User Info"};
    if(!newpresent){
      if(!newendDate) return res.status(200).json({succes:false,message:'Please enter endDate or select present!'});
    }
    if(newrelatedLink){
      if(!isLinkValid(newrelatedLink)) throw {status:400,message:errorConstants.generalErrors.isnotCorrect};
      if(!isLegalLink(newrelatedLink)) throw {status:400,message:errorConstants.generalErrors.isnotLegal};
    }
    
    const experiencesindex = userInfo.experiences.findIndex(exp=>exp._id.toString() === experienceId);
    if(experiencesindex === -1) throw {status:404,message:'Experience'+errorConstants.userErrors.doesntExsist};
    const {companyName,position,relatedLink,startDate,endDate,city,description,present} = userInfo.experiences[experiencesindex];
    if(userInfo.experiences.some(exp=>exp.companyName === newcompanyName && exp.position === (newposition || position))) throw {status:400,message:'Experience'+errorConstants.userErrors.alreadyExsist};
    const updatedExperience = await UserInfo.findOneAndUpdate(
      {'experiences._id':experienceId},
      {$set : {
        'experiences.$.companyName':newcompanyName || companyName,
        'experiences.$.position':newposition || position,
        'experiences.$.relatedLink':newrelatedLink || relatedLink,
        'experiences.$.startDate':newstartDate || startDate,
        'experiences.$.endDate':newendDate || endDate,
        'experiences.$.city':newcity || city,
        'experiences.$.description':newdescription || description,
        'experiences.$.present':newpresent || present
      }
    },
    {new:true}
    )
    return res.status(200).json({success:true,message:'Experience'+successConstants.updatingSuccess.updatedSuccesfully,data:updatedExperience.experiences[experiencesindex]});
}
const deleteExperience = async (req,res,next) => {
  const {user_id:userId} = req.user;
  const {experienceId} = req.params;
  try {
    const user = await Users.findById(userId);
    if(!user) throw {status:404,message:errorConstants.userErrors.userdoesntExsist+"ID"};
    const userInfo = await UserInfo.findOne({user:userId});
    if(!userInfo) throw {status:404,message:errorConstants.userErrors.userdoesntExsist+"User Info"};
    const experienceindex = userInfo.experiences.findIndex(exp=>exp._id.toString()===experienceId);
    if(experienceindex === -1) throw {status:404,message:'Experience'+errorConstants.userErrors.doesntExsist};
    userInfo.experiences = userInfo.experiences.filter(exp=>exp._id.toString()!==experienceId);
    userInfo.save();
    return res.status(200).json({success:false,message:'Experience'+successConstants.updatingSuccess.deletedSuccesfully,data:experienceId});
  } catch (error) {
    next(error);
  }
}
const userAddFile = async (req,res,next) => {
  const user_id = req.params.id;
  const file = req.file;
  // console.log(file)
  try {
   if(!file) return res.status(200).json({succes:false,message:'Please select file in correct format PDF'});
    // console.log(file)
    // console.log(user_id)
    const userOne = await Users.findById(user_id).populate('userinfo','file');
    if(!userOne) return res.status(200).json({succes:false,message:`There is not user with the given Id!`})
    // console.log(userOne)
    if(file.size >=512*1024) return res.status(200).json({succes:false,message:'File size must be less than 512 kb'});
    // console.log(file)
  //   if((userOne.userinfo)?.file){
  //   deleteFile((userOne.userinfo)?.file, 'uploads', (err, deleteResult) => {
  //     if (err) {
  //         console.error(`Error in deleteFile: ${err}`);
  //         // Handle the error gracefully, possibly by sending an error response.
  //         return res.status(200).json({ success: false, message: `Error at deleting file, error: ${err.message}` });
  //     }
  //     console.log("deleteresult:",deleteResult); // Message indicating success or failure
  //     // ... (rest of your code)
  // });
// }
    const updatedUser = await UserInfo.findOneAndUpdate({user:user_id},{file:file.location},{new:true});
    if(!updatedUser) return res.status(200).json({succes:false,message:"There is not user with this ID"});
    return res.status(200).json({succes:true,message:"Cv updated succesfully",data:updatedUser});
  } catch (error) {
    return res.status(500).json({succes:false,message:`Error at adding file,error:${error.name}`})
  }
}
const userDeleteFile = async (req,res,next) => {
  const {userId} = req.params;
  try {
    const userOne = await Users.findById(userId).populate('userinfo','file');
    if(!userOne) return res.status(200).json({succes:false,message:`There is not user with the given Id!`})
    const fileName = (userOne.userinfo)?.file;
  // if(fileName){
  //   deleteFile(fileName, 'uploads', (err, deleteResult) => {
  //     if (err) {
  //         console.error(`Error in deleteFile: ${err}`);
  //         // Handle the error gracefully, possibly by sending an error response.
  //         return res.status(200).json({ success: false, message: `Error at deleting file, error: ${err.message}` });
  //     }
  //     console.log("deleteresult:",deleteResult);
  //   })
    
  // }
    const updatedUser = await UserInfo.findOneAndUpdate({user:userId},{$set:{file:""}},{new:true});
    return res.status(200).json({succes:true,message:"File deleted succesfully"})
  } catch (error) {
    return res.status(500).json({succes:false,message:`Error at deleting file,error:${error.name}`})
  }
}
const userUpdateProfilePhoto = async (req,res,next) => {
  const {user_id:userId} = req.user;
  const file = req.file;
  try {
    if(!file) throw {status:400,message:'Please select file!'}
    const user = await Users.findById(userId).populate('userinfo','profilepic');
    if(!user) throw {status:404,message:'There is not user with the given Id!'};
    const fileName = (user.userinfo)?.profilepic;
    // if(fileName){
    //   deleteFile(fileName, 'userprofilepic', (err, deleteResult) => {
    //     if (err) {
    //         console.error(`Error in deleteFile: ${err}`);
    //         // Handle the error gracefully, possibly by sending an error response.
    //         return res.status(200).json({ success: false, message: `Error at deleting file, error: ${err.message}` });
    //     }
    //     console.log("deleteresult:",deleteResult);
    //   })
    // }

    const updatedProfilePic = await UserInfo.findOneAndUpdate({user:userId},{
      $set:{
        profilepic:file?.location || fileName
      }
    },{new:true})
    return res.status(200).json({succes:true,message:'Profile photo updated succesfully!',data:updatedProfilePic})
  } catch (error) {
   next(error)
  }
}
const userDeleteProfilePhoto = async (req,res,next) => {
  const {userId} = req.params;
  try {
    const userOne = await Users.findById(userId).populate('userinfo','profilepic');
    if(!userOne) return res.status(200).json({succes:false,message:`There is not user with the given Id!`})
    const fileName = (userOne.userinfo)?.profilepic;
  // if(fileName){
  //   deleteFile(fileName, 'userprofilepic', (err, deleteResult) => {
  //     if (err) {
  //         console.error(`Error in deleteFile: ${err}`);
  //         // Handle the error gracefully, possibly by sending an error response.
  //         return res.status(200).json({ success: false, message: `Error at deleting file, error: ${err.message}` });
  //     }
  //     console.log("deleteresult:",deleteResult);
  //   })
    
  // }
    const updatedUser = await UserInfo.findOneAndUpdate({user:userId},{$set:{profilepic:""}},{new:true});
    return res.status(200).json({succes:true,message:"File deleted succesfully"})
  } catch (error) {
    return res.status(500).json({succes:false,message:`Error at deleting profile photo,error:${error.name}`})
  }
}
//<<----------------------------End Of User profile update---------------------------------->>\\


const userAddJobToSavedJobs = async (req,res,next) => {
  const {jobId} = req.params;
  const {user_id:userId} = req.user;
  try {
    const job = await Jobs.findById(jobId);
    if(!job) throw {status:404,message:'JOB'+errorConstants.userErrors.doesntExsist};
    const savedJob = await SavedJobs.findOne({user:userId,job:jobId});
    console.log(savedJob)
    if(savedJob){
      const deletedJob = await SavedJobs.findByIdAndDelete(savedJob._id);
      return res.status(200).json({success:true,message:`${job.name} removed from favorit`,data:jobId,action:'remove'})
    }
    const dt = new SavedJobs({
        user:userId,
        job:jobId
      });
    const addedJob = await dt.save();
    return res.status(200).json({success:true,message:`${job.name} added to favorit`,data:addedJob,action:"add"})
  } catch (error) {
    next(error);
  }
}

const getAllUserSavedJob = async (req,res,next)=>{
  const {user_id:userId} = req.user;
  console.log(userId)
  try {
    const userOne = await Users.findById(userId);
    if(!userOne) throw {status:404,message:errorConstants.userErrors.userdoesntExsist+"ID"};
    const savedJobs = await SavedJobs.find({user:userId})
    return res.status(200).json({success:true,message:"SavedJobs"+successConstants.fetchingSuccess.fetchedSuccesfully,data:savedJobs});
  } catch (error) {
    next(error);
  }
}




const getUserNotifications = async (req,res,next) => {
  const {id:user_id} = req.params;
  try {
    const notifications = await Users.findById(user_id)
    .populate({
      path:'notifications',
      select:'types',
      populate:{
        path:'apply',
        select:'status',
        populate:[
          {
            path:'user',
            select:'name'
          },
          {
            path:'job',
            select:'name category',
            populate:{
              path:'company',
              select:'name',
              populate:{
                path:'companyInfo',
                select:'logo'
              }
            }
          }
        ]
      }
    });
    if(!notifications) throw {status:404,message:errorConstants.userErrors.userdoesntExsist+"ID"};
    return res.status(200).json({success:true,message:'Notifications'+successConstants.fetchingSuccess.fetchedSuccesfully,notifications:notifications.notifications})
  } catch (error) {
    next(error);
  }
}
const sendNotificationToUser = async (userid,applyid,types) => {
  const notifysendeduser = await Users.findByIdAndUpdate(userid,{$push:{notifications:{apply:applyid,types:types}}},{new:true})
  // .populate({
  //   path:'notifications',
  //   select:'types',
  //   populate:{
  //     path:'apply',
  //     select:'status',
  //     populate:[
  //       {
  //         path:'user',
  //         select:'name'
  //       },
  //       {
  //         path:'job',
  //         select:'name category',
  //         populate:{
  //           path:'company',
  //           select:'name',
  //           populate:{
  //             path:'companyInfo',
  //             select:'logo'
  //           }
  //         }
  //       }
  //     ]
  //   }
  // });
  return notifysendeduser?.notifications[(notifysendeduser?.notifications).length-1] || null;
}
//Fetching schools data

const fetchSchools = async (req,res) => {
  try {
    const collection = mongoose.connection.collection('school');
    const data = await collection.find({}).toArray();
    return res.status(200).json({ success: true, message:'Schools fetched succefully',data:data });
  } catch (error) {
    return res.status(500).json({success:false,message:`Error at fetching scool ,error:${error.name}`})
  }
}
module.exports = {
  getUsers,
  registerUser,
  loginUser,
  deleteUser,
  updateUser,
  updatePassword,
  userAddJobToSavedJobs,
  getAllUserSavedJob,
  userDeleteFile,
  userAddFile,
  getUserNotifications,
  sendNotificationToUser,
  updateUserCarierInfo,
  deleteEducation,
  updateEducation,
  addEducation,
  fetchSchools,
  addLinks,
  updateLink,
  deleteLink,
  addAchievement,
  updateAchievement,
  deleteAchievement,
  addExperience,
  updateExperience,
  deleteExperience,
  getUserWithId,
  userUpdateProfilePhoto,
  userDeleteProfilePhoto,
  updateUserCareerInfo
};




