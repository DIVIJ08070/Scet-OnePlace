const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Joi = require('joi');

const criteriaSchema = new Schema({
    gender:{
        type: String,
        enum:['Male', 'Female', 'Other']
    },
    min_result:{
        type: Number,
        required: true
    },
    max_backlog:{
        type: Number,
        required: true
    },
    passout_year:[{
        type: Number,
        required: true
    }],
    branch:{
        type: String,
        // enum:['CSE', 'IT', 'ECE', 'EEE', 'ME', 'CE', 'Other'],
        required: true
    }
}, {
  timestamps: true
});

const Criteria = mongoose.model('Criteria', criteriaSchema);


//Joi Schema
const objectId = Joi.string().hex().length(24);

const criteriaJoiSchema = Joi.object({
    _id: objectId.optional(),
    gender: Joi.string().valid('Male', 'Female', 'Other').optional(),
    min_result: Joi.number().optional(),
    max_backlog: Joi.number().optional(),
    passout_year: Joi.array()
        .items(Joi.number().optional())
        .min(1)
        .required(),
    branch: Joi.string().optional(),
    createdAt: Joi.date().optional(),
    updatedAt: Joi.date().optional()
  // If you want to enforce branch enum:
  // branch: Joi.string().valid('CSE', 'IT', 'ECE', 'EEE', 'ME', 'CE', 'Other').required()
});


module.exports = {Criteria, criteriaJoiSchema};