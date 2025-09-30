const jwt = require('jsonwebtoken');
const studentService = require('../services/student.service');
const ApiError = require('../utils/response/ApiError.util');

const authenticateUser = async (req, res, next) => {

    let token= null;
    console.log(req.headers);

    if(req.headers['authorization']){

        token = req.headers['authorization'].split(' ')[1];
    }
    else{
        res.status(403).json(new ApiError(403,"token required","token required"))
    }

    console.log(token);
    const decodedPayload = jwt.verify(token, process.env.JWT_SECRET);

    const studentRes = await studentService.retriveStudent(decodedPayload._id);

    req.user = studentRes.data.student;

    next();
}

module.exports = authenticateUser;