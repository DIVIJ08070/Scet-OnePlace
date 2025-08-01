const studentService = require('../services/student.service');
const ApiSuccess = require('../utils/response/ApiSuccess.util');
const ApiError = require('../utils/response/ApiError.util');

const login = async (req, res) => {

    const {email, password} = req.body;

    const ValidationRes = await studentService.validateStudent(email, password);

    return res.status(200).json(new ApiSuccess(200, "Login Successfull.", ValidationRes.data));
}

const logout = async (req, res) => {

    const user = req.user;

    const studentRes = await studentService.removeToken(user._id);

    return res.status(200).json(new ApiSuccess(200, 'User loged out successfully', {}));
}

const refreshTokens = async (req, res) => {

    const  {refreshToken} = req.body;
    const user = req.user;

    const studentRes = await studentService.refreshTokens(refreshToken, user);

    return res.status(200).json(new ApiSuccess(200, 'Yokens refreshed successfully', studentRes.data));


}

module.exports = {login, logout, refreshTokens};
