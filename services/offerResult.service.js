const {OfferResult, offerResultJoiSchema} = require('../models/OfferResult.model');
const ApiError = require('../utils/response/ApiError.util');
const ApiSuccess = require('../utils/response/ApiSuccess.util');



//create offerresult

const addOffeResult =  async(_offerResult) => 
{
    const {error} = offerResultJoiSchema.validate(_offerResult); 

    if(error){
        console.log(error.details[0].message)
        throw new ApiError(400,'invalide data of offerresult',error.details[0].message) 
    }
    const newOfferResult = new OfferResult(_offerResult);
    await newOfferResult.save();

    return new ApiSuccess(200,'new offer result added succesfuly',{OfferResult:newOfferResult});
}

//find offerresult

const retriveOfferResult = async(_id) =>{

    const offerResult = await OfferResult.findById(_id);
    if(!OfferResult){
        throw new ApiError(400,'offerresult not found','id invalid')
    }
    return new ApiSuccess(200,'offerResult retrived succesfuly',{offerResult});

}

//update offerResult 
const updateOfferResult = async(_offerResult) =>
{
    const {error} = offerResultJoiSchema.validate(_offerResult)

    if(error){
        throw new ApiError(400,'offerResult not valid',error.details[0].message) 
    }
    const updateOfferResult = await OfferResult.findByIdAndUpdate(_offerResult._id,_offerResult,{new : true})
    if(!updateOfferResult){
        throw new ApiError(400,'offerResult id is not validate','ivalid id')
    }

}

//delete offerResult
const deleteOfferResult = async(_id) =>{

    const deletedOfferResult = await OfferResult.findByIdAndDelete(_id);
    if(!deletedOfferResult){
        throw new ApiError(400,'id is invalid','id not found')
    }
    return new ApiSuccess(200,"offerResult deleted succesfuly",{offerResult:deletedOfferResult});
}


module.exports = {addOffeResult,retriveOfferResult,deleteOfferResult,updateOfferResult}



