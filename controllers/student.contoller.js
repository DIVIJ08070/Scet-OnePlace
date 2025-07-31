const {Student, studentJoiSchema} = require('../models/Student.model');
const ApiError = require('../utils/response/ApiError.util');
const ApiSuccess = require('../utils/response/ApiSuccess.util');
const studentService = require('../services/student.service');
// const AcedemeicDetailsController = require('./academicDetails.controller');

//add new student
const addNewStudent = async (req, res) => {

    //retrive data
    const studentData = req.body;

    //call service
    let studentRes = await studentService.addNewStudent(studentData); 

    if(studentRes.statusCode !== 200){
        throw new ApiError(400, 'Student addtion failed',studentRes.errors);
    }

    //retrive data
    studentRes = await studentService.retriveStudent(studentRes.data.student._id);

    if(studentRes.statusCode !== 200){
        throw new ApiError(400, 'Student addtion failed',studentRes.errors);
    }

    //send res
    return res.status(200).json(new ApiSuccess(200, 'Student Added Successfully', {student:studentRes.data.student}));
}

//retrive all students
const retriveAllStudents = async (req, res) => {

    //call service
    const studentRes = await studentService.retriveAllStudents();

    if(studentRes.statusCode !== 200){
        throw new ApiError(400, 'Retrive student Failed', studentRes.errors);
    }

    //return
    return res.status(200).json(new ApiSuccess(200, 'Students data retrived successfully', {student:studentRes.data.student}));
}

//retrive student by id
const retriveStudentById = async (req, res) => {

    const {studentId} = req.params;
   
    const studentRes = await studentService.retriveStudent(studentId);

    return res.status(studentRes.statusCode).json(studentRes);
}

//update student
const updateStudent = async (req, res) => {

    //retrive data
    const {studentId} = req.params;
    const studentData = req.body;

    //call service
    let studentRes = await studentService.updateStudent(studentId,studentData); 

    if(studentRes.statusCode !== 200){
        throw new ApiError(400, 'Student update failed',studentRes.errors);
    }


    //retrive data
    studentRes = await studentService.retriveStudent(studentRes.data.student._id);

    if(studentRes.statusCode !== 200){
        throw new ApiError(400, 'Student addtion failed',studentRes.errors);
    }

    //send res
    return res.status(200).json(new ApiSuccess(200, 'Student updated Successfully', {student:studentRes.data.student}));
}



module.exports = {addNewStudent, retriveAllStudents, updateStudent, retriveStudentById}
