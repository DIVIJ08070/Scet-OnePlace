// config/db.js
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,     // for new URL string parser
      useUnifiedTopology: true,  // for the new Server Discovery and Monitoring engine
      // useCreateIndex: true      // (optional) no longer required in mongoose ≥ 6.x
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) { 
    console.error(`Error: ${error.message}`);
    process.exit(1); // exit process with failure
  }
};

module.exports = connectDB;
