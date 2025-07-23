const {Criteria, criteriaJoiSchema} = require('../models/Criteria.model');
const ApiError = require('../utils/response/ApiError.util');
const ApiSuccess = require('../utils/response/ApiSuccess.util');

//create Criteria
const addCriteria = async (_criteria) => {

    //validate schema
    const {error} = criteriaJoiSchema.validate(_criteria);

    if(error){
        throw new ApiError(400, 'Invalid data of Criteria', error.details[0].message);
    }

    //create instance
    const newCriteria = new Criteria(_criteria);

    //save data
    await newCriteria.save();

    //return res
    return ApiSuccess(200, 'New Acriteria added sucessfully', {criteria: newCriteria});
}

//retrive criteria
const retriveCriteria = async (_id) => {

    //retrive
    const criteria = await Criteria.findById(_id);

    //validated
    if(!criteria){
        throw new ApiError(400, 'Invalid id of criteria', 'criteria not found');
    }

    //return
    return new ApiSuccess(200, 'Creiteria retrived successfully', {criteria: criteria});
}


//update Criteria
const updateCriteria = async (_criteria) => {

    //validate schema
    const {error} = criteriaJoiSchema.validate(_criteria);

    if(error){
        throw new ApiError(400, 'Invalid data of Criteria', error.details[0].message);
    }

    //retrive & update instance
    const updatedCriteria = await Criteria.findByIdAndUpdate(_criteria._id, _criteria, {new: true});

    if(!updatedCriteria){
        throw new ApiError(400, 'Invalid criteria id', 'Criteria not found');
    }

    //return res
    return ApiSuccess(200, 'New Acriteria added sucessfully', {criteria: updatedCriteria});
}

//delete criteria
const deleteCriteria = async (_id) => {

    const deletedCriteria = await Criteria.findByIdAndDelete(_id);

    if(!deletedCriteria){
        throw new ApiError(400, 'Invalid criteria id', 'Criteria not found');
    }    
    
    return new ApiSuccess(200, 'criteria deleted sucesfully' , {criteria: deletedCriteria});
}

module.export = {addCriteria, retriveCriteria, updateCriteria, deleteCriteria};