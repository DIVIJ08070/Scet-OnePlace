const { Admin, adminJoiSchema } = require('../models/Admin.model');
const ApiSuccess = require('../utils/response/ApiSuccess.util');
const ApiError = require('../utils/response/ApiError.util');
const { verifyGoogleToken } = require('../utils/authentication/verifyLoginToken.auth');

// Create Admin
const addNewAdmin = async (_adminData) => {
    // Validate input
    const { error } = adminJoiSchema.validate(_adminData);
    if (error) {
        throw new ApiError(400, 'Invalid admin data', error.details[0].message);
    }

    // Validate Google token
    const idToken = _adminData.googleId;
    if (!idToken) {
        throw new ApiError(400, 'Google ID token is required', 'googleId is missing');
    }

    const payloadRes = await verifyGoogleToken(idToken);
    _adminData.googleId = payloadRes.data.payload.sub;
    _adminData.email = payloadRes.data.payload.email;

    // Save admin
    const newAdmin = new Admin(_adminData);
    await newAdmin.save();

    const tokens = await newAdmin.generateTokens();

    return new ApiSuccess(200, 'New Admin Added Successfully', { admin: newAdmin, tokens });
};

// Retrieve all admins
const retriveAllAdmins = async () => {
    const admins = await Admin.find();
    return new ApiSuccess(200, 'All admins retrieved successfully', { admins });
};

// Retrieve admin by ID
const retriveAdmin = async (_id) => {
    const admin = await Admin.findById(_id);
    if (!admin) throw new ApiError(404, 'Admin not found', 'Invalid Id');
    return new ApiSuccess(200, 'Admin retrieved successfully', { admin });
};

// Retrieve admin by Email
const retriveAdminByEmail = async (_email) => {
    const admin = await Admin.findOne({ email: _email });
    if (!admin) throw new ApiError(404, 'Admin not found', 'Invalid Email');
    return new ApiSuccess(200, 'Admin retrieved successfully', { admin });
};

// Validate Admin with Google ID
const validateAdmin = async (_idToken) => {
    const payloadRes = await verifyGoogleToken(_idToken);
    const googleId = payloadRes.data.payload.sub;
    const email = payloadRes.data.payload.email;

    const adminRes = await retriveAdminByEmail(email);
    const admin = adminRes.data.admin;

    const isMatch = await admin.compareGoogleId(googleId);
    if (!isMatch) throw new ApiError(400, 'Invalid credentials', 'GoogleId mismatch');

    const tokens = await admin.generateTokens();
    return new ApiSuccess(200, 'Admin validation successful', { tokens });
};

// Remove Token
const removeToken = async (_id) => {
    const adminRes = await retriveAdmin(_id);
    let admin = adminRes.data.admin;

    admin = await admin.removeToken();
    return new ApiSuccess(200, 'Token removed successfully', { admin });
};

// Refresh Tokens
const refreshTokens = async (_refreshToken, _admin) => {
    const tokens = await _admin.refreshTokens(_refreshToken);
    return new ApiSuccess(200, 'Tokens refreshed successfully', { tokens });
};

// ✅ Update admin
const updateAdmin = async (_id, _adminData) => {
    // Validate Google ID if provided
    if (_adminData.googleId) {
        const payloadRes = await verifyGoogleToken(_adminData.googleId);
        _adminData.googleId = payloadRes.data.payload.sub;
    }

    // Validate schema
    const { error } = adminJoiSchema.validate(_adminData);
    if (error) {
        throw new ApiError(400, "Invalid admin data", error.details[0].message);
    }

    // Update in DB
    const updatedAdmin = await Admin.findByIdAndUpdate(_id, _adminData, { new: true });
    if (!updatedAdmin) {
        throw new ApiError(404, "Admin not found", "Invalid Id");
    }

    return new ApiSuccess(200, "Admin updated successfully", { admin: updatedAdmin });
};

// ✅ Delete admin
const deleteAdmin = async (_id) => {
    const deletedAdmin = await Admin.findByIdAndDelete(_id);

    if (!deletedAdmin) {
        throw new ApiError(404, "Admin not found", "Invalid Id");
    }

    return new ApiSuccess(200, "Admin deleted successfully", { admin: deletedAdmin });
};

module.exports = {
    addNewAdmin,
    retriveAllAdmins,
    retriveAdmin,
    retriveAdminByEmail,
    validateAdmin,
    removeToken,
    refreshTokens,
     updateAdmin,
    deleteAdmin
};
