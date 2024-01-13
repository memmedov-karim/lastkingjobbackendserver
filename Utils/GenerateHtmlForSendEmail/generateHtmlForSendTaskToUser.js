function generateHtmlForSendTaskToUser(username,positionName,companyName,companyLogo,deadline) {
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
              <p>New task assignment from <strong>${companyName}</strong></p>
              <p>
            Dear <strong>${username}</strong>
            <br><br>
            We are excited to inform you that your application for the position of ${positionName} at ${companyName} has been accepted! We appreciate your interest and are looking forward to having you as a part of our team.
            <br><br>
            As a part of your onboarding process, we have assigned a task to you. This task is designed to  help you get acquainted with your role and our company's expectations. Please find the details of the task below:
            <br>
            Deadline: <strong>${deadline}</strong>
            <br>
            We believe that this task will provide you with valuable insights into your new role and help you in your transition. We encourage you to complete this task diligently and feel free to reach out to us if you have any questions or need assistance.
            Your success is important to us, and we are here to support you every step of the way.
            Once again, congratulations on being accepted into the ${companyName} team! We are eager to see you thrive in your new position.
            Best regards,
            <br>
            ${companyName}
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
  
  module.exports = {generateHtmlForSendTaskToUser};
  