const Joi = require('joi');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const offerResultSchema = new Schema({
    round_date:{
        type: Date,
        required: true
    },
    students: [{
        type: Schema.Types.ObjectId,
        ref: 'Student',
        required: true
    }],
}, {
  timestamps: true
});


const objectId = Joi.string().hex().length(24).message('Invalid ObjectId');

const offerResultJoiSchema = Joi.object({

 _id: objectId.optional(),
  round_date: Joi.date().required(),

  students: Joi.array()
    .items(objectId.optional())
    .min(0)
    .optional()
    .messages({
      'any.required': '"students" is required',
      'array.min': 'At least one student is required',
    }),
        createdAt: Joi.date().optional(),
        updatedAt: Joi.date().optional()
});

const OfferResult = mongoose.model('OfferResult', offerResultSchema);
module.exports = {OfferResult, offerResultJoiSchema};