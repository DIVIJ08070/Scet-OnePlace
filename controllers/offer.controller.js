const offerService = require('../services/offer.service');
const ApiError = require('../utils/response/ApiError.util');
const ApiSuccess = require('../utils/response/ApiSuccess.util');

//add new offer
const addOffer = async (req, res) => {  
    const offerData = req.body;

    let offerRes = await offerService.createOffer(offerData);

    offerRes = await offerService.retriveOffer(offerRes.data.offer._id);

    return res.status(200).json(new ApiSuccess(200, "New Offer added successfully", offerRes.data));
}

//retrive all offers
const retriveAllOffrs = async (req,res) => {

    const OfferRes = await offerService.retriveAllOffers();

    return res.status(200).json(new ApiSuccess(200, "All Offers retrived successfully", OfferRes.data));
}

//retrive offer by id
const retriveOfferById = async (req, res) => {

    const {OfferId} = req.params;

    const offerRes = await offerService.retriveOffer(OfferId);

    return res.status(200).json(new ApiSuccess(200, "Offer retrived successfully", offerRes.data));
}

//update offer
const updateOffer = async (req, res) => {
    const {OfferId} = req.params;
    const offerData = req.body;

    let offerRes = await offerService.updateOffer(OfferId, offerData);

    offerRes = await offerService.retriveOffer(offerRes.data.offer._id);

    return res.status(200).json(new ApiSuccess(200, "Offer updated successfully", offerRes.data));
}

module.exports = {
    addOffer,
    retriveAllOffrs,
    retriveOfferById,
    updateOffer
}