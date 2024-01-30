async function generateHtmlSendOtp(username,type,otp){
    return (
        `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>OTP təsdiq</title>
            <style>

            .image {
                max-width: 100%;
                height: auto;
                margin-bottom: 20px;
              }
              
            </style>
        </head>
        <body style="font-family: Arial, sans-serif;">
        
            <h1>OTP təsdiq kodu</h1>
        
            <p>Əziz ${username}</p>
        
            <p>${type} üçün sizin OTP kodunuz</p>
        
            <h2 style="background-color: #007bff; color:white; padding: 10px; border-radius: 5px; font-size: 24px; text-align: center;">
                ${otp}
            </h2>
        
            <p>Zəhmət olmasa bu kodu təsdiq üçün istifadə edin,kodun aktivlik müddəti 2 dəqiqədən sonra bitəcək.</p>
        
            <p>Əgər OTP kod üçün istək göndərməmisizsə bu emaili ciddiyə almayın</p>
        
            <p>Sizə uğurlar arzu edirik,<br>KINGJOB KOMANDASI</p>
            <img class="image" src="https://stratus.campaign-image.com/images/838625144/inkcanva_1217023000000048176.png" alt="News Image">
        
        </body>
        </html>
        `
    )
}

module.exports = {generateHtmlSendOtp};