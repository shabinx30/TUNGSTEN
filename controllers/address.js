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
            req.flash('addressop', 'open');
            return res.redirect('/userDashboard')
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
                    req.flash('addressop', 'open');
                    return res.redirect('/userDashboard')
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

const removeAddress = async (req,res)=>{
    try {
        const result = await Address.findOneAndUpdate(
            {userId: req.session.user_id},
            {$pull: { addresses: {_id: req.query.addressId}}}
        )
        if(result){
            res.json({success: true})
        }else{
            res.json({success: false})
        }
    } catch (error) {
        console.log(error.message);
        res.status(400).send(error.message)
    }
}

const loadEditAddress = async (req, res) => {
    try {
        const address = await Address.findOne(
            { 'addresses._id': req.query.addressId },
            { 'addresses.$': 1 }
        );

        if (!address || !address.addresses || !address.addresses.length) {
            req.flash('addressmsg', 'Address is already existing try to add a new address');
            return res.redirect('/userDashboard');
        }

        const addressmsg = req.flash('addressmsg');
        res.render('editAddress', { address: address.addresses[0], addressmsg });
    } catch (error) {
        console.error('Error in loadEditAddress:', error.message);
        res.status(400).send(error.message);
    }
};

const editAddress = async (req, res) => {
    try {
        const addressId = req.body.addressId;
        const address_type = req.body.address_type.toUpperCase();
        const { first_name, last_name, contry, street_name, town, state, postcode, phone_number, email } = req.body;
        
        console.log("Address ID:", addressId);

        const result = await Address.findOne({
            userId: req.session.user_id,
            'addresses._id': addressId
        });

        if (!result) {
            req.flash('addressmsg', 'Address not found');
            return res.redirect('/editAddress');
        }

        const addressIndex = result.addresses.findIndex(address => address._id.toString() === addressId);
        
        if (addressIndex !== -1) {
            const address = await Address.findOneAndUpdate(
                { 'addresses._id': addressId },
                {
                    $set: {
                        'addresses.$.address_type': address_type,
                        'addresses.$.first_name': first_name,
                        'addresses.$.last_name': last_name,
                        'addresses.$.contry': contry,
                        'addresses.$.street_name': street_name,
                        'addresses.$.town': town,
                        'addresses.$.state': state,
                        'addresses.$.postcode': postcode,
                        'addresses.$.phone_number': phone_number,
                        'addresses.$.email': email,
                    }
                },
                { new: true } // Return the updated document
            );

            if (!address) {
                req.flash('addressmsg', 'Address not found or not updated');
                return res.redirect('/editAddress');
            }

            req.flash('addressop', 'open');
            return res.redirect('/userDashboard');
        } else {
            req.flash('addressmsg', 'Address not found or not updated');
            return res.redirect('/editAddress');
        }
    } catch (error) {
        console.error('Error in editAddress post:', error.message);
        req.flash('addressmsg', 'An error occurred while updating the address');
        res.status(400).send(error.message);
    }
};

module.exports = {
    addAddress,
    removeAddress,
    loadEditAddress,
    editAddress
}