import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Car from '../models/Car.js';
import Booking from '../models/Booking.js';
import connectDB from './db.js';

dotenv.config();

const checkDatabase = async () => {
  try {
    await connectDB();

    const unavailableCars = await Car.find({ available: false });
    console.log(`Found ${unavailableCars.length} unavailable cars:`);
    for (const car of unavailableCars) {
      const activeBookings = await Booking.find({
        carId: car._id,
        status: { $in: ['pending', 'approved'] }
      });
      console.log(`- Car: ${car.brand} ${car.name} (${car._id})`);
      console.log(`  Active bookings count: ${activeBookings.length}`);
      if (activeBookings.length > 0) {
        activeBookings.forEach(b => {
          console.log(`    * Booking ID: ${b._id}, Status: ${b.status}, User: ${b.userId}, Date: ${b.rentalDate}`);
        });
      } else {
        console.log(`  ⚠️ No active bookings found for this car. Resetting to available...`);
        car.available = true;
        await car.save();
        console.log(`  Set ${car.brand} ${car.name} to available: true`);
      }
    }

    console.log('Inspection complete.');
    process.exit(0);
  } catch (error) {
    console.error('Error checking database:', error);
    process.exit(1);
  }
};

checkDatabase();
