const jwt = require('jsonwebtoken');
const studentService = require('../services/student.service');
const adminService = require('../services/admin.service');
const ApiError = require('../utils/response/ApiError.util');

const authenticateUser = async (req, res, next) => {
    try {
        let token = null;

        if (req.headers['authorization']) {
            token = req.headers['authorization'].split(' ')[1];
        } else {
            return res
                .status(403)
                .json(new ApiError(403, "Token required", "Authorization header missing"));
        }

        // Decode JWT
        const decodedPayload = jwt.verify(token, process.env.JWT_SECRET);

        const { _id, role } = decodedPayload;
        if (!role) {
            throw new ApiError(401, "Unauthorized", "Role missing in token");
        }

        let userRes;
        if (role === "student") {
            userRes = await studentService.retriveStudent(_id);
            console.log("user: " ,userRes.data);
            req.user = userRes.data.student;
        } else if (role === "admin") {
            userRes = await adminService.retriveAdmin(_id);
            console.log("admin : " ,userRes.data);
            req.user = userRes.data.admin;
        } else {
            throw new ApiError(401, "Unauthorized", "Invalid role");
        }

        if (userRes.statusCode !== 200 || !userRes.data) {
            throw new ApiError(401, "Unauthorized", "User not found or inactive");
        }

        console.log(userRes.data);

        
        req.user.role = role // attach role too
        next();
    } catch (err) {
        console.error("Auth Error:", err);
        return res.status(401).json(
            new ApiError(401, "Unauthorized", err.message || "Invalid token")
        );
    }
};
module.exports = authenticateUser;
