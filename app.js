const express = require('express');
const app = express();
const studentRouter = require('./routes/student.route');
const companyRouter = require('./routes/company.route');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/v1/student',studentRouter);
app.use('/api/v1/company',companyRouter);

module.exports = app;