const Razorpay = require('razorpay')


//instance
const instance = new Razorpay({
    key_id: process.env.RAZORPAY_ID_KEY,
    key_secret: process.env.RAZORPAY_SECRET_KEY,
  });
  

const orderIdgenerator = ()=>{
    try {
        return Math.floor(10000 + Math.random() * 90000).toString();
    } catch (error) {
        console.log(error.message);
        res.status(400).send(error.message);
    }
}


const razorpayRes = async (subTotal,orderId)=>{
    try {
        // console.log(subTotal,orderId);
        subTotal = subTotal.toFixed(2)
        const options = {
            amount: subTotal*100,
            currency: "INR",
            receipt : orderId
        }
        console.log(subTotal,orderId);
        const order = await new Promise((resolve, reject) => {
            instance.orders.create(options, (err, order) => {
                if (err) {
                    // console.log('err', err);
                    reject(err);
                } else {
                    // console.log('new order:', order);
                    resolve(order);
                }
            });
        });

        return order;
    } catch (error) {
        console.log(error.message,'from order instance of razopay');
        // res.status(400).send(error.message);
    }
}

module.exports = {
    razorpayRes,
    orderIdgenerator
}