const express = require('express');
const router = express.Router();
const studentController = require('../controllers/student.contoller');
const fileUploadMiddleware = require('../middlewares/fileUpload.middleware');

// router.post('/', fileUploadMiddleware, studentController.addNewStudent);
router.post('/', studentController.addNewStudent);
router.get('/', studentController.retriveAllStudents);
router.get('/:studentId',studentController.retriveStudentById);
router.patch('/:studentId',studentController.updateStudent);
router.post('/apply/:offerId',studentController.applyForOffer);

module.exports = router;    