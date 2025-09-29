const mongoose = require('mongoose');
const Schema = mongoose.Schema;
//const {scvhema}= require ("congoose")
const Joi = require('joi');
const {academicResultJoiSchema} = require('./AcademicResult.model');

const academicDetailsSchema = new Schema({
    result: {
        type: Schema.Types.ObjectId,
        ref: 'AcademicResult',
        required: true
    },
    applied: [{    
            type: Schema.Types.ObjectId,
            ref: 'Offer',  
    }],
    selected: {
        type: {
            offer: {
                type: Schema.Types.ObjectId,
                ref: 'Offer'
            },
            salary:{
                type:Number
            }
        }

    },
    passout_year: {
        type: Number,
        required: true
    }
}, {
  timestamps: true
});

const AcademicDetails = mongoose.model('AcademicDetails', academicDetailsSchema);

//JOI schema
const objectId = Joi.string().hex().length(24); // MongoDB ObjectId validation

const academicDetailsJoiSchema = Joi.object({
    _id: objectId.optional(),
    result: objectId.required(),

    applied: Joi.array().items(
        Joi.object({
        offer: objectId.required()
        })
    ).optional().default([]),

    selected: Joi.object({
        offer: objectId.required(),
        salary: Joi.number().optional()
    }).optional().default({}),

    passout_year: Joi.number().required(),

    createdAt: Joi.date().optional(),
    updatedAt: Joi.date().optional()
});

const embeddedAcademicDetailsJoiSchema = Joi.object({
     _id: objectId.optional(),
    result: academicResultJoiSchema.required(),

    applied: Joi.array().items(
        Joi.object({
        offer: objectId.required()
        })
    ).optional().default([]),

    selected: Joi.object({
        offer: objectId.required(),
        salary: Joi.number().optional()
    }).optional().default({}),

    passout_year: Joi.number().required(),

    createdAt: Joi.date().optional(),
    updatedAt: Joi.date().optional()
});


module.exports = {AcademicDetails, academicDetailsJoiSchema, embeddedAcademicDetailsJoiSchema };