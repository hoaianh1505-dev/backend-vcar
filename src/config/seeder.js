import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import connectDB from './db.js';
import User from '../models/User.js';
import Car from '../models/Car.js';
import Booking from '../models/Booking.js';

dotenv.config();

const UPLOADS_DIR = 'public/uploads';

// Helper function to download an image from a URL and save it to the local uploads directory
const downloadCarImage = async (url, filename) => {
  const filepath = path.join(UPLOADS_DIR, filename);
  
  // Ensure the directory exists
  if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  }

  try {
    console.log(`Downloading sample image: ${url} -> ${filepath}`);
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    fs.writeFileSync(filepath, buffer);
    console.log(`Successfully saved: ${filename}`);
    return `/uploads/${filename}`;
  } catch (error) {
    console.error(`Failed to download image ${filename}:`, error.message);
    // Return a default fallback if download fails
    return `https://images.unsplash.com/photo-1542282088-fe8426682b8f?q=80&w=600&auto=format&fit=crop`;
  }
};

/**
 * Seeds initial database values to MongoDB Atlas and downloads local assets.
 * Clears old collections before writing new values.
 */
const seedData = async () => {
  try {
    console.log('Connecting to database...');
    await connectDB();

    console.log('Wiping existing data (Users, Cars, Bookings)...');
    await User.deleteMany();
    await Car.deleteMany();
    await Booking.deleteMany();

    console.log('Seeding admin and standard test users...');
    const adminUser = await User.create({
      fullName: 'V-Car Admin',
      email: 'admin',
      phone: '0912345678',
      password: '123456',
      role: 'admin',
    });

    const standardUser = await User.create({
      fullName: 'John Doe',
      email: 'john@gmail.com',
      phone: '0987654321',
      password: 'password123',
      role: 'user',
    });

    console.log('Downloading sample images to local uploads folder...');
    const teslaImgPath = await downloadCarImage(
      'https://images.unsplash.com/photo-1619767886558-efdc259cde1a?q=80&w=600&auto=format&fit=crop',
      'car-tesla.jpg'
    );
    const hondaImgPath = await downloadCarImage(
      'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?q=80&w=600&auto=format&fit=crop',
      'car-honda.jpg'
    );
    const fordImgPath = await downloadCarImage(
      'https://images.unsplash.com/photo-1584345604476-8ec5e12e42dd?q=80&w=600&auto=format&fit=crop',
      'car-ford.jpg'
    );

    console.log('Seeding initial car inventory...');
    const cars = await Car.insertMany([
      {
        name: 'Model 3',
        brand: 'Tesla',
        year: 2023,
        pricePerDay: 85,
        description: 'Premium electric sedan. Autopilot features, luxury glass roof, zero emissions, and exceptional acceleration.',
        location: 'Hanoi',
        images: [teslaImgPath],
        available: true,
      },
      {
        name: 'Civic RS',
        brand: 'Honda',
        year: 2022,
        pricePerDay: 50,
        description: 'Sporty daily sedan with premium leather interior, turbo engine, and complete driver-assistance safety package.',
        location: 'Danang',
        images: [hondaImgPath],
        available: true,
      },
      {
        name: 'Mustang GT Convertible',
        brand: 'Ford',
        year: 2021,
        pricePerDay: 120,
        description: 'V8 muscle convertible styling, soft-top layout, premium leather interior, and heavy acceleration specs.',
        location: 'Ho Chi Minh City',
        images: [fordImgPath],
        available: true,
      },
    ]);

    console.log('Seeding booking requests...');
    // Create a pending booking request
    await Booking.create({
      userId: standardUser._id,
      carId: cars[0]._id,
      rentalDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
      status: 'pending',
    });

    // Create an approved booking request
    await Booking.create({
      userId: standardUser._id,
      carId: cars[1]._id,
      rentalDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
      status: 'approved',
    });

    console.log('✅ Database and local assets seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeder execution failed:', error.message);
    process.exit(1);
  }
};

seedData();
