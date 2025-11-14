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
        const criteriaRes = await criteriaService.retriveCriteria(offer.criteria);
        let criteria = criteriaRes.data.criteria;

        //validate stundent
        
        //validate gender
        if(criteria.gender){
            if(criteria.gender != student.gender){
                throw new ApiError(400, 'Invalid gender', 'Invalid gender'); 
            }
        }

        if(!student.academic_details){
             throw new ApiError(400, 'Academic details not entered', 'Academic details not entered'); 
        }

        const academicDetailsRes = await academiDetailsService.retriveAcademicDetails(student.academic_details);

        if(!academicDetailsRes.data.academicDetails.result){
             throw new ApiError(400, 'Academic reasult is not present', 'Academic reasult is not present'); 
        }

        const academicResultRes = await academicResultService.retriveAcademicSChema(academicDetailsRes.data.academicDetails.result);

        const result = academicResultRes.data.academicResult;

        //validate result
        if(result.degree.cgpa < criteria.min_result){
            throw new ApiError(400, 'Low Rsult', 'Low Rsult'); 
        }

        //validate backlog
        if(result.degree.backlogs > criteria.max_backlog){
            throw new ApiError(400, 'High backlogs', 'High backlogs'); 
        }

        //validate passout year
        // const allowed = criteria.passout_year.some(year => year === result.degree.completion_year);

        // if(!allowed){
        //     throw new ApiError(400, 'Passout year invalid', 'Passout year invalid'); 
        // }

        //validate branch
        
    }
    

    //update student applied array
    student.applied.push( _offerId);
    await student.save();

    //update offer applied 
    offer.applicants.push( _studentId);
    await offer.save();

    console.log(process.env.EMAIL_USER, " ", student.email)

await transporter.sendMail({
  from: process.env.EMAIL_USER,
  to: student.email,
  subject: `Application Received for ${offer.title}`,
  html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
</head>
<body style="font-family: Arial, sans-serif; background:#f5f7fb; padding:20px;">
  <div style="max-width:680px; margin:auto; background:#ffffff; padding:22px; border-radius:8px; box-shadow:0 6px 18px rgba(0,0,0,0.06);">

    <h2 style="color:#0b5fff; margin:0 0 8px 0;">Application Received</h2>

    <p style="margin:6px 0 18px 0;">Hello <strong>${student.name}</strong>,</p>

    <p style="margin:0 0 12px 0;">Your application has been submitted successfully for the offer below:</p>

    <div style="background:#f0f6ff; padding:14px; border-radius:6px; margin:14px 0;">
      <p style="margin:6px 0;"><strong>Role:</strong> ${offer.role}</p>
      <p style="margin:6px 0;"><strong>Company:</strong> ${offer.company?.name}</p>
      <p style="margin:6px 0;"><strong>Drive Type:</strong> ${offer.drive}</p>
      <p style="margin:6px 0;"><strong>Type:</strong> ${offer.type}</p>
      <p style="margin:6px 0;"><strong>Sector:</strong> ${offer.sector}</p>
      <p style="margin:6px 0;"><strong>Location:</strong> ${offer.location?.formattedAddress || offer.location?.city || 'Not specified'}</p>
      <p style="margin:6px 0;"><strong>Total Openings:</strong> ${offer.total_opening}</p>
      <p style="margin:6px 0;"><strong>Salary:</strong> ${offer.salary?.min || ''} - ${offer.salary?.max}</p>
      <p style="margin:6px 0;"><strong>Skills:</strong> ${offer.skills?.length ? offer.skills.join(', ') : 'Not specified'}</p>
      <p style="margin:6px 0;"><strong>Offer ID:</strong> ${offer._id}</p>
      <p style="margin:6px 0; color:#6b7280;"><em>Applied on: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</em></p>
    </div>

    <p style="margin:12px 0;">Our TNP team will review your application. If shortlisted, you will receive an email or phone call with the next steps.</p>

    <div style="margin:18px 0;">
      <a href="${process.env.FRONTEND_URL}/offers/${offer._id}"
         style="display:inline-block; padding:10px 16px; background:#0b5fff; color:#fff; text-decoration:none; border-radius:6px;">
        View Offer Details
      </a>
    </div>

    <p style="margin:0 0 8px 0;">Best regards,<br/><strong>TNP Cell</strong></p>

    <hr style="margin:18px 0; border:none; border-top:1px solid #eef2f7;" />
    <p style="font-size:12px; color:#777; margin:0;">If you did not apply for this role, please contact the TNP Cell immediately.</p>
  </div>
</body>
</html>

  `
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