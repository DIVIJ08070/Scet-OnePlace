const reportService = require('../services/report.service');

const generateOfferReport = async (req, res) => {
    const offersRes = await reportService.generateOfferReport(req.params.id);

    return res.status(offersRes.statusCode).json(offersRes);
}

module.exports = {generateOfferReport}