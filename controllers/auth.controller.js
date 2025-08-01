const studentService = require('../services/student.service');
const ApiSuccess = require('../utils/response/ApiSuccess.util');
const ApiError = require('../utils/response/ApiError.util');

const login = async (req, res) => {

    const {email, password} = req.body;

    const ValidationRes = await studentService.validateStudent(email, password);

    return res.status(200).json(new ApiSuccess(200, "Login Successfull.", ValidationRes.data));
}

module.exports = {login};
