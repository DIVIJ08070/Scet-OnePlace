const {express} = require('express');
const router = express.Router();
const reportController = require('../controllers/report.contoller');

router.get('/offer/:id', reportController.generateOfferReport);

module.exports = router;