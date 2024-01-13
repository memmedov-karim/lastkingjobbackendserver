//Every status code modifyed


//EXTERNAL LIBRARIES
const jwt = require("jsonwebtoken");

//MODELS
const { Users } = require("../Model/userModel.js");
const { UsersOtp } = require("../Model/UserOtp.js");
const { Companies } = require("../Model/companyModel.js");
const { UserInfo } = require("../Model/userInfoModel.js");
const { CompanyInfo } = require("../Model/companyInfoModel.js");

//UTILS
const {generateOtp} = require('../Utils/CodeGenerator/CodeGenerator.js');
const {generateHtmlSendOtp} = require('../Utils/GenerateHtmlForSendEmail/generateHtmlSendOtp.js');
const {sendMail} = require('../Utils/EmailSend/SendEmail.js');
const {validateRequiredFields} = require('../Utils/ValidateId/bodyValidator.js');
const {errorConstants} = require("../Utils/Constants/errorConstants.js");
const {successConstants} = require("../Utils/Constants/successConstants.js");
const { generateHtml } = require("../Utils/GenerateHtmlForSendEmail/generateHtml.js");
const getUsersOtp = async (req,res,next) => {
    try {
      const usersotp = await UsersOtp.find({});
      return res.status(200).json({success:true,data:usersotp});
    } catch (error) {
      next(error);
    }
  }
  const verifyEmailAndSendOtp = async (req, res,next) => {
    const { email } = req.body;
    try {
      await validateRequiredFields(req,res,'email');
      const [user, company] = await Promise.all([
        Users.findOne({ email }),
        Companies.findOne({ email }),
      ]);
      if (!user && !company) throw {status:404,message:'User or Company'+errorConstants.userErrors.doesntExsist};
      const Data = user || company;
      console.log(1)
      const userotp = await UsersOtp.findOne({ email });
      console.log(2)
      console.log(userotp)
      const otp = await generateOtp(5);
      console.log(otp)
      console.log(3)
      const emailcontent = await generateHtmlSendOtp(Data?.name, "password changing", otp);
      console.log(4)
      await sendMail('otp',email, "Verification", emailcontent)
      console.log(5)
      userotp.otp = otp;
      console.log(6)
      await userotp.save()
      console.log(7)
      return res.status(200).json({ success: true, message: `OTP sent to ${email}, please check your email address or spam!`});
    } catch (error) {
      next(error);
    }
  };
  




const checkUserAndValidate = async (req,res,next) => {
    const { name, email, password, passwordRepeat } = req.body;
    try {
      await validateRequiredFields(req,res,'name','email','password','passwordRepeat');
      if (password.length < 6) throw {status:400,message:errorConstants.registrationErrors.invalidPassword};
      if (password !== passwordRepeat) throw {status:400,message:errorConstants.registrationErrors.passwordMismatch};
      const [userOne,companyOne] = await Promise.all([
        Users.findOne({email}),
        Companies.findOne({email}),
      ])
      if(userOne || companyOne) throw {status:400,message:'User'+errorConstants.userErrors.alreadyExsist};
      const userotp = await UsersOtp.findOne({email});
      const otp = await generateOtp(5);
      const emailcontent = await generateHtmlSendOtp(name,"registration",otp);
      await sendMail('otp',email,"Verifitication",emailcontent).catch(console.error);
      if(!userotp){
        const newUserOtp = new UsersOtp({
          email:email,
          otp:otp
        })
        const savedUserOtp = await newUserOtp.save();
        return res.status(200).json({success:true,message:`OTP send this ${savedUserOtp.email} address,please check your email address or spam`})
      }
      else{
        userotp.otp = otp;
        await userotp.save();
        return res.status(200).json({success:true,message:`OTP send this ${email} addres,please check your email addres or spam`})
      }
    } catch (error) {
      next(error);
    }
  
}

const verifyOtp = async (req,res,next) => {
    const {email,otp} = req.body; 
    try {
      await validateRequiredFields(req,res,'email','otp');
      const userOtpOne = await UsersOtp.findOne({email,otp});
      if(!userOtpOne) throw {status:401,message:errorConstants.registrationErrors.otpisnotCorrect};
    //   console.log(((new Date().getTime()-userOtpOne.updatedAt.getTime())/1000)/60);
      const expiredTime = ((new Date().getTime()-userOtpOne.updatedAt.getTime())/1000)/60;
      if(expiredTime>2) throw {status:400,message:errorConstants.registrationErrors.otpExpired};
      return res.status(200).json({success:true,message:"Succesfully validated"});
    } catch (error) {
      next(error);
    }
  }

const profile = async (req,res,next) => {
    const userInfo = req.user;
    const {user_id,u_t_p} = userInfo;
    const available_U_T_P = ['u_s_r','c_m_p'];
    console.log(userInfo)
    try {
        if(!available_U_T_P.includes(u_t_p)) throw {status:400,message:`What is ${u_t_p}?`};
        const Model = u_t_p==='u_s_r' ? Users : Companies;
        const user = await Model.findById(user_id);
        let pppdata;
        if(u_t_p === 'u_s_r'){
            pppdata = await  user.populate({
                path:'userinfo',
            })
        }
        else{
            pppdata = await user.populate({
                path:'companyInfo',
                populate:{
                    path:'workers',
                    model:'Users'
                }
            })
        }
        return res.status(200).json({success:true,message:'User'+successConstants.fetchingSuccess.fetchedSuccesfully,data:pppdata})
    } catch (error) {
        next(error);
    }
}

const emailIsUserorCompany = async (req,res,next)=>{
    const {email} =  req.body;
    try {
      const [userOne, companyOne] = await Promise.all([
        Users.findOne({ email }),
        Companies.findOne({ email }),
      ]);
      if(!userOne && !companyOne) throw {status:404,message:'User'+errorConstants.userErrors.doesntExsist};
      console.log("ok")
      if(userOne) return res.status(200).json({success:true,message:"User",u_t_p:'u_s_r'})
      if(companyOne) return res.status(200).json({success:true,message:"Company",u_t_p:'c_m_p'})
    } catch (error) {
      next(error);
    }
  }

const logout = async (req, res,next) => {
    try {
      res
        .clearCookie("user_token", {
          httpOnly: true,
          secure: true,
          sameSite: "None",
          expires: new Date(0),
        })
        .status(200)
        .json({ success: true, message: "Successfully logged out" });
    } catch (error) {
      next(error);
    }
  };

const login  = async (req,res,next) => {
  const { email, password,time } = req.body;
  try{
    await validateRequiredFields(req,res,'email','password');
    const companyOne = await Companies.findOne({ email });
    if(companyOne){
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
        await sendMail('notification',email,"Login",ms);
        return;
    }
    const exsisting_user = await Users.findOne({ email });
    if(exsisting_user){
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
    return res.status(200).json({ success: true, user: {modified,info},message:successConstants.loginSuccess.logedSuccess});
    }

    throw {status:404,message:errorConstants.userErrors.userdoesntExsist+"email"};
    
  }catch(error){
    next(error)
  }
}
const logedIn = async (req, res,next) => {
    // console.log(req.cookies);
    try {
      // const user_id = req.user;
      // const user = await Users.findById(user_id, "-password");
      // // const cookies = req.headers.cookie.split("=")[1];
      // if (!user)
      //   return res.status(200).json({ succes: false, message: "User not found" });
      const token = req.cookies.user_token;
      // console.log(req)
      if (!token) throw {status:401,message:'Token not found'}
      // console.log(token)
      const jwtSecretKey = process.env.JWT_SECRET_KEY;
      // console.log(jwtSecretKey)
      const user = jwt.verify(token, jwtSecretKey);
      // console.log(user)
      const [orgU,orgC] = await Promise.all([
        Users.findById(user.user_id),
        Companies.findById(user.user_id)
      ]);
      if(!orgC && !orgU) throw {status:404,message:'User not logged in'}
      const orgUs = orgC || orgU;
      const returnedData = {
        _id:orgUs._id,
        name:orgUs.name,
        email:orgUs.email,
        u_t_p:user.u_t_p
      }
      const info = user.u_t_p === 'u_s_r' ? await UserInfo.findOne({user:orgUs._id}) : await CompanyInfo.findOne({company:orgUs._id});
      // console.log(info);
      // console.log(orgC)
      let infoN;
      if(orgC){
        infoN = {...info._doc,isBlock:orgC.isBlock,numberOfJobSharing:orgC.numberOfJobSharing}
      }
      else{
        infoN = {...info._doc}
      }
      return res.status(200).json({ success: true, user:{returnedData,info:infoN}});
    } catch (error) {
      next(error);
    }
  };
module.exports = {
    verifyEmailAndSendOtp,
    checkUserAndValidate,
    verifyOtp,
    getUsersOtp,
    profile,
    emailIsUserorCompany,
    logout,
    logedIn,
    login
}


