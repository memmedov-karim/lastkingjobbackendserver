const { Admins } = require("../Model/adminModel.js");
const jwt = require("jsonwebtoken");
const getAdmins = async (req, res) => {
  try {
    const admins = await Admins.find({});
    if (admins.length === 0)
      return res
        .status(200)
        .json({ succes: false, message: "There are not admins!.." });
    return res.status(200).json({ succes: true,message:"Admins fetched succesfully", admins: admins });
  } catch (error) {
    return res
      .status(500)
      .json({ succes: false, message: `Error at fetching admins,error:${error.name}` });
  }
};

const registerAdmin = async (req, res) => {
  const { name, surname, email, password, passwordRepeat } = req.body;
  try {
    if (!name || !surname || !email || !password || !passwordRepeat)
      return res
        .status(200)
        .json({
          succes: false,
          message:
            "all of the field are required,please fill all of the input!...",
        });
    if (password.length < 6)
      return res
        .status(200)
        .json({
          succes: false,
          message: "password character length can be 6 minimum",
        });
    if (password !== passwordRepeat)
      return res
        .status(200)
        .json({
          succes: false,
          message: "passwordRepeat must be same with password",
        });
    const adminone = await Admins.findOne({ email: email });
    if (adminone)
      return res
        .status(200)
        .json({
          succes: false,
          message: "This email olready exsist,please use another email!...",
        });
    const newUser = new Admins({
      name: name,
      surname: surname,
      email: email,
      password: password,
    });
    const savedUser = await newUser.save();
    return res.status(200).json({ succes: true,message:"New admin registered succesfully", savedUser });
  } catch (error) {
    return res
      .status(500)
      .json({ succes: false, message: `Error at register admin,error:${error.name}` });
  }
};

const loginAdmin = async (req, res) => {
  const { email, password } = req.body;
  try {
    if (!email || !password)
      return res
        .status(200)
        .json({
          succes: false,
          message: "email and password must not be a empty string!...",
        });
    const exsistinAdmin = await Admins.findOne({ email: email });
    if (!exsistinAdmin)
      return res
        .status(200)
        .json({
          succes: false,
          message: "There is not user with this email!...",
        });
    if (password !== exsistinAdmin.password)
      return res
        .status(200)
        .json({ succes: false, message: "Password is incorrect!..." });
    const jwtSecretKey = process.env.JWT_SECRET_KEY;
    const token = jwt.sign({ user_id: exsistinAdmin._id }, jwtSecretKey);
    const returneduser = {
      _id: exsistinAdmin._id,
      name: exsistinAdmin.name,
      surname: exsistinAdmin.surname,
      email: exsistinAdmin.email,
    };
    res.cookie("admin_token", token, {
      httpOnly: true,
      secure: true,
      samesite: "None",
    });
    return res.status(200).json({ succes: true,message:"Admin login succesfully", user: exsistinAdmin });
  } catch (error) {
    return res
      .status(500)
      .json({ succes: false, message: `Error at login admin,error:${error.name}` });
  }
};

const logoutAdmin = async (req, res) => {
  try {
    res
      .cookie("admin_token", "", {
        httpOnly: true,
        expires: new Date(0),
      })
      .send();
  } catch (error) {
    return res
      .status(500)
      .json({ succes: false, message: `Error at logout admin,error:${error.name}` });
  }
};
const loggedInAdmin = async (req, res) => {
  console.log("user:", req.user);
  try {
    const user_id = req.user;
    const user = await Admins.findById(user_id, "-password");
    if (!user)
      return res.status(404).json({ succes: false, message: "User not found" });
    const token = req.cookies.admin_token;
    if (!token)
      return res
        .status(401)
        .json({ succes: false, message: "There is not token" });
    // console.log(token)
    const jwtSecretKey = process.env.JWT_SECRET_KEY;
    jwt.verify(token, jwtSecretKey);
    return res.status(200).json({ succes: true,message:"Admins logged in", user });
  } catch (error) {
    return res
      .status(500)
      .json({ succes: false, message: `Error at loggedin admin,error:${error.name}` });
  }
};


const deleteAdmin = async (req,res) => {
  const admin_id = req.params.id;
  try {
    const adminOne = await Admins.findById(admin_id);
    if(!adminOne) return res.status(200).json({succes:false,message:"User not found"});

    const deletedAdmin = await Admins.findByIdAndDelete(admin_id);
    return res.status(200).json({succes:true,message:`Admin deleted succesfully with this ${deletedAdmin.email} address`});
    
  } catch (error) {
    return res.status(500).json({succes:false,message:`Error at deleting admin,error:${error.name}`})
  }
}

module.exports = {
  getAdmins,
  registerAdmin,
  loginAdmin,
  logoutAdmin,
  loggedInAdmin,
  deleteAdmin
}