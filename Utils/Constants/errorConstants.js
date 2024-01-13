module.exports = {
  errorConstants:{
    generalErrors: {
      internalServerError: 'Internal Server Error',
      isnotvalidId:'-id is not supported',
      isnotLegal:' is not legal',
      isnotCorrect:' is not correct'
    },
    userErrors: {
      userExists: 'User with this email already exists',
      userdoesntExsist:'There is not user with this-',
      alreadyExsist:' already exsist',
      doesntExsist:' does not exsist'
    },
    registrationErrors: {
      fieldRequired:' is required',
      invalidPassword: 'Your password must have more than 6 characters',
      passwordMismatch: 'Your password and passwordRepeat must be the same',
      otpExpired:'Your otp activation time has been left,please resend otp',
      otpdoesntExsist:'There is not OTP for this user',
      otpisnotCorrect:'OTP code is not correct'
    },
    loginErrors:{
        passwordisnotCorrect:'Password is not correct'
    }
}};
  