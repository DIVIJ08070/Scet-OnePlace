const mongoose = require('mongoose');
const Joi = require('joi')
const Schema = mongoose.Schema;

const addressSchema = new Schema({
    address_line:{
        type: String,
    },
    area:{
        type: String,
        required: true
    },
    city:{
        type: String,
        required: true
    },
    state:{
        type: String,
        required: true
    },
    country:{
        type: String,
        required: true
    },
    pincode:{
        type: Number,
        required: true
    },
}, {
  timestamps: true
});

const Address = mongoose.model('Address', addressSchema);


//joi schema for validation
const objectId = Joi.string().hex().length(24).optional();

const addressJoiSchema = Joi.object({
    _id: objectId,
    address_line: Joi.string().optional(),
    area: Joi.string().required(),
    city: Joi.string().required(),
    state: Joi.string().required(),
    country: Joi.string().required(),
    pincode: Joi.number().required(),
    createdAt: Joi.date().optional(),
    updatedAt: Joi.date().optional()
});


module.exports = {Address, addressJoiSchema};