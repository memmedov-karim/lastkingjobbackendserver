const sendMail = require("../EmailSend/SendEmail.js");
async function sendOneToManyEmails(emailLists,subject,text){
    if(typeof emailLists !=="object"){
        console.log("Argument must be array");
        return
    }
    for(let i=0;i<emailLists.length;i++){
        sendMail(emailLists[i],subject,text);
        console.log(`${i+1}-nth,mail sended succesfully`)
    }
}
module.exports =  {sendOneToManyEmails}