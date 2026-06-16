import Car from '../models/Car.js';
import { AppError } from '../middlewares/error.middleware.js';

/**
 * Retrieves list of cars. Can be filtered (e.g. by availability).
 * @param {Object} filter Mongoose search filter
 * @returns {Promise<Object[]>} List of cars
 */
export const getCars = async (filter = {}) => {
  return Car.find(filter).sort({ createdAt: -1 });
};

/**
 * Retrieves a single car's detail by ID.
 * @param {string} carId 
 * @returns {Promise<Object>} Car document
 */
export const getCarById = async (carId) => {
  const car = await Car.findById(carId);
  if (!car) {
    throw new AppError('Car not found', 404);
  }
  return car;
};

/**
 * Creates a new car listing.
 * @param {Object} carData 
 * @returns {Promise<Object>} Created car document
 */
export const createCar = async (carData) => {
  return Car.create(carData);
};

/**
 * Updates an existing car listing.
 * @param {string} carId 
 * @param {Object} updateData 
 * @returns {Promise<Object>} Updated car document
 */
export const updateCar = async (carId, updateData) => {
  const car = await Car.findByIdAndUpdate(carId, updateData, {
    new: true,
    runValidators: true,
  });
  if (!car) {
    throw new AppError('Car not found', 404);
  }
  return car;
};

/**
 * Deletes a car listing.
 * @param {string} carId 
 * @returns {Promise<Object>} Deleted car document
 */
export const deleteCar = async (carId) => {
  const car = await Car.findByIdAndDelete(carId);
  if (!car) {
    throw new AppError('Car not found', 404);
  }
  return car;
};
