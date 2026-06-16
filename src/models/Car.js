import mongoose from 'mongoose';

const carSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Car name is required'],
      trim: true,
    },
    brand: {
      type: String,
      required: [true, 'Car brand is required'],
      trim: true,
    },
    year: {
      type: Number,
      required: [true, 'Manufacturing year is required'],
      min: [1886, 'Year must be after the invention of the automobile'], // 1886: Benz Patent-Motorwagen
    },
    pricePerDay: {
      type: Number,
      required: [true, 'Price per day is required'],
      min: [0, 'Price per day cannot be negative'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
    },
    location: {
      type: String,
      required: [true, 'Car location is required'],
      trim: true,
    },
    images: {
      type: [String],
      default: [],
    },
    available: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const Car = mongoose.model('Car', carSchema);
export default Car;
