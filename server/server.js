require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 8000;

// Connect to MongoDB and start listening
connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`===============================================`);
      console.log(` HouseHunt Backend Server Running on Port ${PORT}`);
      console.log(` Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(` Base API URL: http://localhost:${PORT}/api`);
      console.log(`===============================================`);
    });
  })
  .catch((err) => {
    console.error('Failed to start server due to MongoDB error:', err.message);
  });
