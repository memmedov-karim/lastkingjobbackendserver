//Every status code modifyed



//EXTERNAL LIBRARIES
const mongoose = require("mongoose");
const { v4: uuidv4 } = require('uuid');
const cron = require('node-cron');

//MODELS
const { Companies } = require("../Model/companyModel.js");
const { CompanyInfo } = require("../Model/companyInfoModel.js");
const { Jobs } = require("../Model/jobModel.js");
const { Applys } = require("../Model/applyModel.js");
const { NewsLetter } = require("../Model/newsletterModel.js");

//UTILS
const { isValidId } = require("../Utils/ValidateId/IsValidId.js");
const { sendMail } = require("../Utils/EmailSend/SendEmail.js");
const { formatTimeDifference } = require("../Utils/TimeSplitter/timeSplitter.js");
const { sendOneToManyEmails } = require("../Utils/SendMultiEmail/SendMailToMany.js");
const {
  findMatchingCategories,
} = require("../Utils/stringSearching/findMatchingStrings.js");
const { messageSenderToTelegram } = require("../Utils/TelegramBot/messageSenderToTelegram.js");
const { validateRequiredFields } = require("../Utils/ValidateId/bodyValidator.js");

//CONSTANTS
const {errorConstants} = require('../Utils/Constants/errorConstants.js');
const {successConstants} = require('../Utils/Constants/successConstants.js');


cron.schedule('0 0 * * * *',async()=>{
  const now = new Date();
  console.log("cron work");
  try {
    const results = await Jobs.updateMany({endTime:{$lt:now}},{$set:{active:false}});
    console.log("Expired jobs unactivated succesfully:");
    // console.log(results);
  } catch (error) {
    console.log("error at auto deleting expired jobs",error.name)
  }
})
const getCategoryandSubcategory = async (req, res,next) => {
  try {
    //Seherlerin listi
    const cit = await Jobs.distinct("city");
    // console.log(cit)
    const formattedCityes = cit.map((city) => {
      return {
        selected: false,
        optionName: city,
        id:uuidv4()
      };
    });
    //-----------------------
    //Sirketlerin adlarinin Listi
    const com = await Companies.distinct("name");
    const formattedCompanies = com.map((company) => {
      return {
        selected: false,
        optionName: company,
        id:uuidv4(),
      };
    });
    const dt = await Jobs.aggregate([
      {
        $group: {
          _id: "$category",
          subOptions: { $addToSet: "$subCategory" },
        },
      },
      {
        $project: {
          _id: 0,
          optionName: "$_id",
          subOptions: 1,
        },
      },
    ]);

    const formattedcategories = dt.map((category) => {
      return {
        optionName: category.optionName,
        selected: false,
        id:uuidv4(),
        subOptions: category.subOptions.map((subCategory) => ({
          subOptionsName: subCategory,
          selected: false,
          id:uuidv4(),
        })),
      };
    });

    return res.status(200).json({
      success: true,
      message: "All categories fetched successfully",
      categories: formattedcategories,
      cityes: formattedCityes,
      companies: formattedCompanies,
    });
  } catch (error) {
    next(error);
  }
};
const searchJobsTest = async (req, res,next) => {
  try {
    const query = await buildAggregatePipeline(req.query);
    console.log("sended")
    const jobs = await Jobs.aggregate([
      ...query,
      {
        $lookup: {
          from: 'companies',
          localField: 'company',
          foreignField: '_id',
          as: 'companyInfo',
        },
      },
      {
        $unwind: '$companyInfo',
      },
      {
        $lookup: {
          from: 'companyinfos',
          localField: 'companyInfo.companyInfo',
          foreignField: '_id',
          as: 'companyInfoData',
        },
      },
      {
        $unwind: '$companyInfoData',
      },
      {
        $lookup:{
          from:'categories',
          localField:'category',
          foreignField:'_id',
          as:'categoryInfo'
        }
      },
      {
        $unwind: '$categoryInfo',
      },
      {
        $lookup:{
          from:'jobtypes',
          localField:'type',
          foreignField:'_id',
          as:'jobtypeInfo'
        }
      },
      {
        $unwind: '$jobtypeInfo',
      },
      {
        $project: {
          category: '$categoryInfo.name',
          name: 1,
          city: 1,
          type: '$jobtypeInfo.name',
          experience: 1,
          education: 1,
          descriptionOfVacancy: 1,
          specialRequirements: 1,
          skills: 1,
          salary: 1,
          numberOfViews: 1,
          numberOfApplys: 1,
          premium: 1,
          endTime: 1,
          createdAt: 1,
          updatedAt: 1,
          autoDelete: 1,
          active: 1,
          age:1,
          agreedSalary:1,
          salaryType:1,
          companyName: '$companyInfo.name',
          companyId: '$companyInfo.companyInfo',
          logo: '$companyInfoData.logo',
        },
      },
    ]);
    
    console.log(jobs)
    return res.status(200).json({ success: true, data:jobs });
  } catch (error) {
    next(error);
  }
};

const buildAggregatePipeline = async (queryParameters) => {
  const pipeline = [];
  const filterConditions = [{active:true}];
  if (queryParameters.companyName) {
    const company = await Companies.findOne({name:queryParameters.companyName});
    if (company) {
      filterConditions.push({ company: company._id });
    } else {
      filterConditions.push({ company: queryParameters.companyName });
    }
  }
  if (queryParameters.category) {
    filterConditions.push({ category: queryParameters.category });
  }
  if (queryParameters.subCategory) {
    filterConditions.push({ subCategory: queryParameters.subCategory });
  }
  if (queryParameters.city) {
    filterConditions.push({ city: queryParameters.city });
  }
  // Stage 6: Match type if specified
  if (queryParameters.type) {
    filterConditions.push({ type: queryParameters.type });
  }

  // Stage 7: Match experience if specified
  if (queryParameters.experience) {
    filterConditions.push({ experience: {$gte:parseInt(queryParameters.experience)} });
   
  }

  // Stage 8: Match education if specified
  if (queryParameters.education) {
    filterConditions.push({ education: queryParameters.education });
  }

  // Stage 9: Match skills if specified
  if (queryParameters.skills) {
    const skillList = queryParameters.skills.split(",").map((skill) => skill.trim());
    filterConditions.push({ skills: { $in: skillList.map((skill) => new RegExp(skill, "i")) } });
  }

  // Stage 10: Match salary range if specified
  if (queryParameters.min_salary && !queryParameters.max_salary) {
    filterConditions.push({ salary: { $gte: parseFloat(queryParameters.min_salary) } });
  }
  if (!queryParameters.min_salary && queryParameters.max_salary) {
    filterConditions.push({ salary: { $lte: parseFloat(queryParameters.max_salary) } });
  }
  if (queryParameters.min_salary && queryParameters.max_salary) {
    filterConditions.push({ salary: { $lte: parseFloat(queryParameters.max_salary),$gte: parseFloat(queryParameters.min_salary) } });
  }
  if (queryParameters.value) {
    const advancedSearchConditions = await buildAdvancedSearchConditions(queryParameters.value);
    filterConditions.push({$or:advancedSearchConditions});
  }
  if (filterConditions.length > 0) {
    const filterMatch = { $match: { $and: filterConditions } };
    pipeline.push(filterMatch);
  }
  console.log(filterConditions)
  return pipeline;
};

// Helper function to build advanced search conditions
const buildAdvancedSearchConditions = async (value) => {
  const matchingNames = await findMatchingCategories(value.trim(), Jobs, "name");
  const matchedNamesArr = matchingNames.onlyMatchingWords;
  const matchingCompanyNames = await findMatchingCategories(value.trim(), Companies, "name");
  const matchedCompanyNamesArr = matchingCompanyNames.onlyMatchingWords;
  const companyIds = await Companies.aggregate([
    {
      $match: {
        name: { $in: matchedCompanyNamesArr },
      },
    },
    {
      $group: {
        _id: null,
        ids: { $push: "$_id" },
      },
    },
    {
      $project: {
        _id: 0,
        ids: 1,
      },
    },
  ]);
  const ids = companyIds[0]?.ids || [];

  const conditions = [
    { name: { $in: matchedNamesArr } },
    { category: value },
    { subCategory: value },
    { city: value },
    { skills: { $in: value.split(',').map((skill) => new RegExp(skill, "i")) } },
    { company: { $in: ids } },
  ];
  console.log(conditions)
  return conditions;
};


const getJobjs = async (req, res,next) => {
  console.log("sended get jobs");
  try {
    const jobs = await Jobs.find().populate({
      path: "company",
      select: "name companyInfo",
      populate: {
        path: "companyInfo",
        select: "logo",
      },
    });
    const jobsWithTimeDifference = jobs.map((job) => {
      const createdAt = job.createdAt;
      return {
        ...job._doc, // Preserve existing properties
        createdAt: formatTimeDifference(createdAt), // Add the time difference
      };
    });
    return res.status(200).json({ success: true, data:jobsWithTimeDifference });
  } catch (error) {
    console.log("error:" + error.name);
    next(error);
  }
};
const searchJobs = async (req, res,next) => {
  console.log("sended");
  try {
    const query = {};
    console.log(req.query);
    // Extract query parameters from the request
    const {
      companyName,
      category,
      subCategory,
      city,
      type,
      experience,
      education,
      skills,
      min_salary,
      max_salary,
    } = req.query;

    // Add conditions to the query object based on the provided parameters
    if (companyName) {
      const company = await Companies.findOne({ name: companyName });
      if (company) {
        query.company = company._id;
      } else {
        query.company = companyName;
      }
    }
    if (category) query.subCategory = category;
    if (subCategory) query.subCategory = subCategory;
    if (city) query.city = city;
    if (type) query.type = type;
    if (experience) query.experience = { $gte: parseInt(experience) };
    if (education) query.education = education;
    if (skills) {
      const skillList = skills.split(",").map((skill) => skill.trim());
      query.skills = {
        $in: skillList.map((skill) => new RegExp(skill, "i")),
      };
    }
    if (min_salary && !max_salary)
      query.salary = { $gte: parseFloat(min_salary) };
    if (!min_salary && max_salary)
      query.salary = { $lte: parseFloat(max_salary) };
    if (min_salary && max_salary)
      query.salary = {
        $gte: parseFloat(min_salary),
        $lte: parseFloat(max_salary),
      };

    console.log(query);

    const jobs = await Jobs.find(query).populate({
      path: "company",
      select: "name companyInfo",
      populate: {
        path: "companyInfo",
        select: "logo",
      },
    });
    return res.status(200).json({ success: true, data:jobs });
  } catch (error) {
    console.log("error:" + error.name);
    next(error);
  }
};
const advancedSearch = async (req, res,next) => {
  const { value } = req.query;
  try {
    await validateRequiredFields(req,res,'value');
    const matchingNames = await findMatchingCategories(value.trim(), Jobs, "name");
    const matchedNamesArr = matchingNames.onlyMatchingWords;
    const matchingCOmpanyNames = await findMatchingCategories(value.trim(),Companies,"name");
    const matchedCompanNamesArr = matchingCOmpanyNames.onlyMatchingWords;
const companyIds = await Companies.aggregate([
  {
    $match: {
      name: { $in: matchedCompanNamesArr }
    }
  },
  {
    $group: {
      _id: null,
      ids: { $push: "$_id" }
    }
  },
  {
    $project: {
      _id: 0,
      ids: 1
    }
  }
]);
const idS = companyIds[0]?.ids || [];
    console.log(idS)
    const query = {
      $or: [
        { name: { $in: matchedNamesArr } },
        { category: value },
        { subCategory: value },
        { city: value },
        { skills: { $in: value.split(',').map((skill) => new RegExp(skill, "i")) } },
        {company: {$in: idS}}
      ],
    };

    const jobs = await Jobs.find(query).populate({
      path: "company",
      select: "name companyInfo",
      populate: {
        path: "companyInfo",
        select: "logo",
      },
    });

    return res.status(200).json({ success: true, data:jobs });
  } catch (error) {
    next(error);
  }
};
const getJobWithId = async (req, res,next) => {
  const job_id = req.params.id;
  const {isViewed}  = req.query
  const ipAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  console.log(ipAddress);
  try {
    if(!isValidId(job_id)) throw {status:400,message:'Invalid Id format'}
    const job = await Jobs.aggregate([
      {
        $match: {
          _id: mongoose.Types.ObjectId(job_id),
          active: true
        }
      },
      {
        $lookup: {
          from: 'companies',
          localField: 'company',
          foreignField: '_id',
          as: 'companyInfo'
        }
      },
      { $unwind: '$companyInfo' },
      {
        $lookup: {
          from: 'companyinfos',
          localField: 'companyInfo.companyInfo',
          foreignField: '_id',
          as: 'companyInfoData'
        }
      },
      { $unwind: '$companyInfoData' },
      {
        $project: {
          category: 1,
          subCategory: 1,
          name: 1,
          city: 1,
          type: 1,
          experience: 1,
          education: 1,
          descriptionOfVacancy: 1,
          specialRequirements: 1,
          skills: 1,
          salary: 1,
          numberOfViews: 1,
          numberOfApplys: 1,
          premium: 1,
          endTime: 1,
          createdAt: 1,
          updatedAt: 1,
          autoDelete: 1,
          active: 1,
          age: 1,
          agreedSalary: 1,
          salaryType: 1,
          companyName: '$companyInfo.name',
          companyId: '$companyInfo.companyInfo',
          logo: '$companyInfoData.logo',
        },
      },
    ]);

    if ( !job || job.length === 0) throw {status:404,message:'JOB'+errorConstants.userErrors.doesntExsist};

    const relatedJobs = await Jobs.aggregate([
      {
        $match: {
          _id: { $ne: mongoose.Types.ObjectId(job_id) }, // Not the current job
          category: job[0].category, // Matching category
          active: true,
        },
      },
      {
        $lookup: {
          from: 'companies',
          localField: 'company',
          foreignField: '_id',
          as: 'companyInfo',
        },
      },
      { $unwind: '$companyInfo' },
      {
        $lookup: {
          from: 'companyinfos',
          localField: 'companyInfo.companyInfo',
          foreignField: '_id',
          as: 'companyInfoData',
        },
      },
      { $unwind: '$companyInfoData' },
      {
        $project: {
          category: 1,
          subCategory: 1,
          name: 1,
          city: 1,
          type: 1,
          experience: 1,
          education: 1,
          descriptionOfVacancy: 1,
          specialRequirements: 1,
          skills: 1,
          salary: 1,
          numberOfViews: 1,
          numberOfApplys: 1,
          premium: 1,
          endTime: 1,
          createdAt: 1,
          updatedAt: 1,
          autoDelete: 1,
          active: 1,
          age: 1,
          agreedSalary: 1,
          salaryType: 1,
          companyName: '$companyInfo.name',
          companyId: '$companyInfo.companyInfo',
          logo: '$companyInfoData.logo',
        },
      },
    ]);
    
    console.log(isViewed)
    const updatedJob = await Jobs.findByIdAndUpdate(mongoose.Types.ObjectId(job_id),{$inc:{numberOfViews:isViewed==='not' ?1:0}},{new:true})
    return res.status(200).json({ success: true, data: {...job[0],numberOfViews:updatedJob.numberOfViews},relatedJobs:relatedJobs });
  } catch (error) {
    next(error);
  }
};
const addJob = async (req, res,next) => {
  // console.log(req.user)
  const {user_id:company} = req.user;
  const {
    category,
    name,
    city,
    type,
    experience,
    education,
    descriptionOfVacancy,
    specialRequirements,
    skills,
    salary,
    premium,
    endTime,
    salaryType,
    agreedSalary,
    age,
    taskInfo
  } = req.body;
  try {
    await validateRequiredFields(req,res,'category','name','descriptionOfVacancy','endTime','city','experience','education','type');
    if(agreedSalary && salary) throw {status:400,message:'You can not choise both of section'};
    const companyOne = await Companies.findById(company);
    console.log(2)
    if (!companyOne) throw {status:404,message:'Company'+errorConstants.userErrors.doesntExsist};
    const expiredTime = new Date().getTime() - new Date(endTime).getTime();
    if (expiredTime > 0) throw {status:400,message:'You can not select date less than current date'}
    const numberOfJobSharing = companyOne.numberOfJobSharing;
    if (numberOfJobSharing === 0) throw {status:400,message:'You can not share vacancy,because your limit is 0'}
    // const {folder,minPoint} = taskInfo;
    const folder = taskInfo?.folder;
    const minPoint = taskInfo?.minPoint
    const newJob = new Jobs({
      company:mongoose.Types.ObjectId(company),
      category:mongoose.Types.ObjectId(category),
      name,
      type:mongoose.Types.ObjectId(type),
      city,
      experience,
      education,
      descriptionOfVacancy,
      specialRequirements:specialRequirements || [],
      skills:skills || [],
      salary,
      age,
      premium:premium ? premium :false,
      endTime: new Date(endTime),
      salaryType,
      agreedSalary,
      taskInfo:{
        folder:folder ? mongoose.Types.ObjectId(folder) : null,
        minPoint
      }
    });
    console.log(7)
    const savedJob = await newJob.save();
    console.log(8)
    await Companies.findByIdAndUpdate(company, {
      $inc: { numberOfJobSharing:premium ? -3 : -2 },
    });
    const hrefs = "https://kingjob.pro/vacancies/" + savedJob._id.toString();
    const applyLinks = `<a href="${hrefs}">Buradan müraciət et</a>`;
    // const applySameCategpry = await Applys.aggregate([
    //   {
    //     $lookup: {
    //       from: 'users',
    //       localField: 'user',
    //       foreignField: '_id',
    //       as: 'userInfo'
    //     }
    //   },
    //   {
    //     $lookup: {
    //       from: 'jobs',
    //       localField: 'job',
    //       foreignField: '_id',
    //       as: 'jobInfo'
    //     }
    //   },
    //   { $unwind: "$jobInfo" },
    //   { $unwind: '$userInfo' },
    //   {
    //     $project: {
    //       name: "$userInfo.name",
    //       email: "$userInfo.email",
    //       job: "$jobInfo.name",
    //       category:"$jobInfo.category"
    //     }
    //   },
    //   {$match:{category:category}},
    //   {$group:{_id:{email:"$email",name:"$name"}}}
    // ]);
    // console.log(applySameCategpry)
    // for (let i of applySameCategpry) {
    //   sendMail(
    //    i._id.email,
    //     "New Job",
    //     `Hello dear  ${i._id.name} ${
    //       companyOne.name
    //     } added new job near to you you can apply for this job!...
    //     ${applyLinks}
    //     `
    //   );
    // }
    // const newsLettersEmails = await NewsLetter.find({categories:{$in:[category]}});
    // for (let i of newsLettersEmails) {
    //   await sendMail('notification',
    //     i.email,
    //     "New Job",
    //     `Hello dear user,${companyOne.name} added new ${name} job you can apply for this job!...
    //     ${applyLinks}
    //     `
    //   );
    // }
    const tg_group_id = process.env.TELEGRAM_GROUP_ID;
    const headOfMessage = "<b>YENİ VAKANSİYA &#128204</b>";
    const infoText = "<b>İş haqda məlumat &#128317</b>";
    const companyName = `<strong>&#127970Şirkət:</strong>${companyOne.name}`;
    const jobName = `<b>&#129333Vəzifə:</b>${name}`;
    const endOfDate = `<b>&#128336Son tarix:</b>${endTime.split("T")[0]}`;
    const href = "https://kingjob.pro/vacancies/" + savedJob._id.toString();
    const applyLink = `<a href="${href}">Buradan müraciət et &#128747</a>`;
    const resMessage = `${headOfMessage}\n\n${infoText}\n\n${companyName}\n${jobName}\n${endOfDate}\n${applyLink}`;
    // await messageSenderToTelegram(tg_group_id, resMessage);
    await CompanyInfo.findOneAndUpdate(
      { company: company },
      { $inc: { vacancynum: 1 } }
    );
    return res
      .status(200)
      .json({
        success: true,
        message: `Vacancy shared succesfully`,
        data:savedJob
      });
  } catch (error) {
    next(error);
  }
};
const updateJob = async (req, res,next) => {
  const job_id = req.params.id;
  const {
    category,
    subCategory,
    name,
    type,
    city,
    experience,
    education,
    descriptionOfVacancy,
    specialRequirements,
    skills,
    salary,
    endTime,
    salaryType,
    agreedSalary,
    premium,
    age
  } = req.body;
  try {
    const job = await Jobs.findById(job_id);
    const {company} = job;
    const companyOne = await Companies.findById(company);
    const expiredTime = new Date().getTime() - new Date(endTime).getTime();
    if (expiredTime > 0) throw {status:400,message:'Choise date correctly'};
    console.log(premium , companyOne.numberOfJobSharing)
    if(premium && companyOne.numberOfJobSharing === 0)  throw {status:400,message:'You have no chance for premium vacancy'};
    const updatedJob = await Jobs.findByIdAndUpdate(
      job_id,
      {
        category: category || job.category,
        subCategory: subCategory || job.subCategory,
        name: name || job.name,
        descriptionOfVacancy: descriptionOfVacancy || job.descriptionOfVacancy,
        specialRequirements: specialRequirements || job.specialRequirements,
        skills: skills || job.skills,
        salary: !agreedSalary ? salary || job.salary : "",
        endTime: endTime || job.endTime,
        type: type || job.type,
        city: city || job.city,
        experience: experience || job.experience,
        education:education || job.education,
        salaryType:!agreedSalary ? salaryType || job.salaryType : "",
        agreedSalary:agreedSalary || job.agreedSalary,
        premium:premium,
        age:age || job.age
      },
      { new: true }
    );
    companyOne.numberOfJobSharing-=1;
    await companyOne.save()
    return res
      .status(200)
      .json({
        success: true,
        message: `Job`+successConstants.updatingSuccess.updatedSuccesfully,
        data: updatedJob,
      });
  } catch (error) {
    next(error);
  }
};
const deleteJob = async (req, res,next) => {
  const job_id = req.params.id;
  try {
    const deletedJob = await Jobs.findByIdAndDelete(job_id);
    if (!deletedJob) throw {status:404,message:'JOB'+errorConstants.userErrors.doesntExsist};
    await CompanyInfo.findOneAndUpdate(
      { company: deleteJob.company },
      { $inc: { vacancynum: -1 } }
    );
    return res
      .status(200)
      .json({
        success: true,
        message: `Job`+successConstants.updatingSuccess.deletedSuccesfully,
        data: deletedJob,
      });
  } catch (error) {
    next(error);
  }
};
const deactivate = async (req,res,next) => {
  const {jobId} = req.params;
  try {
    const job = await Jobs.findById(jobId);
    if(!job) throw {status:404,message:'Job'+errorConstants.userErrors.doesntExsist};
    const {active,endTime} = job;
    const expiredTime = new Date().getTime()-endTime.getTime();
    if(!active && expiredTime>0) throw {status:400,message:'You can not activate this vacancy,first increase endTime'}
    job.active = !active;
    await job.save();
    return res.status(200).json({success:true,message:`Vacancy ${active ? 'unactivated' : 'activated'} succesfully!`,data:job});

  } catch (error) {
    next(error);
  }
}
const increaseNumberOfViews = async (req, res,next) => {
  console.log("request send for increase numofviews");
  const job_id = req.params.id;
  try {
    const updatedJob = await Jobs.findByIdAndUpdate(
      job_id,
      { $inc: { numberOfViews: 1 } },
      { new: true }
    ).populate({
      path: "company",
      select: "name companyInfo",
      populate: {
        path: "companyInfo",
        select: "logo",
      },
    });
    if (!updatedJob) throw {status:404,message:'Job'+errorConstants.userErrors.doesntExsist}
    return res
      .status(200)
      .json({ success: true, message: "Increased", data: updatedJob });
  } catch (error) {
    next(error);
  }
};
const increaseNumberOfApplys = async (req, res,next) => {
  const job_id = req.params.id;
  try {
    const updatedJob = await Jobs.findByIdAndUpdate(job_id, {
      $inc: { numberOfApplys: 1 },
    });
    if (!updatedJob) throw {status:404,message:'Job'+errorConstants.userErrors.doesntExsist}
    return res.status(200).json({ success: true, message: "Increased" });
  } catch (error) {
    next(error);
  }
};

const fetchFiltersValuesForJobs = async (req,res) => {
  const {companyId} = req.params;
  try {
    const company = await Companies.findById(mongoose.Types.ObjectId(companyId));
    // const names = await Jobs.distinct('name')
    const names = await Jobs.aggregate([
      {$match:{company:mongoose.Types.ObjectId(companyId)}},
      {
        $group:{
          _id:"$name"
        }
      }
    ])
    const retnms = names.map((v,i)=>({id:i,optionName:v._id,selected:false}))
    return res.status(200).json({success:true,message:'Fetched succesfully',data:retnms})
  } catch (error) {
    next(error);
  }
}
module.exports = {
  getJobjs,
  getJobWithId,
  addJob,
  updateJob,
  deleteJob,
  increaseNumberOfViews,
  increaseNumberOfApplys,
  getCategoryandSubcategory,
  searchJobs,
  advancedSearch,
  searchJobsTest,
  deactivate,
  fetchFiltersValuesForJobs
};
