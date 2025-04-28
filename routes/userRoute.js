const express = require("express");
const user_route = express();
const flash = require("express-flash");
const session = require("express-session");
const userAuth = require("../middleware/userAuth");
const passport = require("passport");
require("../passport");

//flash for error
user_route.use(flash());

//session
user_route.use(
  session({
    secret: process.env.sessionSecret,
    resave: false,
    saveUninitialized: true,
  })
);

//passport
user_route.use(passport.initialize());
user_route.use(passport.session());

//body parser
const bodyParser = require("body-parser");
user_route.use(bodyParser.json());
user_route.use(bodyParser.urlencoded({ extended: true }));

user_route.set("view engine", "ejs");
user_route.set("views", "./views/users");

//controllers
const userController = require("../controllers/userController");
const productController = require("../controllers/product");
const cartController = require("../controllers/cart");
const userOrderController = require("../controllers/userOrder");
const userAddress = require("../controllers/address");
const wishlistController = require('../controllers/wishlist')
const walletController = require('../controllers/walletController')
const returnController = require('../controllers/return')
const salesAndReport = require('../controllers/salesAndreport')

//auth
user_route.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["email", "profile"] })
);

//auth callback
user_route.get(
  "/auth/google/callback",
  passport.authenticate("google", {
    successRedirect: "/success",
    failureRedirect: "/failure",
  })
);

//success
user_route.get("/success", userController.googleLoginSuccess);
//failure
user_route.get("/failure", userController.googleLoginFailure);

user_route.get("/", userController.home);
user_route.get("/home", userController.home);

//userDashboard
user_route.get("/userDashboard",userAuth.isLogin,userController.userDashboard);
user_route.get("/editProfile", userAuth.isLogin, userController.loadEditUser);
user_route.post("/editProfile", userAuth.isLogin, userController.editProfile);

//Address
user_route.post("/addAddress", userAuth.isLogin, userAddress.addAddress);
user_route.put('/removeAddress',userAuth.isLogin,userAddress.removeAddress)
user_route.get('/editAddress',userAuth.isLogin,userAddress.loadEditAddress);
user_route.post('/editAddress',userAuth.isLogin,userAddress.editAddress)

//change password
user_route.get(
  "/changePassword",
  userAuth.isLogin,
  userController.loadChangePassword
);
user_route.post(
  "/changePassword",
  userAuth.isLogin,
  userController.changePassword
);

//forget password
user_route.get("/forgotPassword", userController.loadForgotPassword);
user_route.post("/forgotPassword", userController.forgotPassword);
user_route.post("/savePassword", userAuth.isLogin, userController.savePassword);

//shop
user_route.get("/shop", userAuth.isLogin, productController.shop);
user_route.get(
  "/product",
  userAuth.isLogin,
  productController.loadProductDetails
);
user_route.get('/searchProducts',userAuth.isLogin,productController.searchProducts)

user_route.get("/category", userController.category);
user_route.get("/about", userController.about);
user_route.get("/contact", userController.contact);
user_route.get("/blog", userController.blog);

//wishlist
user_route.get("/wishlist", userAuth.isLogin, wishlistController.loadWishlist);
user_route.post('/addToWishlist',userAuth.isLogin, wishlistController.addToWishlist)
user_route.post('/removeProductFromWishlist',userAuth.isLogin, wishlistController.removeProductFromWishlist)


user_route.get("/signIn", userAuth.isLogout, userController.sign_in);
user_route.post("/signIn", userAuth.isLogout, userController.verifyLogin);
user_route.get("/register", userAuth.isLogout, userController.register);
user_route.post("/register", userAuth.isLogout, userController.insertUser);
user_route.get("/logout", userAuth.isLogin,userController.logout);

//Otp
user_route.get("/loadOtp", userController.loadOtp);
user_route.post("/verifyotp", userController.verifyOTP);
user_route.get('/resendOtp',userController.resendOtp)

//cart
user_route.get("/cart", userAuth.isLogin, cartController.loadCart);
user_route.post("/addCart", cartController.addCart);
user_route.post("/removeProductFromCart", cartController.removeProductFromCart);
user_route.post("/increase", cartController.quantity);

//order
user_route.get("/checkout", userAuth.isLogin, userOrderController.loadCheckOut);
user_route.post("/placeOrder", userAuth.isLogin, userOrderController.placeOrder);
user_route.put('/removeFromOrders',userAuth.isLogin,userOrderController.removeFromOrders)
user_route.get('/orderSuccess',userAuth.isLogin,userOrderController.orderSuccess)
user_route.post('/verifyPayment',userAuth.isLogin,userOrderController.verifyPayment)
user_route.get('/paymentFailed',userAuth.isLogin,userOrderController.paymentFailed)


//wallet
user_route.post('/addToWallet',userAuth.isLogin,walletController.addToWallet)
user_route.post('/withdrawFromWallet',userAuth.isLogin,walletController.withdrawFromWallet)

// return product 
user_route.post('/returnProduct',userAuth.isLogin,returnController.returnProduct)

// Invoice 
user_route.get('/Invoice',userAuth.isLogin,salesAndReport.loadInvoice)

//filter Prodduct and sort
user_route.get('/filterProducts',userAuth.isLogin,productController.filterProducts)

module.exports = user_route;
