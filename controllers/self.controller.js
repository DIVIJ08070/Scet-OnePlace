const ApiSuccess = require('../utils/response/ApiSuccess.util');

const getUser = (req,res) => {
    
    return res.status(200).json(new ApiSuccess(200, "User retrived Successfully", {user: req.user}));
}

module.exports = {getUser};