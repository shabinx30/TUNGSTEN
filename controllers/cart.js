const Cart = require('../models/cartModel');
const Product = require('../models/productModel')
const Wishlist = require('../models/wishlistModel')

//loadCart
const loadCart = async (req, res) => {
    try {
        const userId = req.session.user_id;

        if (!userId) {
            return res.status(401).json({ success: false, message: 'User not logged in' });
        }

        const cart = await Cart.findOne({ userId: userId }).populate('products.productId').exec();
        const wishlist = await Wishlist.findOne({userId: userId})

        if (!cart) {
            return res.render('cart', { cart: [], products: [], wishlistCount: wishlist? wishlist.products.length : 0 });
        }
        // console.log(userId)
        
        //********** NAV ***********
        const wishlistCount = wishlist? wishlist.products.length : 0;

        console.log('form wish lst constj',wishlistCount);
        

        res.render('cart', {products: cart.products,wishlistCount });
    } catch (error) {
        console.error('Error loading cart:', error.message);
        res.status(500).send('Internal Server Error');
    }
};

//addto Cart
const addCart = async (req, res) => {
    try {
        const userId = req.session.user_id;
        const { productId, quantity, size } = req.body;

        //checking product quantity from the user cart
        const cartQuantity = await Cart.findOne({$and:[{userId:userId},{'products.productId':productId},{'products.size':size}]})

        let cartQ =  1
        if(cartQuantity){
            const product = cartQuantity.products.find(p => p.productId.toString() === productId.toString() && p.size === size);
            // console.log(product,'existing the cart, products.');
            if(product){
                cartQ = (product.quantity)
            }
            // console.log('no ,more');
            
        }
        // console.log('cart quantity',cartQuantity.products[0].quantity);

        const avalability = await Product.findOne({_id: productId})
        if(avalability.quantity[size] > cartQ ){
            const cart = await Cart.findOne({ userId: userId });
            if (!cart) {
            
                const userCart = new Cart({
                    userId,
                    products: [
                        {
                            productId,
                            quantity,
                            size
                        }
                    ]
                });
                await userCart.save();
                res.json({ success: true });
            } else {

                const productIndex = cart.products.findIndex(
                    (p) => p.productId.toString() === productId && p.size === size
                );

                if (productIndex > -1) {

                    cart.products[productIndex].quantity += quantity;
                } else {

                    cart.products.push({ productId, size, quantity });
                }

                await cart.save();
                res.json({ success: true });
            }
        }else{
            return res.json({success: false,error: 'Out Of Stock'})
        }
    } catch (error) {
        console.error('Error:', error.message);
        return res.status(500).json({ success: false, error: error.message });
    }
};


//remove from the cart
const removeProductFromCart = async (req,res)=> {
    try {
        console.log('kk');
        const userId = req.session.user_id;
        const { productDId } = req.body
        const cart = await Cart.findOneAndUpdate({userId: userId},{ $pull: { products: { _id: productDId } } })
        if(cart){
            res.json({success: true})
        }else{
            res.json({success: false})
        }
    } catch (error) {
        console.log(error.message);
    }
}

//changing the quantity
const quantity = async(req,res)=>{
    try {
        // console.log('increase');
        const userId = req.session.user_id;
        const { productDId,quantity } = req.body;
        // console.log(quantity);
        const cart = await Cart.findOneAndUpdate(
            { userId: userId, 'products._id': productDId }, 
            { $set: { 'products.$.quantity': quantity } },
            { new: true }
        );
        console.log(cart);
        if(cart){
            const products = await Cart.findOne({ userId: userId }).populate('products.productId').exec();
            res.json({success:true,quantity:quantity,products: products.products})
        }else{
            res.json({success:false})
        }
    } catch (error) {
        console.log(error.message);
    }
}

module.exports = {
    loadCart,
    addCart,
    removeProductFromCart,
    quantity
}