import app from './app.js';
import connectDB from './config/db.js';
import dotenv from 'dotenv';
import { autoCancelExpiredBookings } from './services/booking.service.js';

dotenv.config();

const PORT = process.env.PORT || 5000;

// Establish database connection and start the server
const startServer = async () => {
  await connectDB();
  
  // Run auto-cancel pending requests job on server boot
  autoCancelExpiredBookings();
  
  // Set background check interval to run every 1 hour (3600000 ms)
  setInterval(autoCancelExpiredBookings, 60 * 60 * 1000);

  app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
    console.log(`API documentation available at http://localhost:${PORT}/api-docs`);
  });
};

startServer().catch((error) => {
  console.error(`Failed to start server: ${error.message}`);
  process.exit(1);
});
