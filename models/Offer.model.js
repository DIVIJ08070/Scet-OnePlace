const Joi = require('joi');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const offerSchema = new Schema({
    company:{
        type:Schema.Types.ObjectId,
        ref: 'Company',
        required: true
    },
    role:{
        type: String,
        required: true
    },
    location:{
        type: Schema.Types.ObjectId,
        ref: 'Address',
    },
    total_opening:{
        type: Number,
        required: true
    },
    drive:{
        type: String,
        enum:['on campus','off campus'],
        required: true
    },
    type:{
        type: String,
        enum:['internship','placement', 'internship and placement'],
        required: true
    },
    sector:{
        type: String,
        enum:['IT', 'Core', 'Management'],
        required: true
    },
    salary:{
        type:{
            min:{
                type:Number
            },
            max:{
                type:Number,
                required: true
            }
        }
    },
    criteria:{
        type:Schema.Types.ObjectId,
        ref: 'Criteria',
    },
    result:{
        type: Schema.Types.ObjectId,
        ref: 'OfferResult',
        required: true
    },
    skills:{
        type: [String],
        required: true
    }
}, {
  timestamps: true
});

const Offer = mongoose.model('Offer', offerSchema);

//joi schema
const objectId = Joi.string().hex().length(24);

const offerJoiSchema = Joi.object({
  company: objectId.required(),

  role: Joi.string().required(),

  location: objectId.optional(), // not required

  total_opening: Joi.number().required(),

  drive: Joi.string().valid('on campus', 'off campus').required(),

  type: Joi.string().valid('internship', 'placement', 'internship and placement').required(),

  sector: Joi.string().valid('IT', 'Core', 'Management').required(),

  salary: Joi.object({
    min: Joi.number().optional(),
    max: Joi.number().required()
  }).optional(), // salary itself is not marked required in mongoose

  criteria: objectId.optional(),

  result: objectId.required(),

  skills: Joi.array().items(Joi.string()).min(1).required()
});

module.exports = {Offer,offerJoiSchema};