const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const Joi = require('joi');

const adminSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },

    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },

    googleId: {
        type: String,
        required: true,
        unique: true,
    },

    refreshToken: {
        type: String,
    }
}, { timestamps: true });

// ===== Instance methods =====
adminSchema.pre(/^find/, function (next) {
  this.role = "admin";
  next();
});

// Generate Access & Refresh Tokens
adminSchema.methods.generateTokens = async function () {
    const admin = this;
    const accessToken = jwt.sign(
        { _id: admin._id, email: admin.email, role: 'admin' },
        process.env.JWT_SECRET,
        { expiresIn: '1d' }
    );

    const refreshToken = jwt.sign(
        { _id: admin._id, email: admin.email, role: 'admin' },
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: '10d' }
    );

    admin.refreshToken = refreshToken;
    await admin.save();

    return { accessToken, refreshToken };
};

// Compare googleId
adminSchema.methods.compareGoogleId = async function (googleId) {
    return this.googleId === googleId;
};

// Remove refresh token
adminSchema.methods.removeToken = async function () {
    this.refreshToken = null;
    await this.save();
    return this;
};

// Refresh tokens
adminSchema.methods.refreshTokens = async function (_refreshToken) {
    if (_refreshToken !== this.refreshToken) {
        throw new Error('Invalid refresh token');
    }
    return await this.generateTokens();
};

// ===== JOI Validation Schemas =====
const adminJoiSchema = Joi.object({
    name: Joi.string().min(2).max(100).required(),
    email: Joi.string().email().required(),
    googleId: Joi.string().required(),
    refreshToken: Joi.string().optional()
});

module.exports = {
    Admin: mongoose.model('Admin', adminSchema),
    adminJoiSchema
};
