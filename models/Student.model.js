const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const generateHash = require('../utils/generateHash.util');
const Joi = require('joi');
const bcrypt = require('bcryptjs');
const {addressJoiSchema} = require('./Address.model');
const {embeddedAcademicDetailsJoiSchema} = require('./AcademicDetails.model');
const ApiError = require('../utils/response/ApiError.util');

const studentSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  enrollment_no: {
    type: String,
    unique: true,
    required: true
  },
  dob: {
    type: Date,
    required: true
  },
  email: {
    type: String,
    unique: true,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  contact: {
    type: String,
    required: true
  },
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Other'],
    required: true
  },
  caste: {
    type: String,
    enum: ['General', 'OBC', 'SC', 'ST', 'SEBC'],
  },
  academic_details: {
    type: Schema.Types.ObjectId,
    ref: 'AcademicDetails'
  },
  address: {
    type: Schema.Types.ObjectId,
    ref: 'Address'
  },

  refresh_token: {
    type: String,
    default: null
  }
}, {
  timestamps: true
});

studentSchema.index({ enrollment_no: 1, email: 1 }, { unique: true });

studentSchema.pre('save', async function (next) {
    try {
      if (this.isModified('password')) {
        const hashedPassword = await generateHash(this.password);
        this.password = hashedPassword;
      }
      next();
    } catch (err) {
      next(new ApiError('Error hashing password: ' + err.message));
    }
});

//auto populate
studentSchema.pre(/^find/, function (next) {
  this.populate({
      path: 'academic_details',
      populate :{
          path: 'result',
      }
  }). populate({
      path: 'address'
  // }).select('-password');
  });
  next();
});

studentSchema.methods.comparePassword = async function(plainPassword) {
    try {
      console.log(plainPassword, this.password);
        const isMatch = await bcrypt.compare(plainPassword, this.password);
        return isMatch;
        } catch (err) {
        throw new Error('Password comparison failed: ' + err.message);
    }
};

studentSchema.methods.generateTokens = async function() {
  const payload = {
    _id: this._id,
    email: this.email,
    enrollment_no: this.enrollment_no,
    name: this.name,
  };

  const accessToken = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: '1d'
  });

  const refreshToken =  jwt.sign({
    _id: this._id,
  }, process.env.JWT_SECRET, {
    expiresIn: '10d'
  });

  this.refresh_token = refreshToken;

  await this.save();

  return {accessToken, refreshToken};
};

studentSchema.methods.refreshTokens = async function(_refreshToken) {

  if(this.refresh_token !== _refreshToken){
    throw new ApiError(400, "Invalid Credentials", "invalid refresh token");
  }

  return await this.generateTokens();
  
};

studentSchema.methods.removeToken = async function () {

  this.refresh_token = null;
  await this.save();

  return this;

}


const Student = mongoose.model('Student', studentSchema);


//joi schema
  const ObjectId = Joi.string().hex().length(24);

  const studentJoiSchema = Joi.object({
    _id: ObjectId.optional(),
    name: Joi.string().required(),
    enrollment_no: Joi.string().required(),
    dob: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().required(),
    contact: Joi.string()
      .pattern(/^[0-9]{10}$/) // Optional: Restrict to 10-digit numbers
      .required(),
    gender: Joi.string()
      .valid('Male', 'Female', 'Other')
      .required(),
    caste: Joi.string()
      .valid('General', 'OBC', 'SC', 'ST', 'SEBC')
      .optional(),
    academic_details: ObjectId.required(),
    address: ObjectId.required(),
    refresh_token: Joi.string().allow(null).optional(),
    createdAt: Joi.date().optional(),
    updatedAt: Joi.date().optional()
  });


const embeddedStudentJoiSchema = Joi.object({
  _id: ObjectId.optional(),
  name: Joi.string().required(),
  enrollment_no: Joi.string().required(),
  dob: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().required(),
  contact: Joi.string()
    .pattern(/^[0-9]{10}$/) // Optional: Restrict to 10-digit numbers
    .required(),
  gender: Joi.string()
    .valid('Male', 'Female', 'Other')
    .required(),
  caste: Joi.string()
    .valid('General', 'OBC', 'SC', 'ST', 'SEBC')
    .optional(),
  academic_details: embeddedAcademicDetailsJoiSchema.optional(),
  address: addressJoiSchema.optional(),
  refresh_token: Joi.string().allow(null).optional(),
  createdAt: Joi.date().optional(),
  updatedAt: Joi.date().optional()
});


module.exports = {Student, studentJoiSchema, embeddedStudentJoiSchema};
