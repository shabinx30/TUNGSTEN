const Coupon = require('../models/couponModel')

const ListConpon = async (req,res)=>{
    try {
        const coupons = await Coupon.find({})
        res.render('coupon',{coupons})
    } catch (error) {
        console.log(error,'from listing coupon');
    }
}

const addCoupon = async(req, res) => {
    try {
        const { couponCode, discount, cryteriaAmount, expiryDate } = req.body;

        console.log(couponCode, discount, cryteriaAmount, expiryDate);

        const result = new Coupon({
            couponCode,
            discount,
            cryteriaAmount,
            expiryDate,
            is_activated: true
        });
        await result.save();

        res.redirect('/admin/couponList');
    } catch (error) {
        console.log(error, 'from adding coupon');
    }
};

const couponStatus = async (req,res)=>{
    try {
        const couponData = await Coupon.findOne({_id: req.query.couponId})
        if(couponData.is_activated==true){
            await Coupon.findOneAndUpdate({_id: req.query.couponId},{$set: {is_activated:false}})
            return res.json({is_activated: true})
        }else{
            await Coupon.findOneAndUpdate({_id: req.query.couponId},{$set: {is_activated: true}})
            return res.json({is_activated: false})
        }

    } catch (error) {
        console.log(error,'while changing the status of coupon');
        
    }
}


const deleteCoupon = async (req,res)=>{
    try {
        if(req.query.couponId){
            await Coupon.findOneAndDelete({_id: req.query.couponId})
            return res.redirect('/admin/couponList')
        }else{
            res.redirect('*')
        }
    } catch (error) {
        console.log(error,'while deleting the coupon.');
        
    }
}

const loadEditCoupon = async (req,res)=>{
    try {
        if(req.query.couponId){
            const couponData = await Coupon.findOne({_id: req.query.couponId})
            const couponErr = req.flash('couponErr')
            return res.render('editCoupon',{couponId: req.query.couponId,couponData,couponErr})
        }else{
            return res.redirect('*')
        }
    } catch (error) {
        console.log(error,'while loading the edipage fo coupon .');
        
    }
}


const editCoupon = async (req,res)=>{
    try {
        const { couponId,couponCode,discount,cryteriaAmount,expiryDate } = req.body

        const exist = await Coupon.findOne({_id: couponId})
        if(exist){
            const status = await Coupon.findOneAndUpdate({_id: couponId},{couponCode,discount,cryteriaAmount,expiryDate})
            if(status){
                return res.redirect('/admin/couponList')
            }
        }else{
            return res.redirect('*')
        }
    } catch (error) {
        console.log(error,'while editing the coupon.');
        
    }
}


module.exports = {
    ListConpon,
    addCoupon,
    couponStatus,
    deleteCoupon,
    loadEditCoupon,
    editCoupon
}