const User = require('../models/userModel')
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const Otp = require('../models/otp');
const Product = require('../models/productModel')
const Category = require('../models/categoryModel')
const Cart = require('../models/cartModel');
const Address = require('../models/addresses')
const Order = require('../models/orders')
const Wishlist = require('../models/wishlistModel');
const Wallet = require('../models/wallet');

const securePassword = async(password) => {
    try{
        const passwordHash = await bcrypt.hash(password, 10);
        return passwordHash;
    } catch (error){
        console.log(error.messgae);
    }
}

const home = async(req,res)=>{
    try {
        const userId = req.session.user_id
        const productData = await Product.find({ is_listed: true })
            .populate('categoryName')
            .exec();

        // Filter products where the category is listed
        const filteredProductData = productData.filter(product => product.categoryName && product.categoryName.is_listed);
        const userData = await User.findOne({ _id: userId })
        if(userData){
            const cart = await Cart.findOne({ userId: userId }).populate('products.productId').exec();
            const wishlist = await Wishlist.findOne({ userId: userId }).populate('products.productId').exec();
            if(cart&&wishlist){
                res.render('home',{products: cart.products,name: userData.name,picture: userData.picture,productData: filteredProductData,wishlist: wishlist.products })
            }else if(cart){
                res.render('home',{products: cart.products,name: userData.name,picture: userData.picture,productData: filteredProductData,wishlist: [] })
            }else if(wishlist){
                res.render('home',{products: [],name: userData.name,picture: userData.picture,productData: filteredProductData,wishlist: wishlist.products })
            }else{
                res.render('home',{products: [],name: userData.name,picture: userData.picture,productData: filteredProductData,wishlist:[] })
            }
        }else{
            res.render('home',{products: [],name: '',picture: undefined,productData: filteredProductData,wishlist: [] })
        }
    } catch (error) {
        console.log(error.message)
    }
}

//category rendeing
const category = async(req,res)=>{
    try {
        const data = await Category.findOne({is_listed:true})
        res.render('category',{data: data})
    } catch (error) {
        console.log(error.message);
    }
}

//about
const about = async(req,res)=>{
    try {
        res.render('about')
    } catch (error) {
        console.log(error.message);
    }
}

//contact
const contact = async(req,res)=>{
    try {
        res.render('contact')
    } catch (error) {
        console.log(error.message);
    }
}

//blog
const blog = async(req,res)=>{
    try {
        res.render('blog')
    } catch (error) {
        console.log(error.message);
    }
}

// rendering sign in page
const sign_in = async(req,res)=>{
    try {
        const forgot=req.flash('errmsg')
        const message = req.flash('message')
        res.render('signIn',{forgot,message})
    } catch (error) {
        console.log(error.message);
    }
}

//register page
const register = async(req,res)=>{
    try {
        const message = req.flash('message')
        res.render('register',{message})
    } catch (error) {
        console.log(error.message);
    }
}

const verifyLogin = async(req, res) => {
    try{
        const email = req.body.signIn_email;
        const password = req.body.signIn_password;
        const userData = await User.findOne({email: email});
        
        if(userData){
            const passwordMatch = await bcrypt.compare(password, userData.password);
            
            if(passwordMatch){
                if(userData.is_blocked == false){
                    req.session.user_id = userData._id;
                    res.redirect('/home');
                }
                else{
                    console.log('blocked user: ',userData.name,userData.email);
                    req.flash('message',"You're Blocked")
                    return res.redirect('/signIn')
                }
            }
            else {
                req.flash('message',"Email and Password is incorrect...!!!")
                return res.redirect('/signIn')
            }
        }
        else{
            req.flash('message',"User not existing..!!")
            return res.redirect('/signIn')
        }

    } catch (error) {
        console.log(error.message);
    }
}


// Nodemailer configuration
const transporter = nodemailer.createTransport({
    service: 'Gmail', 
    auth: {
      user: process.env.user,
      pass: process.env.pass
    }
});
  
  // Generate OTP
function generateOTP() {
    const otp = Math.floor(1000 + Math.random() * 9000);
    return otp.toString();
}


//************** insert new user ****************
const insertUser = async (req, res) => {

    try{
        const { name, phone_number, password } = req.body
        const email = req.body.email.toLowerCase()

        const exist = await User.findOne({email: email})
        if(exist){
            res.render('register', {message: "User alredy existing...!!!"});
        }
        else{
            const spassword = await securePassword(password);

                const user = User({
                    name: name,
                    email: email,
                    phone_number: phone_number,
                    password: spassword,
                    is_blocked:false,
                    is_verified:false
                });

                const userData = await user.save();

                if(userData){
                    // console.log('date is saved');
                    // const data = await User.findOne({email: email})
                    
                    // console.log(req.body.register_email);

                    const otp =  generateOTP();
                    console.log(email,otp);
                    const mailOptions = {
                        from: process.env.user,
                        to: email,
                        subject: 'OTP for Email Verification',
                        html: `
                        <div style="font-family: Arial, sans-serif; line-height: 1.5;">
                        <h2 style="color: black; text-align: center;">Email Verification</h2>
                        <p style="color: black"><strong>Hello ${name},</strong> It seems you are registering at <strong style="color: coral">TUNGSTEN</strong> and trying to verify your email.</p>
                        <p style="color: black">Here is the verification code. Please copy it and verify your Email.</p>
                        <div style="background-color: #e6f0ff; padding: 10px; border-radius: 20px; text-align: center; margin: 20px 0; border: 1px solid #ccc;">
                            <strong style="font-size: 20px;">Code: <strong style="color: coral">${otp}</strong></strong>
                        </div>
                        <p style="color: gray;">If this email is not intended for you, please ignore and delete it. Thank you for understanding.</p>
                        </div>`
                    };

                    await transporter.sendMail(mailOptions);    
                    const confirmation = Otp({
                        email: email,
                        otp: otp
                    });
                    confirmation.save()//save data into data base

                    res.redirect(`/loadOtp?email=${email}`)
                    // res.redirect('/home')
                }else{
                    req.flash('message',"Your registration has been failed...!!!")
                    return res.redirect('/register')
                }
    
        }
    } catch(error){
        console.log(error.message);
        res.status(500).send('Internal Server Error');
    }
}


//********** load userDashBoard ***********
const userDashboard = async(req,res)=>{
    try {
        const userData = await User.findById({_id: req.session.user_id})
        const addresses = await Address.findOne({userId: req.session.user_id})
        const order = await Order.find({userId: req.session.user_id}).sort({_id: -1}).populate('orderedProducts.productId').exec()
        const wallet = await Wallet.findOne({userId: req.session.user_id})
        const transactionHistory = wallet && wallet.transactionHistory ? wallet.transactionHistory : []
        const cart = await Cart.findOne({userId: req.session.user_id})
        const wishlist = await Wishlist.findOne({userId: req.session.user_id})

        // console.log(wallet);
        if(req.query.re){
            req.flash('addressmsg', "Please add Address...!!!");
            return res.redirect('/userDashboard')
        }else if(req.query.op){
            req.flash('addressop','open')
            return res.redirect('/userDashboard')
        }
        else if(req.query.orderOp){
            req.flash('orderOP','open')
            return res.redirect('/userDashboard')
        }
        const addressop = req.flash('addressop')
        const addressmsg = req.flash('addressmsg')
        const orderOp = req.flash('orderOP')
        // console.log(addresses.addresses);
        res.render('userDashboard',{user: userData?userData:[],addresses: addresses?addresses.addresses:[],orders: order?order:[],wallet: wallet?wallet:[],transactionHistory,addressop,addressmsg,orderOp,cartCount: cart? cart.products.length:0,wishlistCount: wishlist?wishlist.products.length:0})
    } catch (error) {
        console.log(error.message);
        res.status(500).send('Internal Server Error');
    }
}


const logout = async(req,res)=>{
    try {
        req.session.user_id = null
        res.redirect('/')
    } catch (error) {
        console.log(error.message);
        res.status(500).send('Internal Server Error');
    }
}


const verifyOTP = async (req, res) => {
    const email = req.body.email;
    const receivedOTP = req.body.otp;
    const forgot = req.body.forgot
    try {
        const generatedOTP = await Otp.findOne({ email });
        
        if (!generatedOTP) {
            // No OTP found for the email
            return res.status(400).send('No OTP found for the email');
        }
        
        console.log(generatedOTP.otp);
        
        if (receivedOTP == generatedOTP.otp) {
            const data = await User.findOne({ email })
            req.session.user_id = data._id
            // res.status(200).send('OTP verification successful');
            if(forgot){
                return res.redirect('/forgotPassword')
            }else{
                await Otp.findOneAndDelete({ email })
                return res.redirect('/home')
            }
        } else {
            // res.status(400).send('Invalid OTP');
            // res.render('otp',{message: 'Invalid otp',email: email})
            if(forgot){
                req.flash('otpErr','Invalid OTP.!!!')
                return res.redirect(`/loadOtp?email=${email}&forgot=${true}`)
            }else{
                req.flash('otpErr','Invalid OTP.!!!')
                return res.redirect(`/loadOtp?email=${email}`)
            }
        }
    } catch (error) {
        console.error('Error while verifying OTP:', error);
        res.status(500).send('Internal Server Error');
    }
}


const loadOtp = async(req,res)=>{
    try {
        const email = req.query.email;
        const forgot = req.query.forgot;
        const message = req.flash('otpErr')
        res.render('otp',{message,email,forgot})
    } catch (error) {
        console.log(error.message);
    }
}


const resendOtp = async (req,res)=>{
    try {
        const email = req.query.email
        const userData = await User.findOne({ email })

        // deleting the existing otp for optimizatoin
        await Otp.findOneAndDelete({ email })

        const otp =  generateOTP();
        console.log('resend :',email,otp);

        const mailOptions = {
            from: process.env.user,
            to: email,
            subject: 'OTP for Email Verification',
            html: `
            <div style="font-family: Arial, sans-serif; line-height: 1.5;">
            <h2 style="color: black; text-align: center;">Email Verification</h2>
            <p style="color: black"><strong>Hello ${userData.name},</strong> It seems you are registering at <strong style="color: coral">TUNGSTEN</strong> and trying to verify your email.</p>
            <p style="color: black">Here is the verification code. Please copy it and verify your Email.</p>
            <div style="background-color: #e6f0ff; padding: 10px; border-radius: 20px; text-align: center; margin: 20px 0; border: 1px solid #ccc;">
                <strong style="font-size: 20px;">Code: <strong style="color: coral">${otp}</strong></strong>
            </div>
            <p style="color: gray;">If this email is not intended for you, please ignore and delete it. Thank you for understanding.</p>
            </div>`
        };

        await transporter.sendMail(mailOptions);    
        const confirmation = Otp({
            email: email,
            otp: otp
        });
        confirmation.save()//save data into data base

        res.redirect(req.query.forgot? `/loadOtp?email=${email}&forgot=${true}`: `/loadOtp?email=${email}`)
        
    } catch (error) {
        console.log(error.message);
    }
}


const loadEditUser = async (req,res)=>{
    try {
        const userId = req.session.user_id;
        const userData = await User.findOne({_id: userId })
        res.render('editProfile',{userData})
    } catch (error) {
        console.log(error.message);
        res.status(400).send(error.message)
    }
}


const editProfile = async (req,res)=>{
    try {
        const userId = req.session.user_id;
        const { name,phone_number } = req.body;
        const userData = await User.findOneAndUpdate({_id: userId },{$set:{name: name,phone_number: phone_number}})
        if(userData){
            res.redirect('/userDashboard')
        }else{
            res.redirect('/signIn')
        }
    } catch (error) {
        console.log(error.message);
        res.status(400).send(error.message)
    }
}


const loadChangePassword = async (req,res)=>{
    try {
        const msg = req.flash('errmsg')
        res.render('changePassword',{msg})
    } catch (error) {
        console.log(error.message);
        res.status(400).send(error.message)
    }
}


const changePassword = async (req,res)=>{
    try {
        const userId = req.session.user_id
        const { password,new_password } = req.body
        const userData = await User.findOne({_id: userId})

        const passwordMatch = await bcrypt.compare(password,userData.password)

        if(passwordMatch){
            const spassword = await securePassword(new_password)
            const change = await User.findOneAndUpdate({_id: userId},{$set:{password: spassword}})
            if(change){
                res.redirect('/userDashboard')
            }else{
                req.flash('errmsg', 'Unabel to change password...!!!');
                return res.redirect('/changePassword')
            }
        }else{
            req.flash('errmsg', 'Password is incorrect...!!!');
            return res.redirect('/changePassword')
        }
    } catch (error) {
        console.log(error.message);
        res.status(400).send(error.message)
    }
}


const loadForgotPassword = async (req,res)=>{
    try {
        res.render('forgotPassword')
    } catch (error) {
        console.log(error.message);
        res.status(400).send(error.message)
    }
}


const forgotPassword = async (req,res)=>{
    try {
        const email = req.body.email;
        const userData = await User.findOne({email: email})
        if(userData){
            const otp = generateOTP();
                console.log(email,otp);
                const mailOptions = {
                    from: 'tungsten.industries007@gmail.com', // my email address
                    to: email,
                    subject: 'OTP for Email Verification',
                    html: `
                        <div style="font-family: Arial, sans-serif; line-height: 1.5;">
                        <h2 style="color: black; text-align: center;">Email Verification</h2>
                        <p style="color: black"><strong>Hello ${userData.name},</strong> It seems you are registering at <strong style="color: coral">TUNGSTEN</strong> and trying to verify your email.</p>
                        <p style="color: black">Here is the verification code. Please copy it and verify your Email.</p>
                        <div style="background-color: #e6f0ff; padding: 10px; border-radius: 20px; text-align: center; margin: 20px 0; border: 1px solid #ccc;">
                            <strong style="font-size: 20px;">Code: <strong style="color: coral">${otp}</strong></strong>
                        </div>
                        <p style="color: gray;">If this email is not intended for you, please ignore and delete it. Thank you for understanding.</p>
                        </div>`
                    };

                await transporter.sendMail(mailOptions);
                const confirmation = Otp({
                    email: email,
                    otp: otp
                });
                confirmation.save()//save data into data base

                res.redirect(`/loadOtp?email=${email}&forgot=${true}`)
        }else{
            req.flash('errmsg', 'Email is not existing...!!!');
            return res.redirect('/signIn')
        }
    } catch (error) {
        console.log(error.message);
        res.status(400).send(error.message)
    }
}


const savePassword = async (req,res)=>{
    try {
        const { password } = req.body
        const userId = req.session.user_id;
        if(userId){
            const spassword = await securePassword(password)
            const user = await User.findOneAndUpdate({_id:userId},{$set:{password:spassword}})
            if(user){
                res.redirect('/home')
            }
        }else{
            res.status(400).send(error.message) 
        }
    } catch (error) {
        console.log(error.message);
        res.status(400).send(error.message)
    }
}


const googleLoginSuccess = async (req,res)=>{
    try {
        if(!req.user){
            res.redirect('/failure')
        }
        console.log(req.user);
        const userData = await User.findOne({email: req.user.email})
        if(!userData){
            const result = User({
                name: req.user.given_name,
                email: req.user.email,
                picture: req.user.photos[0].value,
                is_blocked: false,
                is_verified: true
            })
            const status = result.save()
            if(status){
                req.session.user_id=result._id
                res.redirect('/home')
            }else{
                res.status(400).send(error.message)
            }
        }else{
            req.session.user_id = userData._id;
            res.redirect('/home')
        }
    } catch (error) {
        console.log(error.message);
        res.status(400).send(error.message)
    }
}


const googleLoginFailure = async(req,res)=>{
    try {
        res.send('Error')
    } catch (error) {
        console.log(error.message);
        res.status(400).send(error.message)
    }
}


module.exports = {
    home,
    category,
    about,
    contact,
    blog,
    sign_in,
    register,
    insertUser,
    verifyLogin,
    userDashboard,
    logout,
    loadOtp,
    verifyOTP,
    loadEditUser,
    editProfile,
    loadChangePassword,
    changePassword,
    loadForgotPassword,
    forgotPassword,
    googleLoginSuccess,
    googleLoginFailure,
    savePassword,
    resendOtp
}