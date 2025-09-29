const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Joi = require('joi');

const academicResultSchema = new Schema({
    ssc:{
        type:{
            percentage: {
                type: Number,
                required: true
            },
            completion_year: {
                type: Number,
                required: true
            }
        }
    },
    hsc:{  
        type:{
            percentage: {
                type: Number,
            },
            completion_year: {
                type: Number,
            }
        }
    },
    diploma:{
        type:{
            result: {
                type: new mongoose.Schema({
                        sem1: Number,
                        sem2: Number,
                        sem3: Number,
                        sem4: Number,
                        sem5: Number,
                        sem6: Number,
                    }, { _id: false })
            },
            completion_year: {
                type: Number,
            }
        }
    },
    degree: {
        type: {
            result: {
                type:new mongoose.Schema({
                        sem1: Number,
                        sem2: Number,
                        sem3: Number,
                        sem4: Number,
                        sem5: Number,
                        sem6: Number,
                        sem7: Number,
                        sem8: Number
                    }, { _id: false })
            },
            completion_year: {
                type: Number,
            },
            backlogs: {
                type: Number,
                default: 0
            },
            cgpa:{
                type: Number,
                default: 0
            }
        }}
},{
    timestamps: true
});


const AcademicResult = mongoose.model('AcademicResult', academicResultSchema);


//joi schema
const objectId = Joi.string().hex().length(24).optional();

const academicResultJoiSchema = Joi.object({
    _id: objectId,    
    ssc: Joi.object({
        percentage: Joi.number().required(),
        completion_year: Joi.number().required()
    }).required(),

    hsc: Joi.object({
        percentage: Joi.number().optional(),
        completion_year: Joi.number().optional()
    }).optional(),

    diploma: Joi.object({
        result: Joi.object({
        sem1: Joi.number().optional(),
        sem2: Joi.number().optional(),
        sem3: Joi.number().optional(),
        sem4: Joi.number().optional(),
        sem5: Joi.number().optional(),
        sem6: Joi.number().optional(),
        }).optional(),
        completion_year: Joi.number().optional()
    }).optional(),

    degree: Joi.object({
        result: Joi.object({
        sem1: Joi.number().optional(),
        sem2: Joi.number().optional(),
        sem3: Joi.number().optional(),
        sem4: Joi.number().optional(),
        sem5: Joi.number().optional(),
        sem6: Joi.number().optional(),
        sem7: Joi.number().optional(),
        sem8: Joi.number().optional(),
        }).optional(),
        completion_year: Joi.number().optional(),
        backlogs: Joi.number().default(0),
    }).optional(),
    createdAt: Joi.date().optional(),
    updatedAt: Joi.date().optional()
});


module.exports = {AcademicResult, academicResultJoiSchema};