function generateHtmlForToSendApplyMessage(username,positionName,companyName,companyLogo) {
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
            <p>Application Feedback from <strong>${companyName}</strong></p>
            <p>
            Dear <strong>${username}</strong>,
            <br><br>
            I hope this message finds you well. I am writing to confirm that we have received your application for the <strong>${positionName}</strong> at <strong>${companyName}</strong>. We appreciate your interest in joining our team and taking the time to apply.
            <br><br>
            Your application is important to us, and we will carefully review all the information you have provided. Our hiring team will assess the qualifications of each applicant to determine the best fit for the position. This process may take some time, so we kindly ask for your patience as we work through the applications.
            Rest assured that we will keep you updated on the status of your application throughout the selection process. If you are selected to move forward, you will be contacted for the next steps in our hiring process, which may include interviews and additional assessments.
            <br><br>
            In the meantime, feel free to explore our website from <a href="https://kigjob.com/contact">here</a> to learn more about our company, our values, and the exciting opportunities we offer to our team members.
            Once again, thank you for your interest in ${companyName}. We look forward to reviewing your application and getting to know you better. If you have any questions or need further assistance,please do not hesitate to contact us from <a href="https://kigjob.com/contact">here</a>.
            <br><br>
            Best regards,
            <strong>${companyName}</strong>
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

module.exports = {generateHtmlForToSendApplyMessage};


