const studentService = require('../services/student.service');
const ApiSuccess = require('../utils/response/ApiSuccess.util');

const addNewStudent =async (req, res) => {

  const studentData = req.body;
  const studentRes = await studentService.addNewStudent(studentData);
  
  const studentInfoRes = await studentService.retriveStudent(studentRes.data.student._id);

  return res.status(studentRes.statusCode).json(new ApiSuccess(200, 'Student added successfully', {student: studentInfoRes.data.student}));
}

const retriveAllStudents = async (req, res) => {

  const studentsRes = await studentService.retriveAllStudents();

  return res.status(studentsRes.statusCode).json(studentsRes);
}

const updateStudent = async (req, res) => {

  const {studentId} = req.params;
  console.log(studentId)
  const studentData = req.body;
  const studentRes = await studentService.updateStudent(studentId,studentData);
  
  const studentInfoRes = await studentService.retriveStudent(studentRes.data.student._id);

  return res.status(studentRes.statusCode).json(new ApiSuccess(200, 'Student added successfully', {student: studentInfoRes.data.student}));
}

module.exports = {addNewStudent, retriveAllStudents, updateStudent}