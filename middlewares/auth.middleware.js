const jwt = require('jsonwebtoken');
const studentService = require('../services/student.service');

const authenticateUser = async (req, res, next) => {

    const token = req.header.Authorization.splite(' ')[1];

    const decodedPayload = jwt.verify(token);

    const studentRes = await studentService.retriveStudent(decodedPayload._id);

    req.user = studentRes.data.student;

    next();
}

module.exports = authenticateUser;