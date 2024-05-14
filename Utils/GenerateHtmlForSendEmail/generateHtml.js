function generateHtml(username,time,id) {
    const blockLink = `https://seal-app-y7svs.ondigitalocean.app/api/blockCompanyAccount/${id}`
  return (`
  <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login Notification</title>
    <style>
        /* General styles */
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
            line-height: 1.5;
            color: #333;
        }

        .button-container {
            text-align: center;
            margin-top: 20px;
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
            <h1>Giriş bildirişi</h1>
        </div>
        <div class="content">
        <p>Salam əziz ${username},</p>
        <p>${time} radələrində hesabınıza giriş olundu.</p>
        <p>Əgər hesabınıza daxil olan şəxs siz deyilsizsə,aşağıdakı düyməyə tıklamaqla hesabınızı bloklaya,hesabınızda olan birinin canlı rejimdə hesabınızdan ata bilərsiz.<br>
        Yenidən hesabınıza girişi təmin etmək üçün şifrənizi - şifrəmi unutmuşam hissəsindən yeniləyə bilərsiz.
        </p>
        </div>
        <div class="button-container">
            <a href=${blockLink} class="button">Hesabımı blokla</a>
        </div>
    </div>
</body>
</html>
  `);
}

module.exports = {generateHtml};


