const {Company, companyJoiSchema} = require('../models/Company.model');
const ApiError = require('../utils/response/ApiError.util');
const ApiSuccess = require('../utils/response/ApiSuccess.util');
const addressService = require('../services/address.service');
const {Offer} = require('../models/Offer.model');

// add new compnay
const createCompany = async (_company) => {

    //addAddress
    const res = await addressService.createAddress(_company.address);

    if(res.statusCode === 200){
        _company.address = res.data.address._id.toString();
    }
    
    //upload logo

    //validate schema of data
    const {error} = companyJoiSchema.validate(_company);

    if(error){
        throw new ApiError(400, 'Inavaild data of Compnay', error.details[0].message);
    }

    //create instance
    const newCompnay = new Company(_company);

    //save data
    await newCompnay.save();

    //return res
    return new ApiSuccess(200, 'new company added successfully',{company: newCompnay});

}

//retrive all company
const retriveAllCompany = async () => {

    //retrive data
    const compnaies = await Company.find().populate('offers').populate('address');

    //send res
    return new ApiSuccess(200, 'All Company retrived', {company:compnaies});
}

//retrive compnay by Id
const retriveCompnay = async (_id) => {

    //retrive data
    const company = await Company.findById(_id).populate('offers').populate('address');

    //validate data
    if(!company){
        throw new ApiError(400, 'Invalid ID', 'Compnay not registered');
    }

    //return response
    return new ApiSuccess(200, 'Comapnay retrived successfully', {company:company});
}

//update comapny
const updateCompany = async (_id,_company) => {

    const companyRes = await retriveCompnay(_id);

    //update address
    const res = await addressService.updateAddress(companyRes.data.company.address._id,_company.address);

    if(res.statusCode === 200){
        _company.address = res.data.address._id.toString();
    }

    //validate schema of data
    const {error} = companyJoiSchema.validate(_company);

    if(error){
        throw new ApiError(400, 'Inavaild data of Compnay', error.details[0].message);
    }

    //retrive & update data
    const updatedCompany = await Company.findByIdAndUpdate(_id, _company, { new: true });

    //validate data
    if(!updatedCompany){
        throw new ApiError(400, 'Company not found', 'INvalid ID');
    }

    //return res
    return new ApiSuccess(200, 'Company Updated Successfully', {company: updatedCompany});
}

//delete Compnay
const deleteCompany = async (_id) => {
    //delete all the offer of company
    //delete adddress

    const deletedCompany = await Company.findByIdAndDelete(_id);

    if(!deletedCompany){
        throw new ApiError(400, 'Compnay not found', 'Invalid Id');
    }

    return new ApiSuccess(200, 'Company deleted Successfully', {company: deletedCompany});
}

module.exports = {createCompany, retriveAllCompany, retriveCompnay, updateCompany, deleteCompany};