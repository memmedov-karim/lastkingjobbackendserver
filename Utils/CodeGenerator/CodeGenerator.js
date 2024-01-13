async function generateOtp(length){
    const MyList = [0,1,2,3,4,5,6,7,8,9];
    let OTP = "";
    for(let i=0;i<length;i++){
        OTP+=MyList[Math.floor(Math.random()*MyList.length)]
    }
    return OTP
}
module.exports =  {generateOtp};