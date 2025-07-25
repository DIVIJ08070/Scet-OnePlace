const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const generateHash = require('../utils/generateHash.util');
const Joi = require('joi');

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

studentSchema.pre('save', function(next) {
  if (this.isModified('password')) {
    generateHash(this.password)
      .then(hashedPassword => {
        this.password = hashedPassword;
        next();
      })
      .catch(err => {
        next(new Error('Error hashing password: ' + err.message));
      });
  }
  next();
});

studentSchema.methods.comparePassword = async function(plainPassword) {
    try {
        const isMatch = await bcrypt.compare(plainPassword, this.password);
        return isMatch;
        } catch (err) {
        throw new Error('Password comparison failed: ' + err.message);
    }
};

studentSchema.methods.generateAccessToken = function() {
  const payload = {
    _id: this._id,
    email: this.email,
    enrollment_no: this.enrollment_no,
    name: this.name,
  };

  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: '1d'
  });
};

studentSchema.methods.generateRefreshToken = function() {
  const payload = {
    _id: this._id,
  };

  return  jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: '10d'
  });
};


const studentJoiSchema = Joi.object({
  _id: objectId.optional(),

  name: Joi.string().required().messages({
    'any.required': '"name" is required',
    'string.base': '"name" must be a string'
  }),

  enrollment_no: Joi.string().required().messages({
    'any.required': '"enrollment_no" is required'
  }),

  dob: Joi.date().required().messages({
    'any.required': '"dob" (Date of Birth) is required'
  }),

  email: Joi.string().email().required().messages({
    'any.required': '"email" is required',
    'string.email': '"email" must be a valid email address'
  }),

  password: Joi.string().min(6).required().messages({
    'any.required': '"password" is required',
    'string.min': '"password" must be at least 6 characters'
  }),

  contact: Joi.string().required().messages({
    'any.required': '"contact" is required'
  }),

  gender: Joi.string()
    .valid('Male', 'Female', 'Other')
    .required()
    .messages({
      'any.required': '"gender" is required',
      'any.only': '"gender" must be one of [Male, Female, Other]'
    }),

  caste: Joi.string()
    .valid('General', 'OBC', 'SC', 'ST', 'SEBC')
    .optional(),

  academic_details: objectId.optional(),

  address: objectId.optional(),

  refresh_token: Joi.string().allow(null).optional(),

  createdAt: Joi.date().optional(),
  updatedAt: Joi.date().optional()
});


const Student = mongoose.model('Student', studentSchema);

module.exports = {Student, studentJoiSchema};