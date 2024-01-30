function generateHtmlForToSendApplyMessage(username,positionName,companyName,companyLogo) {
  return (`
  <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Müraciət</title>
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
            <p><strong>${companyName}</strong>  geri dönüş</p>
            <p>
            Əziz <strong>${username}</strong>,
            <br><br>
            Ümid edirik ki,işləriniz qaydasındadır.Bu bildirişi göndərməkdə ki,məqsədimiz sizin müraciətin bizə gəlib çatdığını bildirməkdir.Biz müraciətinizə ətraflə baxış etdikdən sonra sizə bildiriş göndərəcik.Bu səbəbdən <a href="https://www.kingjob.pro/applicants-dashboard/applies" class="button">şəxsi kabinetinizi hər gün yoxlamağınzı tövsiyə edirik</a>.
            <br><br>
             Əgər hər-hansı bir sualınız olarsa bizə yazmaqdan çəkinməyin <a href="https://www.kingjob.pro/contact">here</a>.
            <br><br>
            Uğurlar arzu edirik,<br>
            <strong>${companyName}</strong>
            </p>
        </div>
        <div class="button-container">
        <a href="https://t.me/the_kingjob" class="button">Telegram kanalımıza abunə ola bilərsiz</a>
        </div>
        <div class="footer">
            &copy; 2023 King Job. Bütün hüquqlar qorunur.
        </div>
    </div>
</body>
</html>

  `);
}

module.exports = {generateHtmlForToSendApplyMessage};


