const {Student, studentJoiSchema} = require('./Student.model');
const ApiError = require('../utils/response/ApiError.util');
const ApiSuccess = require('../utils/response/ApiSuccess.util');
const AcedemeicDetailsController = require('./academicDetails.controller');


//create student
const createStudent = async (_student) => {

 //academic details 
let res = await AcedemeicDetailsController.addAcademicDetails(_student.academic_details);
if(res.status === 200){
    _student.academic_details = res.data.academicDetails._id;
}

//address
res = await addressController.createAddress(_student.address);
if(res.status === 200){
    _student.address = res.data.address._id;
}

const {error} = studentJoiSchema.validate(_student);
if(error){
    throw new ApiError(400, 'Invalid schema of student', error.details[0].message);
}

const newStudent = new Student(_student);
await newStudent.save();
return new ApiSuccess(200, 'Student created successfully', {student: newStudent});

}


//retrive student

const retriveStudent = async (_id) =>
{
  const rStudent = await Student.findById(_id).populate('academic_details').populate('address');
  if(!rStudent){
      throw new ApiError(400, 'Student not found', 'Invalid ID');
  }
  return new ApiSuccess(200, 'Student retrived successfully', {student: rStudent});
}
  
  
  
  
//update student

const updateStudent = async (_student) => 
{
  const {error} = studentJoiSchema.validate(_student);
  if(error){
      throw new ApiError(400, 'Invalid schema for update', error.details[0].message);
  }
const updatedStudent = Student.findByIdAndUpdate(_student._id,_student,{new:true});
if(!updatedStudent){
    throw new ApiError(400, 'Student not found', 'Invalid ID'); 
}
  return new ApiSuccess(200, 'Student updated successfully', {student: updatedStudent});
}



//delete student
const deleteStudent = async(_id) => {
    const deletedStudent = await Student.findByIdAndDelete(_id);
    if(!deletedStudent){
        throw new ApiError(400, 'Student not found', 'Invalid ID');
    }
    return new ApiSuccess(200, 'Student deleted successfully', {student: deletedStudent});  
}

module.exports = {createStudent,retriveStudent,updateStudent,deleteStudent}
