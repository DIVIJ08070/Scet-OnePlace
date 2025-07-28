const {Address, addressJoiSchema} = require('../models/Address.model');
const ApiSucess = require('../utils/response/ApiSuccess.util');
const ApiError = require('../utils/response/ApiError.util');

//create new address
const createAddress = async (_address) => {

    //vaidate fileds
    const { error } = addressJoiSchema.validate(_address);
    if(error){
        throw new ApiError(400, 'Inavlid address data', error.details[0].message); 
    }

    //add in model instance
    const newAddress = new Address(_address);

    //save the model
    await newAddress.save();

    return new ApiSucess(200, 'New Address Added Successfully', {address : newAddress});
}

//read address
const retriveAddress = async (_id) => {

    //retrive address from db
    const address = await Address.findById(_id);

    //validate
    if(!address || typeof address !== 'null'){
        throw new ApiError(400, 'Address not found', 'Address id is invalid'); 
    }

    //return address
    return new ApiSucess(200, 'Address Retrived Succcessfully', {address})

}

//updaate address
const updateAddress = async (_id, _address) => {


    //validate schema
    const {error} = addressJoiSchema.validate(_address);
    if(error){
        throw new ApiError(400, 'Invaild adress schema', error.details[0].message); 
    }

    //validate presence
    await retriveAddress(_id);

    //retrive & updaate data
    const updatedAddress = await Address.findByIdAndUpdate(_id, _address,{ new: true, runValidators: true });

    if(!updatedAddress){
        throw new ApiError(400, 'Adress not found', 'Address is null'); 
    }

    //return newaddress
    return new ApiSucess(200, 'Address Updated Successfully', {address: updatedAddress})

}

//delete address
const deleteAddress = async (_id) => {
    const deletedAddress = await Address.findByIdAndDelete(_id);

    if(!deletedAddress) {
        throw new ApiError(400, 'Address not found', 'Address is null'); 
    }

    return new ApiSucess(200, 'Address Deleted Successfully', {address: deletedAddress});

}

module.exports = {createAddress, retriveAddress, updateAddress, deleteAddress};