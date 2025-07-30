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


module.exports = {addNewStudent, retriveStudent, retriveAllStudents, updateStudent};