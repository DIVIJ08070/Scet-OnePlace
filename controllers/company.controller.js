const compnayService = require('../services/company.service');
const ApiSuccess = require('../utils/response/ApiSuccess.util');

//add new comapany
const addCompany = async (req, res) => {

    console.log(req.body);

    const companyData = req.body;
    let compnayRes = await compnayService.createCompany(companyData);

    compnayRes = await compnayService.retriveCompnay(compnayRes.data.company._id);

    return res.status(200).json(new ApiSuccess(200, 'Compnay Added Successfully'), {company: compnayRes.data.company});
}

module.exports = {addCompany};