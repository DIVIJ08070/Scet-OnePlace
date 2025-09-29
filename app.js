const cors = require('cors')
const express = require('express');
const app = express();
const studentRouter = require('./routes/student.route');
const companyRouter = require('./routes/company.route');
const offerRouter = require('./routes/offer.route');
const authRouter = require('./routes/auth.route');
const selfRouter = require('./routes/self.route');

const BASE_REQUEST = '/api/v1';

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.use(`${BASE_REQUEST}/student`,studentRouter);
app.use(`${BASE_REQUEST}/company`,companyRouter);
app.use(`${BASE_REQUEST}/offer`,offerRouter);
app.use(`${BASE_REQUEST}/auth`,authRouter);
app.use(`${BASE_REQUEST}/me`,selfRouter);

module.exports = app;