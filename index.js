const mongoose = require("mongoose");
require("dotenv").config();

mongoose.connect(process.env.MONGODB_URL).then(() => {
  console.log("database connected");
})
const express = require("express");
const app = express();
const nocache = require("nocache");
const path = require("path");
app.use(nocache());


const publicPath = path.join(__dirname, "public");
app.use(express.static(publicPath));

//user route
const userRoute = require("../TUNGSTEN/routes/userRoute");
app.use("/", userRoute);

//admin route
const adminRoute = require("../TUNGSTEN/routes/adminRoute");
app.use("/admin", adminRoute);


app.set('views','./views/users')
app.set('view engine','ejs')

//page not found error
app.get("*", (req, res) => {
  res.render('404page')
});

let PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log(`Server is running on http://localhost:${PORT}/admin`);
});
