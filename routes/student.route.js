const express = require('express');
const router = express.Router();
const studentController = require('../controllers/student.contoller');

router.post('/', studentController.addNewStudent);
router.get('/', studentController.retriveAllStudents);
router.patch('/:studentId',studentController.updateStudent);

module.exports = router;