const adminService = require('../services/admin.service');
const ApiError = require('../utils/response/ApiError.util');
const ApiSuccess = require('../utils/response/ApiSuccess.util');

// Add new admin
const addNewAdmin = async (req, res) => {
    const adminData = req.body;

    const adminRes = await adminService.addNewAdmin(adminData);
    if (adminRes.statusCode !== 200) {
        throw new ApiError(400, 'Admin addition failed', adminRes.errors);
    }

    return res.status(200).json(new ApiSuccess(200, 'Admin added successfully', adminRes.data));
};

// Retrieve all admins
const retriveAllAdmins = async (req, res) => {
    const adminRes = await adminService.retriveAllAdmins();
    return res.status(adminRes.statusCode).json(adminRes);
};

// Retrieve admin by ID
const retriveAdminById = async (req, res) => {
    const { adminId } = req.params;
    const adminRes = await adminService.retriveAdmin(adminId);
    return res.status(adminRes.statusCode).json(adminRes);
};

// Validate admin
const validateAdmin = async (req, res) => {
    const { idToken } = req.body;
    const adminRes = await adminService.validateAdmin(idToken);
    return res.status(adminRes.statusCode).json(adminRes);
};

// Remove token
const removeToken = async (req, res) => {
    const { adminId } = req.params;
    const adminRes = await adminService.removeToken(adminId);
    return res.status(adminRes.statusCode).json(adminRes);
};


// ✅ Update admin controller
const updateAdmin = async (req, res) => {
    const { adminId } = req.params;
    const adminData = req.body;

    const adminRes = await adminService.updateAdmin(adminId, adminData);

    if (adminRes.statusCode !== 200) {
        throw new ApiError(400, "Admin update failed", adminRes.errors);
    }

    return res.status(200).json(
        new ApiSuccess(200, "Admin updated successfully", { admin: adminRes.data.admin })
    );
};

// ✅ Delete admin controller
const deleteAdmin = async (req, res) => {
    const { adminId } = req.params;

    const adminRes = await adminService.deleteAdmin(adminId);

    if (adminRes.statusCode !== 200) {
        throw new ApiError(400, "Admin deletion failed", adminRes.errors);
    }

    return res.status(200).json(
        new ApiSuccess(200, "Admin deleted successfully", { admin: adminRes.data.admin })
    );
};

module.exports = {
   
};

module.exports = {
    addNewAdmin,
    retriveAllAdmins,
    retriveAdminById,
    validateAdmin,
    removeToken,
     updateAdmin,
    deleteAdmin
};
