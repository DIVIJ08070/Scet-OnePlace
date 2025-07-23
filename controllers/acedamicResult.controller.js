const { AcademicResult, academicResultJoiSchema } = require('../models/AcademicResult.model');
const ApiSucess = require('../utils/response/ApiSuccess.util');
const ApiError = require('../utils/response/ApiError.util');

//create new instance
const createAcademicResult = async (_academicResult) => {

    //validate data
    const { error } = academicResultJoiSchema.validate(_academicResult);

    if(error){
        throw new ApiError(400, 'Invalid schema of Acadmic Result', error.details[0].message);
    }

    //create instance
    const newAcademicResult = new AcademicResult(_academicResult);

    //save data
    await newAcademicResult();

    //send res
    return ApiSucess(200, 'Academic Result Added Successfully', {acadmicResult: newAcademicResult});
}

//retrive acedamic schema by id
const retriveAcademicSChema = async (_id) => {

    //retrive data
    const academicResult = await AcademicResult.findById(_id);

    //validate data
    if(!academicResult){
        throw new ApiError(400, 'Invaid Result Id', 'Result not found');
    }

    //send res
    return new ApiSucess(200, 'Academic Result retrived Successfully', {academicResult: academicResult});
}

//update result
const updateAcademicResult = async(_academicResult) => {

    //validate schema of data
    const {error} = academicResultJoiSchema.validate(_academicResult);

    if(error){
        throw new ApiError(400, 'Invalid schema of Acadmic Result', error.details[0].message);
    }

    //retrive & update Data
    const updatedAcademicResult = await AcademicResult.findByIdAndUpdate(_academicResult._id, _academicResult,{ new: true });

    //validate data
    if(!updatedAcademicResult){
        throw new ApiError(400, 'Academic Result not found', 'Academic Result is null.');
    }

    //return res
    return new ApiSucess(200, 'Academic Result Updated Successfully', {academicResult: updatedAcademicResult});
}

const deleteAcademicResult = async (_id) => {

    const deletedAcademicResult = await AcademicResult.findByIdAndDelete(_id);

    if(!deletedAcademicResult){
        throw new ApiError(400, 'Academic Sreult not found', 'Acedamic Result is null');
    }

    return new ApiSucess(200, 'Academic Result deleted Successfully', {academicResult: deletedAcademicResult});
}

module.export = {createAcademicResult, retriveAcademicSChema, updateAcademicResult, deleteAcademicResult};