function checkUser(req,res) {
    const cookie = req.headers.cookie?.split("=")[1];
    const tokenU = req.cookies?.user_token;
    // console.log(req.headers)
    if (!cookie || !tokenU) return false
    return true
}
module.exports = {checkUser}