//Every status code modifyed



//EXTERNAL LIBRARIES
const OpenAI = require('openai');
const path = require('path');


//MODELS
const { Users } = require("../Model/userModel.js");
const { UsersOtp } = require("../Model/UserOtp.js");
const { Companies } = require("../Model/companyModel.js");
const { UserInfo } = require('../Model/userInfoModel.js');
const { Jobs } = require('../Model/jobModel.js')


//UTILS
const {extractText} = require('../Utils/ProgressOfCv/ProgressCv.js');
const { validateRequiredFields } = require('../Utils/ValidateId/bodyValidator.js');


//CONSTANTS
const {successConstants} = require('../Utils/Constants/successConstants.js');
const {errorConstants} = require('../Utils/Constants/errorConstants.js');

const getresultfromapi = async (req,res,next) => {
    const {userId,jobId} = req.body;
    try {
        await validateRequiredFields(req,res,'userId','jobId');
        const userOne = await Users.findById(userId);
        if(!userOne) throw {status:404,message:errorConstants.userErrors.userdoesntExsist};
        const userInfo = await UserInfo.findOne({user:userId});
        if(!userInfo) throw {status:404,message:'Userinfo'+errorConstants.userErrors.doesntExsist};
        // console.log(userInfo)
        if(!userInfo.file) throw {status:404,message:'You have not cv in your profile'};
        const job = await Jobs.findById(jobId).populate({
          path:'company',
          select:'name'
        });
        if(!job) throw {status:404,message:'Job'+errorConstants.userErrors.doesntExsist}
        // console.log(job)
        const {company:{name:companyName},name:jobName,city,descriptionOfVacancy,specialRequirements,skills} = job;
        const jobFulLoc = ` ${jobName} at ${companyName} in ${city}`;
        // const filePath = path.join(__dirname, '..','public' ,'uploads', userInfo.file);
        const {text:cvtext,data} = await extractText(userInfo.file);
        // console.log(data)
        const {REQUEST_HEAD_1,REQUEST_HEAD_2,REQUEST_HEAD_3,REQUEST_HEAD_4,REQUEST_HEAD_5,REQUEST_HEAD_6,REQUEST_HEAD_7,OPENAI_API_KEY} = process.env
        // console.log("ok")
        const request = `
        Hello my name is ${userOne.name} My cv text and Job info which i want to apply in below
                  ${REQUEST_HEAD_1}
                  ${cvtext}
                  ${REQUEST_HEAD_2} ${jobFulLoc}
                  ${REQUEST_HEAD_3}
                  ${descriptionOfVacancy}
                  ${REQUEST_HEAD_4}
                  ${skills.join(',')}
                  ${REQUEST_HEAD_5}
                  ${specialRequirements.join(",")}
                  ${REQUEST_HEAD_6} ${jobFulLoc}
                  ${REQUEST_HEAD_7} 
                  And lastly, give me general information about how a CV should be, including how the photo should be on the CV, which side should it be, the color background, in a word, how can I make the best CV?
                  `; 
                  // console.log(nextres)
                  // console.log(request)
            // const configuration ={
            //         apiKey:OPENAI_API_KEY,
            //       };
            // const openai = new OpenAI(configuration);
        // const completion = await openai.completions.create({
        //     model: "text-davinci-003",
        //     prompt: request,
        //     max_tokens: 400,
        //   });
        // const completion = await openai.chat.completions.create({
        //   model:"gpt-4",
        //   messages:[{role:"system",content:request}]
        // })
        // const response = cvtext;
        // console.log(completion.choices[0].text);fff
        // const reply = completion.choices[0].message.content
        // console.log(reply)
        // userInfo.talks.push({job:jobId,jobName,content:reply});
        // await userInfo.save();
        return res.status(200).json({success:true,message:'This response saved in your profile',text:"Bu xidmət müvəqqəti olaraq dayandırılıb,saytın əsas buraxılışında yenidən aktivləşəcək!"});
        
    } catch (error) {
        next(error);
    }
}

const creatcoverletter = async (req,res,next) => {
  const {user_id} = req.params;
  try {
    const user = await Users.findById(user_id);
    if(!user) throw {status:404,message:errorConstants.userErrors.userdoesntExsist}
    const userInfo = await UserInfo.findOne({user:user_id});
    if(!userInfo) throw {status:404,message:'Userinfo'+errorConstants.userErrors.doesntExsist};
    const {file:cv,achievements,experiences,educations,chancesForCoverLetter} = userInfo;
    if(chancesForCoverLetter === 0) throw {status:400,message:'You have not chances for creating coverletter with AI'};
    const {text:cvtext,data} = await extractText(cv);
    // console.log(cv)
    // console.log(achievements)
    // console.log(experiences)
    // console.log(educations)
    const request = `
    This is my text extracted from MY cv\n\n
    ${cvtext} \n\n
    this is my achievements data\n\n
    ${achievements}\n\n
    this is my experiences data \n\n
    ${experiences} \n\n
    and this is my edication data \n\n
    ${educations}\n\n

    please write string coverletter for me coverletter must be general not spesipic job or hr write general
    `
    const {OPENAI_API_KEY} = process.env
    const configuration ={
      apiKey:OPENAI_API_KEY,
    };
const openai = new OpenAI(configuration);
    const completion = await openai.chat.completions.create({
      model:"gpt-4",
      messages:[{role:"system",content:request}]
    })
    const reply = completion.choices[0].message.content
    userInfo.coverLetter = reply;
    userInfo.chancesForCoverLetter = chancesForCoverLetter-1;
    await userInfo.save();
    return res.status(200).json({success:true,message:'Coverletter generated succesfully',data:reply});
  } catch (error) {
    next(error);
    
  }
}

module.exports = {getresultfromapi,creatcoverletter}