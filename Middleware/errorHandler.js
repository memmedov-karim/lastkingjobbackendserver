const constants  = require('../Utils/Constants/errorConstants.js');
// console.log(constants)
const errorHandler = (err, req, res, next) => {
  // Log the error for debugging purposes
  console.error(err);
  // Determine the error status and message
  const status = err.status || 500;
  const message = err.message || constants.generalErrors.internalServerError;
  // Send an error response to the client
  res.status(status).json({
    success: false,
    message,
  });
};

module.exports = errorHandler;
