const nodemailer = require('nodemailer');
async function sendMail(verifystring,user_email,subject,text) {
  const service_email_no_reply = process.env.SERVICE_EMAIL_NAME;
  const service_password_no_reply = process.env.SERVICE_EMAIL_PASSWORD;
  const service_email_otp = process.env.SERVICE_EMAIL_NAME_OTP;
  const service_password_otp = process.env.SERVICE_EMAIL_PASSWORD_OTP;
  const verifyobject = {
    "notification":{
      user:service_email_no_reply,
      pass:service_password_no_reply
    },
    "otp":{
      user:service_email_otp,
      pass:service_password_otp
    }
  }
  console.log(verifyobject[verifystring])
    // Generate test SMTP service account from ethereal.email
    let config = {
        host: 'smtp.zoho.com',
        secure:true,
        port:465,
        auth:verifyobject[verifystring],
        debug:true
    }
    // create reusable transporter object using the default SMTP transport
    let transporter = nodemailer.createTransport(config)
    // send mail with defined transport object
    let info = {
      from: verifyobject[verifystring].user, // sender address
      to: user_email, // list of receivers
      subject: subject, // Subject line
      html: text, // html body
    };
    transporter.sendMail(info).then(()=>{
        console.log(`message sent succesfully to--${user_email} !`)
    }).catch(err=>{
      console.log(`error at send email to ${user_email},error:${err}`)
    })
  }
module.exports =  {sendMail}
