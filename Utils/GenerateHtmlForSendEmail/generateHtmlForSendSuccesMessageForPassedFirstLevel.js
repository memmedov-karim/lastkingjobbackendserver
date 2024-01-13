async function generateHtmlForSendSuccesMessageForPassedFirstLevel(username,positionName,companyName,companyLogo,applyingDate) {
    return (`
    <!DOCTYPE html>
  <html lang="en">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Application Feedback</title>
      <style>
          /* Genel stiller */
          body {
              font-family: Arial, sans-serif;
              background-color: #f4f4f4;
              margin: 0;
              padding: 0;
          }
  
          .container {
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
              background-color: #ffffff;
              box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2);
          }
  
          .header {
              text-align: center;
              padding: 10px 0;
          }
  
          .header img {
              max-width: 100px;
              height: auto;
          }
  
          .feedback {
              text-align: center;
              background-color: #f2f2f2;
              padding: 20px;
              border-radius:5px;
          }
          .feedback img {
              max-width: 60px;
              height: auto;
              margin-bottom: 10px;
          }
          .feedback p {
              font-size: 16px;
              line-height: 1.5;
              color: #333;
              text-align: left;
          }
          .message {
              text-align: center;
              margin: 20px 0;
          }
          .footer {
              text-align: center;
              margin: 20px 0;
              color: #333;
          }
          .button-container {
              text-align: center;
              margin: 20px 0;
          }
          .button-container a {
              display: inline-block;
              padding: 10px 20px;
              background-color: #007bff;
              color: #fff;
              text-decoration: none;
              border-radius: 4px;
              font-weight: bold;
          }
      </style>
  </head>
  <body>
      <div class="container">
          <div class="feedback">
              <img src="${companyLogo}" alt="Şirket Logosu">
              <p>Application Status Update from <strong>${companyName}</strong></p>
              <br>
              <p>
              Dear <strong>${username}</strong>,
              <br>
              We hope this message finds you well. We are delighted to inform you that you have successfully passed the first level of our application process for the <strong>${positionName}</strong role at <strong>${companyName}</strong>.
              <br>
              Your application, submitted on <strong>${applyingDate}</strong>, demonstrated your qualifications and potential,which has led you to advance to the next stage of our selection process. We were impressed by your skills and experience, and we are excited to learn more about you.
              <br>
              We would like to thank you for your interest in joining <strong>${companyName}</strong>. We believe that your talents could be a valuable asset to our team.
              <br>
              Please keep an eye on your email for further instructions and updates regarding the next stage of the application process.
              <br>
              Once again, congratulations on your successful progression,and we look forward to getting to know you better in the coming stages of the process.
            </p>
          </div>
          <div class="button-container">
              <a href="https://kigjob.com/user_profile" class="button">Go To Your Profile</a>
          </div>
          <div class="button-container">
          <a href="https://t.me/the_kingjob" class="button">Subscribe our telegram channel</a>
          </div>
          <div class="footer">
              &copy; 2023 King Job. All rights reserved.
          </div>
      </div>
  </body>
  </html>
  
    `);
  }
  
  module.exports = {generateHtmlForSendSuccesMessageForPassedFirstLevel};