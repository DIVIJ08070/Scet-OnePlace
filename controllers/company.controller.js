const compnayService = require('../services/company.service');
const ApiSuccess = require('../utils/response/ApiSuccess.util');

//add new comapany
const addCompany = async (req, res) => {

    const companyData = req.body;
    let compnayRes = await compnayService.createCompany(companyData);

    
    compnayRes = await compnayService.retriveCompnay(compnayRes.data.company._id);

    return res.status(200).json(new ApiSuccess(200, 'Compnay Added Successfully', {company: compnayRes.data.company}));
}

//retrive all company
const getAllCompany = async (req, res) => {

    const compnayRes = await compnayService.retriveAllCompany();

    return res.status(200).json(compnayRes);
}

//retrive company by id
const getCompanyById = async (req, res) => {

    const {companyId} = req.params;

    const compnayRes = await compnayService.retriveCompnay(companyId);

    return res.status(200).json(compnayRes);
}

//update company
const updateCompany = async (req, res) => {

    const companyData = req.body;
    const {companyId} = req.params;
    let compnayRes = await compnayService.updateCompany(companyId,companyData);

    
    compnayRes = await compnayService.retriveCompnay(compnayRes.data.company._id);

    return res.status(200).json(new ApiSuccess(200, 'Compnay Added Successfully', {company: compnayRes.data.company}));
}


module.exports = {addCompany, getAllCompany, getCompanyById, updateCompany};