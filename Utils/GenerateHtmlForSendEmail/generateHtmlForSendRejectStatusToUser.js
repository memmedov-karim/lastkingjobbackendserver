async function generateHtmlForSendRejectStatusToUser(username,positionName,companyName,companyLogo,applyingDate) {
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
              We hope this message finds you well. We wanted to personally reach out to you regarding your recent job application for the <strong>${positionName}</strong> position at <strong>${companyName}</strong>.
              <br>
              We appreciate your interest in joining our team and the time you invested in the application process. Your application, dated <strong>${applyingDate}</strong>, has been carefully reviewed. After a thorough assessment of your qualifications and skills, We regret to inform you that we will not be moving forward with your application.
              <br>
              Please know that this decision is not a reflection of your capabilities, but rather, we have identified candidates whose skills and experience more closely align with our current needs.
              <br>
              We want to express our gratitude for considering <strong>${companyName}</strong> as a potential employer. We will retain your application for future reference, and we encourage you to keep an eye on our careers page for other opportunities that may be a better fit for your background and aspirations.
              <br>
              Thank you again for your interest in <strong>${companyName}</strong>. We wish you the best of luck in your job search and in your career endeavors.
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
  
  module.exports = {generateHtmlForSendRejectStatusToUser};