const jwt = require("jsonwebtoken");
function authAdmin(req, res, next) {
  try {
    const token = req.cookies.admin_token;
    const jwtSecretKey = process.env.JWT_SECRET_KEY;
    if (!token)
      return res.status(401).json({ succes: false, message: "Unauthorized" });
    const veryfied = jwt.verify(token, jwtSecretKey);
    const user_id = veryfied.user_id;
    req.user = user_id;
    console.log("id:", user_id);
    next();
  } catch (error) {
    return res.status(401).json({ succes: false, message: "Unauthorized" });
  }
}

module.exports = authAdmin;
