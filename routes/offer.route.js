const express =require('express');
const router = express.Router();
const offerController = require('../controllers/offer.controller');

//add new offer
router.post('/', offerController.addOffer);

//retrive all offers
router.get('/', offerController.retriveAllOffrs);

//retrive offer by id
router.get('/:OfferId', offerController.retriveOfferById);

//update offer
router.patch('/:OfferId', offerController.updateOffer);

//add result
router.post('/:offerId/addresult', offerController.addResult);

//select student
router.post('/:offerId/selecctStudent', offerController.selectStudents);

module.exports = router;