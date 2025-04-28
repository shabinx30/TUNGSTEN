const userModel=require('../models/userModel')

const isLogin = async (req,res,next)=>{
    const a = await userModel.findOne({_id:req.session.user_id})
    try {
        if(req.session.user_id){
            // console.log(req.session.user_id,'its in auth');
            if(a.is_blocked===false) {
                next()
            }else{
                req.session.user_id=null
                res.redirect('/signIn')
            }
        }else{
            res.redirect('/signIn')
        }
    } catch (error) {
        console.log(error.message);
    }
}

const isLogout = async(req,res,next)=>{
    try {
        if(!req.session.user_id){
            next()
        }else{
            // next()
            
            res.redirect('/home')
        }
    } catch (error) {
        console.log(error.message);
    }
}

module.exports={
    isLogin,
    isLogout
}