const { Products } = require("../Model/customerModel.js");
const {getContent} =  require("../Utils/ProgressOfCv/ProgressCv.js");
const getProducts = async (req, res) => {
  const query = req.query;
  const keyWords = Object.keys(query);
  for (let i of keyWords) {
    if (!query[i]) {
      delete query[i];
    }
    if (!query["min_price"] && query["max_price"]) {
      const max = query["max_price"];
      delete query["max_price"];
      query["price"] = { $lte: max };
    }
    if (query["min_price"] && !query["max_price"]) {
      const min = query["min_price"];
      delete query["min_price"];
      query["price"] = { $gte: min };
    }
    if (query["min_price"] && query["max_price"]) {
      const min = query["min_price"];
      const max = query["max_price"];
      delete query["min_price"];
      delete query["max_price"];
      query["price"] = { $gte: min, $lte: max };
    }
  }
  console.log(query);
  try {
    const customers = await Products.find(req.query);
    if (customers.length === 0)
      return res
        .status(200)
        .json({ succes: false, message: "There are not customers to show" });
    return res.status(200).json({ succes: true, customers });
  } catch (error) {
    return res
      .status(500)
      .json({ succes: false, message: "An internal server error!..." });
  }
};
const postProducts = async (req, res) => {
  try {
    const { category, marka, name, color, price } = req.body;
    console.log("func",getContent())
    // getContent('../public/uploads/1678741571146-MyLastCv.pdf').then(dt=>{
    //   console.log(dt)
    // });
    // console.log(dt)
    const newProducts = new Products({
      category: category,
      marka: marka,
      name: name,
      color: color,
      price: Number(price),
    });
    const savedProducts = await newProducts.save();
    return res.status(200).json({ succes: true, savedProducts });
  } catch (error) {
    return res
      .status(500)
      .json({ succes: false, message: "An internal server error!..." });
  }
};

module.exports = {
  getProducts,
  postProducts
}