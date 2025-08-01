const {Student, studentJoiSchema, embeddedStudentJoiSchema} = require('../models/Student.model');
const academiDetailsService = require('../services/academicDetails.service');
const addressService = require('../services/address.service');
const ApiSuccess = require('../utils/response/ApiSuccess.util');
const ApiError = require('../utils/response/ApiError.util');


// CREATE a new student
const addNewStudent = async (_studentData) => {

    //validate embedded student schema
    const { error:embeddedError } = embeddedStudentJoiSchema.validate(_studentData);
    if (embeddedError) {
        throw new ApiError(400, 'Invalid student data', embeddedError.details[0].message);
    }


    //add academic details if provided
    const academic_details = _studentData.academic_details;
    const academicDetailsRes = await academiDetailsService.addAcademicDetails(academic_details);
    if (academicDetailsRes.statusCode === 200) {
        _studentData.academic_details = academicDetailsRes.data.academicDetails._id.toString();
    }

    //add address if provided
    const address = _studentData.address;
    const addressRes = await addressService.createAddress(address);
    if (addressRes.statusCode === 200) {
        _studentData.address = addressRes.data.address._id.toString();
    }

    // Validate student data using Joi schema
    const { error } = studentJoiSchema.validate(_studentData);
    if (error) {
        console.log(error)
        throw new ApiError(400, 'Invalid student data', error.details[0].message);
    }

    // Create a new student instance
    const newStudent = new Student(_studentData);

    // Save the student instance to the database
    await newStudent.save();


    // Return success response
    return new ApiSuccess(200, 'New Student Added Successfully', { student: newStudent });

};

//retrive all students
const retriveAllStudents = async () => {
    const students = await Student.find();

    return new ApiSuccess(200, 'All student retrived successfully', {student: students});
}

//retrive student
const retriveStudent = async (_id) => {
        
    const student = await Student.findById(_id);

    if(!student){
        throw new ApiError(400, 'student not found', 'invalid Id');
    }

    return new ApiSuccess(200, 'student Retrived Successfully', {student: student});

        
}

const updateStudent = async (_id, _studentData) => {

    //validate embedded student schema
    const { error:embeddedError } = embeddedStudentJoiSchema.validate(_studentData);
    if (embeddedError) {
        throw new ApiError(400, 'Invalid student data', embeddedError.details[0].message);
    }

    //validate student
    const studentRes = await retriveStudent(_id);

    //add academic details if provided
    const academic_details = _studentData.academic_details;
    const academicDetailsRes = await academiDetailsService.updateAcademicDetails(studentRes.data.student.academic_details._id, academic_details);
    if (academicDetailsRes.statusCode === 200) {
        _studentData.academic_details = academicDetailsRes.data.academicDetails._id.toString();
    }

    //add address if provided
    const address = _studentData.address;
    const addressRes = await addressService.updateAddress(studentRes.data.student.address._id, address);
    if (addressRes.statusCode === 200) {
        _studentData.address = addressRes.data.address._id.toString();
    }

    // Validate student data using Joi schema
    const { error } = studentJoiSchema.validate(_studentData);
    if (error) {
        console.log(error)
        throw new ApiError(400, 'Invalid student data', error.details[0].message);
    }

    // Create a new student instance
    const updatedStudent = await Student.findByIdAndUpdate(_id, _studentData, {new:true});

    // Return success response
    return new ApiSuccess(200, 'New Student Added Successfully', { student: updatedStudent });

};

const retriveStudentByEmail = async (_email) => {

    if(!_email){
        throw new ApiError(400, "Empty credentials", "credentails are empty");
    }

    const student = await Student.findOne({email: _email});

    if(!student){
        throw new ApiError(400, "Invalid Email", "Student not found");
    }

    return new ApiSuccess(200, "student Retrived Successfully", {student: student});
}

const validateStudent = async (_email, _password) => {

    if(!_email && !_password){
        throw new ApiError(400, "Empty credentials", "credentails are empty");
    }

    console.log(_email,_password);


    const studentRes = await retriveStudentByEmail(_email);

    const student = studentRes.data.student;

    const status = await student.comparePassword(_password);

    if(!status){
        throw new ApiError(400, "Invalid credentials", "credentail is Invalid");
    }

    const tokens = await student.generateTokens();

    return new ApiSuccess(200, "Student validation succesfull", {tokens: tokens});

}

const removeToken = async (_id) => {

    const studentRes = await retriveStudent(_id);

    let student = studentRes.data.student;
    
    student = await student.removeToken();

    return new ApiSuccess(200, 'Token removed successfully', {student: student});
}

const refreshTokens = async (_refreshToken, _student) => {

    const tokens = await _student.refreshTokens(_refreshToken);

    return new ApiSuccess(200, 'Tokens refreshed successfully', {tokens: tokens});
}
module.exports = {addNewStudent, retriveStudent, retriveAllStudents, updateStudent, validateStudent, removeToken, refreshTokens};