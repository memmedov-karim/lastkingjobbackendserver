const multer = require('multer');
const path = require('path');
const { S3Client, ListObjectsV2Command, GetObjectCommand, DeleteObjectCommand } = require("@aws-sdk/client-s3");
const multerS3 = require('multer-s3');
const s3 = new S3Client({
  region: process.env.REGION,
  credentials: {
      accessKeyId: process.env.ACCESS_KEY,
      secretAccessKey: process.env.ACCESS_SECRET,
  },
});

const BUCKET = process.env.BUCKET;

const upload = (folder,allowedFileTypes) => multer({
storage: multerS3({
    s3: s3,
    bucket: BUCKET,
    contentType: multerS3.AUTO_CONTENT_TYPE,
    key: function (req, file, cb) {
        const name = folder + "/"+Date.now() + '-' + file.originalname; // Generate a unique filename
        cb(null, name);
    }
}),
fileFilter: function (req, file, cb) {
  const fileType = file.mimetype.split('/')[1];
  if (allowedFileTypes.includes(fileType)) {
      cb(null, true);
  } else{
    cb(null,false);
  }
},
});

// const getStorage = (folder) => {
//   const storage = multer.diskStorage({
//     destination: function (req, file, cb) {
//       cb(null, path.join(__dirname, `../../public/${folder}`)); // Define the destination folder for uploaded files
//     },
//     filename: function (req, file, cb) {
//       const name = Date.now() + '-' + file.originalname; // Define the filename for the uploaded file
//       // console.log("from file",req.body)
//       cb(null, name, (err) => {
//         if (err) {
//           // console.log("ERRRORORORO");
//         }
//       });
//     },
//   });

//   return storage;
// };

// const fileFilter = (allowedTypes,process) => (req, file, cb) => {
//   req.block = false;
//   console.log("filter",allowedTypes)
//   // Get the file type based on its mimetype
//   const fileType = file.mimetype.split('/')[1];
  
//   // Check if the file type is allowed
//   if (allowedTypes.includes(fileType)) {
//     // console.log("from filter",req.body)
//     cb(null, true);
//   } else {
//     console.log("not allowed")
//     cb(null, false,err=>{
//       console.log("ERRRRORO")
//     });
//     req.block = true;
//     // console.log(req.body)
//     return `Only ${allowedTypes.join(',')} format allowed!`;
//     // console.log(`From Utils/FileUpload/fileUpload.js filter method:only ${allowedTypes.join(',')}`)
//   }
// };

// const upload = (folder, allowedTypes,maxFileSizeInBytes) => {
//   const storage = getStorage(folder);

//   const uploadMiddleware = multer({
//     storage: storage,
//     fileFilter: fileFilter(allowedTypes),
//     limits: { fileSize: maxFileSizeInBytes }, // Set the maximum file size here
//   });
//   return uploadMiddleware;
// };

module.exports = {upload};
