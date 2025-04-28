const ProductOffers = require('../models/ProductOffers')
const CategoryOffer = require('../models/categoryOffer')
const Product = require('../models/productModel')
const Category = require('../models/categoryModel')


//********** loding product offers */
const loadProductOffers = async (req,res)=>{
    try {
        const offers = await ProductOffers.find({}).populate('productName').exec()
        const products = await Product.find({is_listed: true})
        if(offers){
            const newOffferMsg = req.flash('newOfferMsg')
            res.render('ProductOfferList',{offers,newOffferMsg,products})
        }
    } catch (error) {
        console.log(error.message,'loading product offers');
        res.status(400).send(error.message)
    }
}


const addOffer = async (req,res)=>{
    try {
        const { productName,description,discount,expiryDate } = req.body
        // console.log(startingDate,expiryDate);

        const exist = await ProductOffers.findOne({productName})
        if(exist){
            req.flash('newOfferMsg','This offer is already existing...!!!')
            return res.redirect('/admin/ProductOfferList')
        }
        
        const result = new ProductOffers({
            productName,
            description,
            discount,
            expiryDate,
            is_activated: true
        })
        await result.save()

        if(!result){
            req.flash('newOffferMsg', 'Data not found or not updated');
            return res.redirect('/admin/ProductOfferList');
        }
        res.redirect('/admin/ProductOfferList')
    } catch (error) {
        console.log(error.message,'adding offer');
        res.status(400).send(error.message)
    }
}


//load category offer page
const loadCategoryOffers = async (req,res)=>{
    try {
        const categoryOffers = await CategoryOffer.find({}).populate('categoryId')
        const categories = await Category.find({is_listed: true})

        const newOfferMsg = req.flash('newOfferMsg')
        res.render('categoryOfferList',{categoryOffers,categories,newOfferMsg})
    } catch (error) {
        console.log(error.message,'listing category offers');
        res.status(400).send(error.message)
    }
}

//add category offer
const addCategoryOffer = async (req, res) => {
    try {
        const { categoryId, description, discount, expiryDate } = req.body;

        const exist = await CategoryOffer.findOne({categoryId})
        if(exist){
            req.flash('newOfferMsg','This offer is already existing...!!!')
            return res.redirect('/admin/CategoryOfferList')
        }
        
        const result = new CategoryOffer({
            categoryId,
            description,
            discount,
            expiryDate,
            is_activated: true
        });
        await result.save();

        res.redirect('/admin/CategoryOfferList');
    } catch (error) {
        console.error(error.message, 'adding category offers');
        res.status(400).send(error.message);
    }
};

const productOfferStatus = async (req,res)=>{
    try {
        const offerId = req.query.offerId
        const productOffer = await ProductOffers.findOne({_id: offerId})
        // console.log(offerId,'offerId')
        if(productOffer.is_activated==true){
            await ProductOffers.findOneAndUpdate({_id: offerId},{$set: {is_activated: false}})
            res.json({is_activated: true})
        }else{
            await ProductOffers.findOneAndUpdate({_id: offerId},{$set: {is_activated: true}})
            res.json({is_activated: false})
        }
    } catch (error) {
        console.log(error,'from changing the offer of product');
        
    }
}


const deleteProductOffer = async (req,res)=>{
    try {
        const offerId = req.query.offerId
        const deletion = await ProductOffers.findOneAndDelete({_id: offerId})
        if(deletion){
            return res.redirect('/admin/ProductOfferList')
        }else{
            req.flash('newOfferMsg','There is a problem in the deletion...!!!')
            return res.redirect('/admin/ProductOfferList')
        }
    } catch (error) {
        console.log(error,'from deleting the product offer');
        req.flash('newOfferMsg','There is a problem in the deletion...!!!')
        return res.redirect('/admin/ProductOfferList')
    }
}


const loadEditProductOffer = async (req,res)=>{
    try {
        const offerData = await ProductOffers.findOne({_id: req.query.offerId})
        const products = await Product.find({is_listed: true})
        if(offerData){
            const offermsg = req.flash('offermsg')
            res.render('editProductOffer',{offerData,products,offermsg})
        }else{
            res.redirect('*')
        }
    } catch (error) {
        console.log(error,'while loading the editProduct')
    }
}

const editProductOffer = async (req,res)=>{
    try {
        const { offerId,productName,description,discount,expiryDate } = req.body

        const exist = await ProductOffers.findOne({productName})
        if(exist._id != offerId ){
            req.flash('offermsg','This offeris already existing!')
            return res.redirect(`/admin/editProductOffer?offerId=${offerId}`)
        }else{
            const status = await ProductOffers.findOneAndUpdate({_id: offerId},{productName,description,discount,expiryDate})
            return res.redirect(status? '/admin/ProductOfferList': '*')
        }

    } catch (error) {
        console.log(error,'while storing edited Product offer');
        
    }
}

const categoryOfferStatus = async (req,res)=>{
    try {
        const offerId = req.query.offerId
        const productOffer = await CategoryOffer.findOne({_id: offerId})
        // console.log(offerId,'offerId')
        if(productOffer.is_activated==true){
            await CategoryOffer.findOneAndUpdate({_id: offerId},{$set: {is_activated: false}})
            res.json({is_activated: true})
        }else{
            await CategoryOffer.findOneAndUpdate({_id: offerId},{$set: {is_activated: true}})
            res.json({is_activated: false})
        }
    } catch (error) {
        console.log(error,'from changing the offer of category');
        
    }
}

const deleteCategoryOffer = async (req,res)=>{
    try {
        const offerId = req.query.offerId
        const deletion = await CategoryOffer.findOneAndDelete({_id: offerId})
        if(deletion){
            return res.redirect('/admin/CategoryOfferList')
        }else{
            req.flash('newOfferMsg','There is a problem in the deletion...!!!')
            return res.redirect('/admin/CategoryOfferList')
        }
    } catch (error) {
        console.log(error,'while deleting the category offer');
        req.flash('newOfferMsg','There is a problem in the deletion...!!!')
        return res.redirect('/admin/CategoryOfferList')
    }
}

const loadEditCategoryOffer = async (req,res)=>{
    try {
        const offerData = await CategoryOffer.findOne({_id: req.query.offerId})
        const offermsg = req.flash('Catoffermsg')
        if(offerData){
            const category = await Category.find({is_listed: true})
            res.render('editCategoryOffer',{offerData,offermsg,category})
        }else{
            res.redirect('*')
        }
    } catch (error) {
        console.log(error,'while edit category loading');
        
    }
}


const editCategoryOffer = async (req,res)=>{
    try {
        const { offerId,categoryId,description,discount,expiryDate } = req.body
        // console.log(offerId,categoryId,description,discount,expiryDate);
        

        const exist = await CategoryOffer.findOne({categoryId})
        if(exist._id != offerId ){
            req.flash('Catoffermsg','This offeris already existing!')
            // console.log('if case in edit');
            return res.redirect(`/admin/editCategoryOffer?offerId=${offerId}`)
            
        }else{
            const status = await CategoryOffer.findOneAndUpdate({_id: offerId},{categoryId,description,discount,expiryDate})
            // console.log('else case in edit');
            return res.redirect(status? '/admin/CategoryOfferList': '*')
        }
    } catch (error) {
        console.log(error,'while editing the category offer');
        
    }
}


module.exports = {
    loadProductOffers,
    addOffer,
    loadCategoryOffers,
    addCategoryOffer,
    productOfferStatus,
    deleteProductOffer,
    loadEditProductOffer,
    editProductOffer,
    categoryOfferStatus,
    deleteCategoryOffer,
    loadEditCategoryOffer,
    editCategoryOffer
}