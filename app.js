const express = require('express');
const app = express();
const studentRouter = require('./routes/student.route');
const companyRouter = require('./routes/company.route');
const offerRouter = require('./routes/offer.route');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/v1/student',studentRouter);
app.use('/api/v1/company',companyRouter);
app.use('/api/v1/offer',offerRouter);

module.exports = app;