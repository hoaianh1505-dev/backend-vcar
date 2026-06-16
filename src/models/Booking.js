import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
    },
    carId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Car',
      required: [true, 'Car ID is required'],
    },
    rentalDate: {
      type: Date,
      required: [true, 'Rental date is required'],
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'cancelled'],
      default: 'pending',
    },
  },
  {
    timestamps: true,
  }
);

const Booking = mongoose.model('Booking', bookingSchema);
export default Booking;
