const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Joi = require('joi');

const companySchema = new Schema({
    name: {
            type: String,
            required: true
    },
    logo:{
            type: String,
            required: true
    },
    link:{
            type: String,
            required: true
    },
    description:{
            type: String,
            required: true
    },
    contact: {
            type: String,
            required: true
    },
    address: {
            type: Schema.Types.ObjectId,
            ref: 'Address',
            required: true
    },
    offers:[{
            type: Schema.Types.ObjectId,
            ref: 'Offer'
    }]
}, {
  timestamps: true
});

const Company = mongoose.model('Company', companySchema);

//Joi schema

const objectId = Joi.string().hex().length(24); // MongoDB ObjectId

const companyJoiSchema = Joi.object({

        _id: objectId.optional(),
        name: Joi.string().required(),
        logo: Joi.string().uri().required(), // Assuming logo is a URL
        link: Joi.string().uri().required(), // Assuming link is a URL
        description: Joi.string().required(),
        contact: Joi.string().required(), // Can add phone/email regex if needed
        address: objectId.required(),
        offers: Joi.array().items(objectId).optional().default([]),
        createdAt: Joi.date().optional(),
        updatedAt: Joi.date().optional()
});


module.exports = {Company, companyJoiSchema};