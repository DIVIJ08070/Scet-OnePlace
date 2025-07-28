const {Offer,offerJoiSchema} = require('../models/Offer.model');
const ApiError = require('../utils/response/ApiError.util');
const ApiSuccess = require('../utils/response/ApiSuccess.util');
const addressController = require('./address.controller');
const criteriaContoller = require('./criteria.controller');
const resultController = require('./')

//Create new offer
const createOffer = async (_offer) => {

    //compnay
    //location
    let res = await addressController.createAddress(_offer.location);

    if(res.status === 200){
        _offer.location = res.data.address._id;
    }

    //criteria
    res = await criteriaContoller.addCriteria(_offer.criteria);

    if(res === 200){
        _offer.criteria = res.data.criteria._id;
    }

    //validate schema
    const {error} = offerJoiSchema.validate(_offer);

    if(error){
        throw new ApiError(400, 'Invalid schema of offer', error.details[0].message);
    }

    //create instance
    const newOffer = new Offer(_offer);

    //save instance
    await newOffer.save();

    //return res
    return new ApiSuccess(200, 'offer added successfully', {offer:newOffer});
}

//retrive offer
const retriveOffer = async (_id) => {
    const offer = await Offer.findById(_id).populate(criteria).populate(location).populate(compnay).populate(result);

    if(!offer){
        throw new ApiError(400, 'Offer not found', 'invalid ID');
    }

    return new ApiSuccess(200, 'Offer retrived Successfully', {offer});
}

//update offer
const updateOffer = async(_offer) => 
{
    const {error} = offerJoiSchema.validate(_offer);
    if(error){
        throw new ApiError(400,"updateOffer schema not valid",error.details[0].message)
    }
    const newUpdateOffer = Offer.findByIdAndUpdate(_offer._id,_offer,{new:true})
    if(!updateOffer){
        throw new ApiError(400,'id is  not valid','invalid id');
    }
    return new ApiSuccess(200,"offer updated succesfuly",{offer:newUpdateOffer})
}
const deletOffer = async(_id) => 
{
    const deletedOffer = await Offer.findByIdAndDelete(_id)
    if(!deletedOffer){
        throw new ApiError(400,'id is not valid','enter valid id');
    }
    return new ApiSuccess(200,'offer deleted succesfuly',{offer:deletedOffer})
}
