const Cart = require('../models/cartModel')
const User = require('../models/userModel')
const Order = require('../models/orders');
const Address = require('../models/addresses')
const Product = require('../models/productModel')
const { format } = require('date-fns');
const Razorpay = require('razorpay');
const userHelper = require('../helpers/user-helper')




//load checkout page
const loadCheckOut = async (req,res)=>{
    try {
        const userId = req.session.user_id
        const userData = await User.findOne({ _id: userId })
        const cart = await Cart.findOne({ userId: userId }).populate('products.productId').exec();
        const address = await Address.findOne({userId: userId})
        if(cart){
            if(address){
                res.render('checkOut',{products: cart.products,name: userData.name,addresses: address.addresses})
            }
            else{
                res.render('checkOut',{products: cart.products,name: userData.name,addresses:[]})
            }
        }else{
            res.render('checkOut',{products: [],addresses: [],name:userData.name})
        }
 
    } catch (error) {
        console.log(error.message);
        res.status(400).send(error.message)
    }
}


const placeOrder = async (req, res) => {
    try {
        const { selected_address,paymentMethod } = req.body;
        const userId = req.session.user_id;
        console.log(req.body);
        if (!paymentMethod) {
            throw new Error('Payment method is required');
        }

        // Fetch the cart for the current user
        const cart = await Cart.findOne({ userId });

        if (!cart || !cart.products || cart.products.length === 0) {
            throw new Error('Cart is empty');
        }

        // Fetch the selected address
        const addressDoc = await Address.findOne(
            { "addresses._id": selected_address },
            { "addresses.$": 1 }
        );

        if (!addressDoc || !addressDoc.addresses || addressDoc.addresses.length === 0) {
            throw new Error('Address not found');
        }

        const address = addressDoc.addresses[0];

        // Fetch product details
        const orderedProducts = await Promise.all(cart.products.map(async item => {
            const product = await Product.findById(item.productId);
            if (!product) {
                throw new Error(`Product with ID ${item.productId} not found`);
            }
            const price = product.price;
            if (typeof price !== 'number') {
                throw new Error(`Invalid price for product ID ${item.productId}`);
            }
            return {
                productId: item.productId,
                quantity: item.quantity,
                price: price,
                totalPrice: price * item.quantity,
                status: 'placed'
            };
        }));

        // Calculate subtotal
        const subTotal = orderedProducts.reduce((sum, item) => sum + item.totalPrice, 0);

        // Store the current date in the format dd/mm/yy, hh:mm AM/PM
        const purchasedDate = format(new Date(), 'dd/MM/yy, hh:mm a');
        const orderId = userHelper.orderIdgenerator()
        // Create order object
        const order = new Order({
            userId,
            orderId,
            userName: `${address.first_name} ${address.last_name}`,
            shipAddress: [{
                address_type: address.address_type,
                first_name: address.first_name,
                last_name: address.last_name,
                contry: address.contry,
                street_name: address.street_name,
                town: address.town,
                state: address.state,
                postcode: address.postcode,
                phone_number: address.phone_number,
                email: address.email
            }],
            orderedProducts,
            purchasedDate, // Use the formatted date here
            paymentMethod,
            subTotal
        });

        // Save the order to the database
        await order.save();

        // Optionally, clear the cart
        await Cart.deleteOne({ userId });

        if(paymentMethod=='cash'){
            res.redirect('/orderSuccess')
        }else if(paymentMethod=='online'){
            let result = await userHelper.razorpayRes(subTotal,orderId)
            console.log(result);
            res.json({result})
        }
    } catch (error) {
        console.log(error.message);
        res.status(400).send(error.message);
    }
};


const orderSuccess = async (req,res)=>{
    try {
        res.render('orderSuccess');
    } catch (error) {
        console.log(error.message);
        res.status(400).send(error.message);
    }
}


const removeFromOrders = async (req,res)=>{
    try {
        const { productId } = req.query
        console.log(productId,'remove');
        const result = await Order.findOneAndUpdate(
            { "orderedProducts._id": productId },
            { $set: { "orderedProducts.$.status": 'cancelled' } },
            { new: true }
        );
        if(result){
            res.json({success: true})
        }else{
            res.json({success: false})
        }
    } catch (error) {
        console.log(error.message);
        res.status(400).send(error.message);
    }
}

module.exports={
    loadCheckOut,
    placeOrder,
    removeFromOrders,
    orderSuccess
}