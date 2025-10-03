const studentService = require('../services/student.service');
const adminService = require('../services/admin.service');
const ApiSuccess = require('../utils/response/ApiSuccess.util');
const ApiError = require('../utils/response/ApiError.util');
const jwt = require('jsonwebtoken');
const { valid } = require('joi');

/**
 * Unified Login (Student or Admin)
 */
const login = async (req, res) => {
    const { googleId } = req.body;

    let ValidationRes, role, accessToken, refreshToken;

    // Try validating as student
    ValidationRes = await studentService.validateStudent(googleId);
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
    if (role === "student") {
        await studentService.saveToken(user._id, refreshToken);
    } else {
        await adminService.saveToken(user._id, refreshToken);
    }

    return res.status(200).json(
        new ApiSuccess(200, "Login successful", {
            user,
            role,
            accessToken,
            refreshToken
        })
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

module.exports = { login, logout, refreshTokens };
