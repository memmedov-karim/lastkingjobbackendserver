function thanksForRegister(username){
    return (
    `
    <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Qeydiyyat üçün təşəkkür</title>
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
            <h1>Qeydiyyat təşəkkürü</h1>
        </div>
        <div class="content">
            <p>Salam ${username},</p>
            <p>Bizim saytdan qeydiyyatdan keçdiyinizə görə sizə təşəkkür edirik,sizinlə birgə olmaq bizi çox xoş edir.</p>
            <p>Bu email qeydiyyatdan keçdiyinizin təsdiqidir.</p>
        </div>
        <div class="logo">
        <img src="https://stratus.campaign-image.com/images/838625144/inkcanva_1217023000000048176.png" alt="Your Company Logo">
        </div>
        <div class="button-container">
        <a href="https://t.me/the_kingjob" class="button">Telegram kanalımıza abunə ola bilərsiz</a>
        </div>
    </div>
</body>
</html>


    `)

}

module.exports = {thanksForRegister}