const studentService = require('../services/student.service');
const adminService = require('../services/admin.service');
const ApiSuccess = require('../utils/response/ApiSuccess.util');
const ApiError = require('../utils/response/ApiError.util');
const jwt = require('jsonwebtoken');
const { valid } = require('joi');
const {Admin} = require('../models/Admin.model');

const {verifyGoogleToken} = require('../utils/authentication/verifyLoginToken.auth');
const {Student} = require('../models/Student.model');

/**
 * Unified Login (Student or Admin)
 */
const login = async (req, res) => {
    const { googleId } = req.body;

    let ValidationRes, role, accessToken, refreshToken;

    // Try validating as student
    ValidationRes = await validateStudent(googleId);
    if (ValidationRes?.statusCode === 200 && ValidationRes.data) {
        role = "student";
        console.log(ValidationRes.data);
    } else {
        // Try validating as admin
        ValidationRes = await adminService.validateAdmin(googleId);
        if (ValidationRes?.statusCode === 200 && ValidationRes.data) {
            role = "admin";
        }
    }

    if (!role) {
        throw new ApiError(401, "Login failed", "Invalid credentials");
    }

    const user = ValidationRes.data;

    // Issue JWT (short-lived access token)
    accessToken = user.tokens.accessToken;
    // Issue refresh token (longer-lived)
    refreshToken = user.tokens.refreshToken;
    // Save refresh token in DB
    // if (role === "student") {
    //     await studentService.saveToken(user._id, refreshToken);
    // } else {
    //     await adminService.saveToken(user._id, refreshToken);
    // }

    return res.status(200).json(
new ApiSuccess(200, "Login successful", {tokens: {accessToken, refreshToken}, user: user})
    );
};

/**
 * Unified Logout
 */
const logout = async (req, res) => {
    const user = req.user; // contains role from JWT

    if (user.role === "student") {
        await studentService.removeToken(user._id);
    } else {
        await adminService.removeToken(user._id);
    }

    return res.status(200).json(
        new ApiSuccess(200, `${user.role} logged out successfully`, {})
    );
};

/**
 * Unified Refresh Tokens
 */
const refreshTokens = async (req, res) => {
    const { refreshToken } = req.body;
    const user = req.user;

    let refreshRes;

    if (user.role === "student") {
        refreshRes = await studentService.refreshTokens(refreshToken, user);
    } else {
        refreshRes = await adminService.refreshTokens(refreshToken, user);
    }

    if (!refreshRes || refreshRes.statusCode !== 200) {
        throw new ApiError(401, "Token refresh failed", "Invalid refresh token");
    }

    return res.status(200).json(
        new ApiSuccess(200, "Tokens refreshed successfully", refreshRes.data)
    );
};

const validateStudent = async (_idToken) => {

    const payloadRes = await verifyGoogleToken(_idToken);  

    const googleId = payloadRes.data.payload.sub;
    const email = payloadRes.data.payload.email;

    console.log(email);

    const student = await Student.findOne({email: email});

    if(!student){
        return new ApiError(400, "Invalid credentials", "Student not found");
    }

    const isMatch = await student.compareGoogleId(googleId);
    if(!isMatch){
        return new ApiError(400, "Invalid credentials", "GoogleId is Invalid");
    }

    //Get Tokens
    const tokens = await student.generateTokens();
    return new ApiSuccess(200, "Student validation successful", {tokens: tokens});
}

const validateAdmin = async (_idToken) => {

    const payloadRes = await verifyGoogleToken(_idToken);  

    const googleId = payloadRes.data.payload.sub;
    const email = payloadRes.data.payload.email;

    console.log(email);

    const student = await Admin.findOne({email: email});

    if(!student){
        return new ApiError(400, "Invalid credentials", "Admin not found");
    }

    const isMatch = await student.compareGoogleId(googleId);
    if(!isMatch){
        return new ApiError(400, "Invalid credentials", "GoogleId is Invalid");
    }

    //Get Tokens
    const tokens = await student.generateTokens();
    return new ApiSuccess(200, "Student validation successful", {tokens: tokens});
}

module.exports = { login, logout, refreshTokens };
