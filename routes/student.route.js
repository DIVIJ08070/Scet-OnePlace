const express = require('express');
const router = express.Router();
const studentController = require('../controllers/student.contoller');
const fileUploadMiddleware = require('../middlewares/fileUpload.middleware');
const authenticateUser = require('../middlewares/auth.middleware');

// router.post('/', fileUploadMiddleware, studentController.addNewStudent);
router.post('/', studentController.addNewStudent);
router.get('/', studentController.retriveAllStudents);
router.get('/:studentId',studentController.retriveStudentById);
router.patch('/:studentId',studentController.updateStudent);
router.post('/apply/:offerId', authenticateUser, studentController.applyForOffer);

module.exports = router;    