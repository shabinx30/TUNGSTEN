const Wishlist = require('../models/wishlistModel')

//load wishlist
const loadWishlist = async(req,res)=>{
    try {
        const userId = req.session.user_id
        const wishlistProducts = await Wishlist.findOne({userId: userId}).populate('products.productId').exec()
        console.log('while loading the wishlist ',wishlistProducts)
        res.render('wishlist',{wishlistProducts})
    } catch (error) {
        console.error('Error loading wishlist:', error.message);
        res.status(500).send('Internal Server Error');
    }
}

//add to wishlist
const addToWishlist = async (req, res) => {
    try {
        const { productId } = req.body;
        const userId = req.session.user_id;

        if (!productId) {
            return res.status(400).json({ success: false, error: 'Product ID is required' });
        }

        let userWishlist = await Wishlist.findOne({ userId });

        if (!userWishlist) {
            userWishlist = new Wishlist({
                userId,
                products: [{ productId }]
            });
            await userWishlist.save();
            return res.json({ success: true });
        }

        const productExists = userWishlist.products.some(product => product.productId.toString() === productId);

        if (productExists) {
            return res.json({ success: false, error: 'Product already in wishlist' });
        }

        userWishlist.products.push({ productId });
        await userWishlist.save();
        res.json({ success: true });
    } catch (error) {
        console.error('Error adding to wishlist:', error.message);
        res.status(500).send('Internal Server Error');
    }
};

//removeProductFromWishlist
const removeProductFromWishlist = async (req,res)=>{
    try {
        const { productId } = req.body;
        const userId = req.session.user_id;
        const result = await Wishlist.findOneAndUpdate({userId: userId},{$pull: {products: {productId: productId}}})
        if(result){
            res.json({success: true})
        }else{
            res.json({success: false})
        }
    } catch (error) {
        console.error('Error removing from wishlist:', error.message);
        res.status(500).send('Internal Server Error');
    }
}


module.exports = {
    loadWishlist,
    addToWishlist,
    removeProductFromWishlist
}