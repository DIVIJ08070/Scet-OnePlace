const express = require('express');
const router = express.Router();
const companyController = require('../controllers/company.controller');

router.post('/',companyController.addCompany);4
router.get('/', companyController.getAllCompany);
router.get('/:companyId', companyController.getCompanyById);
router.patch('/:companyId', companyController.updateCompany);

module.exports = router;