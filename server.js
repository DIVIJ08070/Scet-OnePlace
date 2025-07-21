require('dotenv').config();
const port = process.env.PORT || 5000;
const app = require('./app');
const connectDB = require('./config/db.config');

connectDB();

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});