const {AcademicDetails, academicDetailsJoiSchema, embeddedAcademicDetailsJoiSchema} = require('../models/AcademicDetails.model');
const { AcademicResult } = require('../models/AcademicResult.model');
const ApiError = require('../utils/response/ApiError.util');
const ApiSuccess = require('../utils/response/ApiSuccess.util');
const AcademicResultService = require('./academicResult.service');

//add new deatails
const addAcademicDetails = async (_academicDetails) => {


    //validate emabbed schema
    const {error:emabbedSchemaError} = embeddedAcademicDetailsJoiSchema.validate(_academicDetails);
    if(emabbedSchemaError){
        throw new ApiError(400, 'Invalid Data of Academic Details', emabbedSchemaError.details[0].message);
    }

    //add result
    const res = await AcademicResultService.createAcademicResult(_academicDetails.result);

    if(res.statusCode === 200){
        _academicDetails.result = res.data.acadmicResult._id.toString();
    } else {
        return res;
    }


    //validate schema of data
    const {error} = academicDetailsJoiSchema.validate(_academicDetails);

    if(error){
        throw new ApiError(400, 'Invalid Data of Academic Details',error.details[0].message);
    }


    //create instance
    const newAcademicDeails = new AcademicDetails(_academicDetails);

    //add data
    await newAcademicDeails.save();



    //return res
    return new ApiSuccess(200, 'Academic Details Added Successfully', {academicDetails: newAcademicDeails});
}

//retrive academic details
const retriveAcademicDetails = async (_id) => {

    //retrive data
    const academicDetails = await AcademicDetails.findById(_id);

    //validate data
    if(!academicDetails){
        throw new ApiError(400, 'Academic Details not found', 'Invalid Id ');
    }

    //return res
    return new ApiSuccess(200, 'Academic Details found successfully', {academicDetails: academicDetails} );
}

//update acddemicDetails
const updateAcademicDetails = async (_id,_academicDetails) => {

    //validate emabbed schema
    const {error:emabbedSchemaError} = embeddedAcademicDetailsJoiSchema.validate(_academicDetails);
    if(emabbedSchemaError){
        throw new ApiError(400, 'Invalid Data of Academic Details', emabbedSchemaError.details[0].message);
    }

    //validate academic details
    const academic_details = await retriveAcademicDetails(_id);


    //update result
    const res = await AcademicResultService.updateAcademicResult(academic_details.result, _academicDetails.result);

    if(res.status === 200){
        _academicDetails.result = res.data.AcademicResult._id.toString();
    } else {
        return res;
    }
    

    //validate schema of details
    const {error} = academicDetailsJoiSchema.validate(_academicDetails);

    if(error){
        throw new ApiError(400, 'Invalid Data of Academic Details',error.details[0].message);
    }

    //retrive & update data
    const updatedAcademicDetails = await AcademicDetails.findByIdAndUpdate(_id, _academicDetails, {new : true});

    //validte data
    if(!updatedAcademicDetails){
        throw new ApiError(400, 'Academic Details not found', 'Invalid Id');
    }

    //return res
    return new ApiSuccess(200, 'AcademicDetails Updated Successfully', {academicDetails:updatedAcademicDetails});
}

//delete academicDetails
const deleteAcademicDetails = async (_id) => {

    //retrive acedemic details
    const academicDetails = await AcademicDetails.findById(_id);

    if(!academicDetails){
        throw new ApiError(400, 'Academic Details not found', ' Invalid Id ');
    }

    //delete academicResult
    const res = await AcademicResult.deleteAcademicResult(academicDetails.result);

    //remove from offer applied
    //remove from offer selected

    //delete academic details
    const deletedAcademicDetails = await AcademicDetails.findByIdAndDelete(_id);


    return new ApiSuccess(200, 'Academic details deleted Successfully', {academicDetails : deletedAcademicDetails});
}

module.exports = {addAcademicDetails, retriveAcademicDetails, updateAcademicDetails, deleteAcademicDetails};
