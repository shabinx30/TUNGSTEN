const Wallet = require('../models/wallet');
const { format } = require('date-fns');
const Order = require('../models/orders')


// ********** adding money to the wallet *******
const addToWallet = async (req, res) => {
    try {
        const userId = req.session.user_id;
        const { amount, paymentMethod } = req.body;
        console.log(amount,paymentMethod);
        const date = format(new Date(), 'dd/MM/yy, hh:mm a');
        
        const userExist = await Wallet.findOne({ userId: userId });
        
        if (!userExist) {
            const userWallet = new Wallet({
                userId: userId,
                balance: amount,
                transactionHistory: [
                    {
                        amount,
                        date,
                        paymentMethod,
                        status: 'credit'
                    }
                ]
            });
            await userWallet.save();
            res.json({ success: true,amount,reload:1 });
        } else {
            const wallet = await Wallet.findOneAndUpdate(
                { userId: userId },
                {
                    $inc: { balance: amount },
                    $addToSet: {
                        transactionHistory: {
                            amount,
                            date,
                            paymentMethod,
                            status: 'credit'
                        }
                    }
                },
                { new: true }
            );
            res.json({ success: wallet ? true : false,amount });
        }
    } catch (error) {
        console.log(error.message);
        res.status(400).send(error.message);
    }
};

//withdraw from the wallet
const withdrawFromWallet = async (req, res) => {
    try {
        const userId = req.session.user_id;
        const { amount, paymentMethod } = req.body;
        const date = format(new Date(), 'dd/MM/yy, hh:mm a');

        const transactionAmount = parseFloat(amount);

        const wallet = await Wallet.findOne({ userId: userId });

        if (!wallet) {
            return res.json({ success: false, error: 'Wallet not found' });
        }

        if (wallet.balance < transactionAmount) {
            return res.json({ success: false, error: 'Insufficient balance' });
        }

        const updatedWallet = await Wallet.findOneAndUpdate(
            { userId: userId },
            {
                $inc: { balance: -transactionAmount },
                $addToSet: {
                    transactionHistory: {
                        amount: transactionAmount,
                        date,
                        paymentMethod,
                        status: 'debit'
                    }
                }
            },
            { new: true }
        );

        res.json({ success: updatedWallet ? true : false, amount });
    } catch (error) {
        console.log(error.message);
        res.status(400).send(error.message);
    }
};


const paymentWithWallet = async (amount,userId,orderId)=>{
    try {
        const date = format(new Date(), 'dd/MM/yy, hh:mm a');

        const transactionAmount = parseFloat(amount);

        const wallet = await Wallet.findOne({ userId: userId });

        if (!wallet) {
            return { success: false,error: 'Wallet not found'}
        }

        if (wallet.balance < transactionAmount) {
            return { success: false,error: 'Insufficient balance'}
        }

        const updatedWallet = await Wallet.findOneAndUpdate(
            { userId: userId },
            {
                $inc: { balance: -transactionAmount },
                $addToSet: {
                    transactionHistory: {
                        amount: transactionAmount,
                        date,
                        paymentMethod: 'wallet',
                        status: 'debit'
                    }
                }
            },
            { new: true }
        );

        return {success: updatedWallet?true: false}
    } catch (error) {
        console.log(error.message,'payment with wallet');
    }
}

module.exports = {
    addToWallet,
    withdrawFromWallet,
    paymentWithWallet
}