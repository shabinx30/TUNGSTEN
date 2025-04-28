const Order = require('../models/orders')
const Return = require('../models/returnModel')

const orderlist = async (req,res)=>{
    try {
        let page = parseInt(req.query.page) || 0;
        let limit = 5;
        let skip = (page * limit)

        const orderCount = await Order.find({}).countDocuments();
        const orders = await Order.find({}).sort({_id: -1}).populate('orderedProducts.productId').skip(skip).limit(limit)
        // console.log(orders.orderedProducts);
        res.render('orderList',{orders,page,orderCount})
    } catch (error) {
        console.log(error.message);
        res.status(400).send(error.message)
    }
}

const changeStatus = async (req,res)=>{
    try {
        const { status,productId,returned } = req.body

        if(returned==true){
            await Return.findOneAndUpdate(
                {'orderedProducts._id': productId},
                { $set: { "orderedProducts.status": status } },
                { new: true }
            )
        }

        // console.log('status',status);
        const result = await Order.findOneAndUpdate(
            { "orderedProducts._id": productId },
            { $set: { "orderedProducts.$.status": status } },
            { new: true }
        );
        if(status=='delivered'&&result.paymentMethod=='cash'){
            let count = 0
            result.orderedProducts.forEach((val)=>{
                if(val.status=='delivered'){
                    count++
                }
            })
            if(count==result.orderedProducts.length){
                await Order.findOneAndUpdate({_id: result._id},{$set:{paymentStatus: true}})
            }
        }
        console.log(result);
        if(result){
            res.json(true)
        }else{
            res.json(false)
        }
    } catch (error) {
        console.log(error.message);
        res.status(400).send(error.message)
    }
}

module.exports = {
    orderlist,
    changeStatus
}