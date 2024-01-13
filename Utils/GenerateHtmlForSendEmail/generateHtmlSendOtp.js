async function generateHtmlSendOtp(username,type,otp){
    return (
        `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>OTP Verification</title>
            <style>

            .image {
                max-width: 100%;
                height: auto;
                margin-bottom: 20px;
              }
              
            </style>
        </head>
        <body style="font-family: Arial, sans-serif;">
        
            <h1>OTP Verification Code</h1>
        
            <p>Dear ${username}</p>
        
            <p>Your OTP code for ${type} is:</p>
        
            <h2 style="background-color: #007bff; color:white; padding: 10px; border-radius: 5px; font-size: 24px; text-align: center;">
                ${otp}
            </h2>
        
            <p>Please use this code to verify your identity. It will expire after a two minute period, so make sure to use it promptly.</p>
        
            <p>If you didn't request this OTP code, please ignore this email.</p>
        
            <p>Best regards,<br>KINGJOB TEAM</p>
            <img class="image" src="https://drive.google.com/uc?export=view&id=1tp9BPIjXquWfzUeZe9JyPeH4thdQs1-P" alt="News Image">
        
        </body>
        </html>
        `
    )
}

module.exports = {generateHtmlSendOtp};