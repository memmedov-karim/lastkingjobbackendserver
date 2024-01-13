const jwt = require("jsonwebtoken");
function auth(req, res, next) {
    const tokenU = req.cookies?.user_token;
  try {
    const jwtSecretKey = process.env.JWT_SECRET_KEY;
    if (!tokenU)
      return res.status(200).json({ succes: false, message: "Unauthorized" });
    const veryfied = jwt.verify(tokenU, jwtSecretKey);
    req.user = veryfied;
    next();
  } catch (error) {
    return res.status(200).json({ succes: false, message: "Unauthorized" });
  }
}

module.exports = auth
