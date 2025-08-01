const jwt = require('jsonwebtoken');
const studentService = require('../services/student.service');

const verifyRefreshToken = async (req, res, next) => {

    const {refreshToken} = req.body;

    const decodedPayload = jwt.verify(refreshToken,process.env.JWT_SECRET);

    const studentRes = await studentService.retriveStudent(decodedPayload._id);

    req.user = studentRes.data.student;

    next();
}

module.exports = verifyRefreshToken;