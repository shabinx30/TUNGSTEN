const Address = require('../models/addresses')


const addAddress = async (req,res)=>{
    try {
        console.log('wo');
        const userId = req.session.user_id;
        const address_type = req.body.address_type.toUpperCase()
        const { first_name,last_name,contry,street_name,town,state,postcode,phone_number,email } = req.body;
        console.log('wo2');
        const exist = await Address.findOne({userId: userId})
        if(!exist){
            const addressData = new Address ({
                userId: userId,
                addresses: [{
                    address_type,
                    first_name,
                    last_name,
                    contry,
                    street_name,
                    town,
                    state,
                    postcode,
                    phone_number,
                    email
                }]
            })
            await addressData.save()
            res.redirect('/userDashboard')
        }else{
            const result = await Address.findOne({
                userId: userId,
                addresses: {
                    $elemMatch: {
                        address_type: address_type
                    }
                }
            })
            if(!result){
                const addressData = await Address.findOneAndUpdate({userId: userId},
                    {$addToSet:{addresses:{
                        address_type,
                        first_name,
                        last_name,
                        contry,
                        street_name,
                        town,
                        state,
                        postcode,
                        phone_number,
                        email
                    }}});
                if(!addressData) {
                    req.flash('addressmsg', "Couldn't add Address...!!!");
                    return res.redirect('/userDashboard')
                }else{
                    res.redirect('/userDashboard')
                }
            }else{
                req.flash('addressmsg', 'This Address is already exist...!!!');
                return res.redirect('/userDashboard')
            }
        }
    } catch (error) {
        console.log(error.message);
        res.status(400).send(error.message)
    }
}

module.exports = {
    addAddress
}