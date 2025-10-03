
const ApiError = require('../utils/response/ApiError.util');
const ApiSuccess = require('../utils/response/ApiSuccess.util');
const studentService = require('./student.service');
const offerService = require('./offer.service')

const generateOfferReport = async (_id) => {
    const offerRes = await offerService.retriveOffer(_id);

    if(offerRes.statusCode !== 200){
        return offerRes;
    }

    let applicantes = offerRes.data.offer.applicants;

    data=[]
    for(let id of applicantes){
        console.log(id);
        const dt = await studentService.retriveStudent(id);
        console.log(dt);
        data.push(dt);
    }

    // applicantes = applicantes.map(async (id) => {
    //     console.log(id);
    //     const data = await studentService.retriveStudent(id);
    //     console.log(data);
    //     return data;
    // });

    return new ApiSuccess(200, 'Offer Report Generated Successfully', { applicants: data});
}

module.exports = {generateOfferReport};
