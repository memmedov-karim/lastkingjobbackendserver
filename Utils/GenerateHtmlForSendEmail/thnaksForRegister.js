function thanksForRegister(username){
    return (
    `
    <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Thank You for Registering</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f2f2f2;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #ffffff;
        }
        .header {
            text-align: center;
            background-color: #007bff;
            padding: 10px;
        }
        .header h1 {
            color: #fff;
        }
        .content {
            padding: 20px;
        }
        .content p {
            font-size: 16px;
        }
        .logo {
            text-align: center;
            margin-top: 20px;
        }
        .logo img {
            max-width: 200px;
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
        <div class="header">
            <h1>Thank You for Registering</h1>
        </div>
        <div class="content">
            <p>Hello ${username},</p>
            <p>Thank you for registering with our website. We are excited to have you as a part of our community.</p>
            <p>This email is to confirm your successful registration. Below is our logo for your reference:</p>
        </div>
        <div class="logo">
        <img src="https://drive.google.com/uc?export=view&id=1tp9BPIjXquWfzUeZe9JyPeH4thdQs1-P" alt="Your Company Logo">
        </div>
        <div class="button-container">
        <a href="https://t.me/the_kingjob" class="button">Subscribe our telegram channel</a>
        </div>
    </div>
</body>
</html>


    `)

}

module.exports = {thanksForRegister}