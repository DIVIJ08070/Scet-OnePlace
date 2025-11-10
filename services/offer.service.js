const {Offer,offerJoiSchema} = require('../models/Offer.model');
const ApiError = require('../utils/response/ApiError.util');
const ApiSuccess = require('../utils/response/ApiSuccess.util');
const addressService = require('../services/address.service');
const criteriaService = require('../services/criteria.service');
const {Company}= require('../models/Company.model');
const companyService = require('./company.service');
const studentService = require('./student.service')

//Create new offer
const createOffer = async (_offer) => {

    //compnay
    //location
    let res = await addressService.createAddress(_offer.location);

    if(res.statusCode === 200){
        _offer.location = res.data.address._id.toString();
    }

    //criteria
    res = await criteriaService.addCriteria(_offer.criteria);

    if(res.statusCode === 200){
        _offer.criteria = res.data.criteria._id.toString();
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
    
    //add offer in company
    await companyService.addOfferInCompany(newOffer._id, newOffer.company);

    //return res
    return new ApiSuccess(200, 'offer added successfully', {offer:newOffer});
}

//retirve all offers
const retriveAllOffers = async () => {
    const offer = await Offer.find().populate('location').populate('criteria').populate('company');
    return new ApiSuccess(200, 'Offer retrived Successfully', {offer});

}

//retrive offer
const retriveOffer = async (_id) => {
    const offer = await Offer.findById(_id).populate('location').populate('criteria').populate('company');

    if(!offer){
        throw new ApiError(400, 'Offer not found', 'invalid ID');
    }

    return new ApiSuccess(200, 'Offer retrived Successfully', {offer});
}

//update offer
const updateOffer = async(_id,_offer) => {

    const offerRes = await retriveOffer(_id);

    let res = await addressService.updateAddress(offerRes.data.offer.location._id, _offer.location);

    if(res.statusCode === 200){
        _offer.location = res.data.address._id.toString();
    }

    //criteria
    res = await criteriaService.updateCriteria(offerRes.data.offer.criteria._id, _offer.criteria);

    if(res.statusCode === 200){
        _offer.criteria = res.data.criteria._id.toString();
    }

    //validate schema
    const {error} = offerJoiSchema.validate(_offer);
    if(error){
        throw new ApiError(400,"updateOffer schema not valid",error.details[0].message);
    }

    const newUpdateOffer =await Offer.findByIdAndUpdate(offerRes.data.offer._id, _offer,{new:true});

    if(!updateOffer){
        throw new ApiError(400,'id is  not valid','invalid id');
    }

    return new ApiSuccess(200,"offer updated succesfuly",{offer:newUpdateOffer});
}

const deletOffer = async(_id) => 
{
    const deletedOffer = await Offer.findByIdAndDelete(_id)
    if(!deletedOffer){
        throw new ApiError(400,'id is not valid','enter valid id');
    }
    return new ApiSuccess(200,'offer deleted succesfuly',{offer:deletedOffer})
}

const generateOfferReport = async (_id) => {
    const offerRes = await retriveOffer(_id);

    if(offerRes.statusCode !== 200){
        return offerRes;
    }

    const applicantes = offerRes.data.offer.applicants.populate('student');

    return new ApiSuccess(200, 'Offer Report Generated Successfully', { applicants: applicantes});
}

const addResult = async (_offerId, _resultId) => {

    const offerRes = await retriveOffer(_offerId);

    const offer = offerRes.data.offer;

    if(offer.result){
        offer.result.push(_resultId);
    }else{
        offer.result = [_resultId];
    }
    
    await offer.save();

    return new ApiSuccess(200, "Result added successfully", {offer});
}

const selectStudent = async (_offerId, _resultData) => {
    const  offerRes = await retriveOffer(_offerId);

    //add student in offer
    const offer = offerRes.data.offer;

    offer.selected = _resultData;
    await offer.save();

    //add offer in student
    for(let studentData in _resultData){
        await studentService.addSelection(studentData.student, offer._id, studentData.salary);
    }

    return ApiSuccess(200, "Offer result addedd successfully", {offer});
}
module.exports = {createOffer, retriveAllOffers, retriveOffer, updateOffer, deletOffer,generateOfferReport,addResult, selectStudent};  
