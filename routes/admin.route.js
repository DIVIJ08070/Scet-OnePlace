const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const authenticateUser = require('../middlewares/auth.middleware');

// Add new admin
router.post('/', adminController.addNewAdmin);

// Get all admins
router.get('/', adminController.retriveAllAdmins);

// Get admin by ID
router.get('/:adminId', adminController.retriveAdminById);

// Update admin
router.patch('/:adminId', adminController.updateAdmin);

// Delete admin
router.delete('/:adminId', adminController.deleteAdmin);

// Validate admin (example: with token)
router.post('/validate', adminController.validateAdmin);

// Remove token
router.delete('/token/:adminId', adminController.removeToken);

module.exports = router;
