const offerService = require('../services/offer.service');

const generateOfferReport = async (req, res) => {
    const offersRes = await offerService.generateOfferReport(req.params.id);

    return res.status(offersRes.statusCode).json(offersRes);
}

module.exports = {generateOfferReport}