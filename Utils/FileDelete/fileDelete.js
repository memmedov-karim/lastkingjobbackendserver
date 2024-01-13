const fs = require('fs')
const path = require('path');
function deleFile(fileName, destFolder, callback) {
  const filePath = path.join(__dirname, '..', '..', 'public', destFolder, fileName);
  console.log(filePath);
  if (!fs.existsSync(filePath)) {
      // console.log(`File not found, file: ${filePath}`);
      callback(null, 'File not found');
      return;
  }
  fs.unlink(filePath, (err) => {
      if (err) {
          // console.error(`Error deleting the file: ${err.message}`);
          callback(err, 'Error deleting the file');
          return;
      }
      // console.log('File deleted successfully!');
      callback(null, 'File deleted successfully');
  });
}
module.exports = {deleFile};