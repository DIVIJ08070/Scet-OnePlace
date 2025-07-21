const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const generateHash = require('../utils/generateHash.util');

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


const Student = mongoose.model('Student', studentSchema);

module.exports = Student;