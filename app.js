const express = require('express');
const app = express();
const studentRouter = require('./routes/student.route');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/v1/student',studentRouter);

module.exports = app;