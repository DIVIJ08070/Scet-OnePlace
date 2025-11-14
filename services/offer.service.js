const {Offer,offerJoiSchema} = require('../models/Offer.model');
const ApiError = require('../utils/response/ApiError.util');
const ApiSuccess = require('../utils/response/ApiSuccess.util');
const addressService = require('../services/address.service');
const criteriaService = require('../services/criteria.service');
const {Company}= require('../models/Company.model');
const companyService = require('./company.service');
const studentService = require('./student.service');
const {transporter} = require('../config/mailer.config');
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

    const offer = newOffer;

    
await transporter.sendMail({
  from: process.env.EMAIL_USER,
  to: process.env.EMAIL_TO,
  subject: `New Offer listed : ${offer.title}`,
  html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
</head>
<body style="font-family: Arial, sans-serif; background:#f5f7fb; padding:20px;">
  <div style="max-width:680px; margin:auto; background:#ffffff; padding:22px; border-radius:8px; box-shadow:0 6px 18px rgba(0,0,0,0.06);">

    <h2 style="color:#0b5fff; margin:0 0 8px 0;">New Offer Listed</h2>

    <p style="margin:0 0 12px 0;">one offer is waiting gor you :</p>

    <div style="background:#f0f6ff; padding:14px; border-radius:6px; margin:14px 0;">
      <p style="margin:6px 0;"><strong>Role:</strong> ${offer.role}</p>
      <p style="margin:6px 0;"><strong>Company:</strong> ${offer.company?.name}</p>
      <p style="margin:6px 0;"><strong>Drive Type:</strong> ${offer.drive}</p>
      <p style="margin:6px 0;"><strong>Type:</strong> ${offer.type}</p>
      <p style="margin:6px 0;"><strong>Sector:</strong> ${offer.sector}</p>
      <p style="margin:6px 0;"><strong>Location:</strong> ${offer.location?.formattedAddress || offer.location?.city || 'Not specified'}</p>
      <p style="margin:6px 0;"><strong>Total Openings:</strong> ${offer.total_opening}</p>
      <p style="margin:6px 0;"><strong>Salary:</strong> ${offer.salary?.min || ''} - ${offer.salary?.max}</p>
      <p style="margin:6px 0;"><strong>Skills:</strong> ${offer.skills?.length ? offer.skills.join(', ') : 'Not specified'}</p>
      <p style="margin:6px 0;"><strong>Offer ID:</strong> ${offer._id}</p>
      <p style="margin:6px 0; color:#6b7280;"><em>Applied on: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</em></p>
    </div>

    <p style="margin:12px 0;">Our TNP team will review your application. If shortlisted, you will receive an email or phone call with the next steps.</p>

    <div style="margin:18px 0;">
      <a href="${process.env.FRONTEND_URL}/offers/${offer._id}"
         style="display:inline-block; padding:10px 16px; background:#0b5fff; color:#fff; text-decoration:none; border-radius:6px;">
        View Offer Details
      </a>
    </div>

    <p style="margin:0 0 8px 0;">Best regards,<br/><strong>TNP Cell</strong></p>

    <hr style="margin:18px 0; border:none; border-top:1px solid #eef2f7;" />
    <p style="font-size:12px; color:#777; margin:0;">If you did not apply for this role, please contact the TNP Cell immediately.</p>
  </div>
</body>
</html>

  `
});

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

    await transporter.sendMail({
  from: process.env.EMAIL_USER,
  to: process.env.EMAIL_TO,
  subject: `Offer Modified ${offer.title}`,
  html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
</head>
<body style="font-family: Arial, sans-serif; background:#f5f7fb; padding:20px;">
  <div style="max-width:680px; margin:auto; background:#ffffff; padding:22px; border-radius:8px; box-shadow:0 6px 18px rgba(0,0,0,0.06);">

    <h2 style="color:#0b5fff; margin:0 0 8px 0;">Offer Modified</h2>

    <p style="margin:0 0 12px 0;">Offer is modified please take notes</p>

    <div style="background:#f0f6ff; padding:14px; border-radius:6px; margin:14px 0;">
      <p style="margin:6px 0;"><strong>Role:</strong> ${offer.role}</p>
      <p style="margin:6px 0;"><strong>Company:</strong> ${offer.company?.name}</p>
      <p style="margin:6px 0;"><strong>Drive Type:</strong> ${offer.drive}</p>
      <p style="margin:6px 0;"><strong>Type:</strong> ${offer.type}</p>
      <p style="margin:6px 0;"><strong>Sector:</strong> ${offer.sector}</p>
      <p style="margin:6px 0;"><strong>Location:</strong> ${offer.location?.formattedAddress || offer.location?.city || 'Not specified'}</p>
      <p style="margin:6px 0;"><strong>Total Openings:</strong> ${offer.total_opening}</p>
      <p style="margin:6px 0;"><strong>Salary:</strong> ${offer.salary?.min || ''} - ${offer.salary?.max}</p>
      <p style="margin:6px 0;"><strong>Skills:</strong> ${offer.skills?.length ? offer.skills.join(', ') : 'Not specified'}</p>
      <p style="margin:6px 0;"><strong>Offer ID:</strong> ${offer._id}</p>
      <p style="margin:6px 0; color:#6b7280;"><em>Applied on: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</em></p>
    </div>

    <p style="margin:12px 0;">Our TNP team will review your application. If shortlisted, you will receive an email or phone call with the next steps.</p>

    <div style="margin:18px 0;">
      <a href="${process.env.FRONTEND_URL}/offers/${offer._id}"
         style="display:inline-block; padding:10px 16px; background:#0b5fff; color:#fff; text-decoration:none; border-radius:6px;">
        View Offer Details
      </a>
    </div>

    <p style="margin:0 0 8px 0;">Best regards,<br/><strong>TNP Cell</strong></p>

    <hr style="margin:18px 0; border:none; border-top:1px solid #eef2f7;" />
    <p style="font-size:12px; color:#777; margin:0;">If you did not apply for this role, please contact the TNP Cell immediately.</p>
  </div>
</body>
</html>

  `
});

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
