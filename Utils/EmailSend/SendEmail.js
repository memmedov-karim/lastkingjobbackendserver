const nodemailer = require('nodemailer');
const axios = require('axios');
async function sendMail(verifystring,user_email,subject,text) {
  const apiEndpoint = 'https://kingjob-email-servic-et2qt.ondigitalocean.app/api/email'
  const {data} = await axios.post(apiEndpoint, {
                            verifystring,
                            user_email,
                            subject,
                            text
                        });
  console.log(data.message)
  }
module.exports =  {sendMail}
