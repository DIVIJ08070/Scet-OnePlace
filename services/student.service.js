const {Student, studentJoiSchema, embeddedStudentJoiSchema} = require('../models/Student.model');
const academiDetailsService = require('../services/academicDetails.service');
const addressService = require('../services/address.service');
const ApiSuccess = require('../utils/response/ApiSuccess.util');
const ApiError = require('../utils/response/ApiError.util');
const {verifyGoogleToken} = require('../utils/authentication/verifyLoginToken.auth');
const offerService = require('./offer.service');
const criteriaService = require("./criteria.service");
const academicDetailsService = require('./academicDetails.service');
const academicResultService = require('./academicResult.service');
const {transporter} = require('../config/mailer.config')


// CREATE a new student
const addNewStudent = async (_studentData) => {

    //validate embedded student schema
    const { error:embeddedError } = embeddedStudentJoiSchema.validate(_studentData);
    if (embeddedError) {
        console.log(embeddedError);
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

    // validate idToken
    const idToken = _studentData.googleId;
    if (!idToken) {
        throw new ApiError(400, 'Google ID token is required', 'googleId is missing');
    }


    const payloadRes = await verifyGoogleToken(idToken);
    _studentData.googleId = payloadRes.data.payload.sub;


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
    
    const ValidationRes = await validateStudent(idToken); 

    // Return success response
    return new ApiSuccess(200, 'New Student Added Successfully', { student: newStudent , tokens: ValidationRes.data.tokens});

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

    // validate idToken
    const idToken = _studentData.googleId;
    if (!idToken) {
        throw new ApiError(400, 'Google ID token is required', 'googleId is missing');
    }
    const payloadRes = await verifyGoogleToken(idToken);
    _studentData.googleId = payloadRes.data.payload.sub;


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

const validateStudent = async (_idToken) => {

    const payloadRes = await verifyGoogleToken(_idToken);  

    const googleId = payloadRes.data.payload.sub;
    const email = payloadRes.data.payload.email;

    console.log(email);

    const studentRes = await retriveStudentByEmail(email);
    const student = studentRes.data.student;

    const isMatch = await student.compareGoogleId(googleId);
    if(!isMatch){
        throw new ApiError(400, "Invalid credentials", "GoogleId is Invalid");
    }

    //get tokens

    //Get Tokens
    const tokens = await student.generateTokens();
    return new ApiSuccess(200, "Student validation successful", {tokens: tokens});
}

// const validateStudent = async (_email, _idToken) => {

//     if(!_email && !_password){
//         throw new ApiError(400, "Empty credentials", "credentails are empty");
//     }

//     console.log(_email,_password);


//     const studentRes = await retriveStudentByEmail(_email);

//     const student = studentRes.data.student;

//     const status = await student.comparePassword(_password);

//     if(!status){
//         throw new ApiError(400, "Invalid credentials", "credentail is Invalid");
//     }

//     const tokens = await student.generateTokens();

//     return new ApiSuccess(200, "Student validation succesfull", {tokens: tokens});

// }

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

const applyForOffer = async (_studentId, _offerId) => {

    const studentRes = await retriveStudent(_studentId);
    let student = studentRes.data.student;

    //check if already applied
    const alreadyApplied = student.applied.some(application => application.toString() === _offerId);
    if(alreadyApplied){
        throw new ApiError(400, 'Already applied for this offer', 'Duplicate application');
    }

    const offerRes = await offerService.retriveOffer(_offerId);
    let offer = offerRes.data.offer;

    if(offer.criteria){
        const criteriaRes = await criteriaService.retriveCriteria(offerRes.criteria);
        let criteria = criteriaRes.data.criteria;

        //validate stundent
        
        //validate gender
        if(criteria.gender){
            if(criteria.gender != student.gender){
                throw new ApiError(400, 'Invalid gender', 'gender not allowd'); 
            }
        }

        if(!student.academic_details){
             throw new ApiError(400, 'Academic details not entered', 'NOt aalowed to apply'); 
        }

        const academicDetailsRes = await academiDetailsService.retriveAcademicDetails(student.academic_details);

        if(!academicDetailsRes.data.academicDetails.result){
             throw new ApiError(400, 'Academic reasult is not present', 'Not allowed to apply'); 
        }

        const academicResultRes = await academicResultService.retriveAcademicSChema(academicDetailsRes.data.academicDetails.result);

        const result = academicResultRes.data.academicResult;

        //validate result
        if(result.degree.cgpa < criteria.min_result){
            throw new ApiError(400, 'Low Rsult', 'student not allowed'); 
        }

        //validate backlog
        if(result.degree.backlogs > criteria.max_backlog){
            throw new ApiError(400, 'High backlogs', 'student not allowed'); 
        }

        //validate passout year
        const allowed = criteria.passout_year.some(year => year === result.degree.completion_year);

        if(!allowed){
            throw new ApiError(400, 'Passout year invalid', 'student not allowed'); 
        }

        //validate branch
        
    }
    

    //update student applied array
    student.applied.push( _offerId);
    await student.save();

    //update offer applied 
    offer.applicants.push( _studentId);
    await offer.save();

    await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: student.email,
        subject:"YOu have applied to offer by TNP",
    });

    //return success
    return new ApiSuccess(200, 'Applied for offer successfully', {student: student, offer: offer});

}

const addSelection = async (_studentId, _offerId, _salary) => {
    const studentRes = await Student.retriveStudent(_studentId);

    const student = studentRes.data;
    student.selected = {offer:_offerId, salary:_salary};

    await student.save();

    return ApiSuccess(200, 'Result added succcessfully', {result:result});

}

module.exports = {addNewStudent, retriveStudent, retriveAllStudents, updateStudent, validateStudent, removeToken, refreshTokens, applyForOffer, retriveStudentByEmail, addSelection};