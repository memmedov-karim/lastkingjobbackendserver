const {errorConstants} = require('../Constants/errorConstants.js');
async function validateRequiredFields(req, res, ...requiredFields) {
      for (const field of requiredFields) {
        if (!req.body[field]) {
          throw { status: 400, message: field+errorConstants.registrationErrors.fieldRequired };
        }
      }
      return true;
  }
module.exports = {validateRequiredFields};