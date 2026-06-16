import * as carService from '../services/car.service.js';
import { uploadMultipleToS3 } from '../services/s3.service.js';

/**
 * Handle listing all cars. Supports optional query filter ?available=true
 */
export const getCars = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.available !== undefined) {
      filter.available = req.query.available === 'true';
    }
    
    const cars = await carService.getCars(filter);
    
    res.status(200).json({
      success: true,
      count: cars.length,
      data: cars,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Handle getting a specific car details by ID
 */
export const getCarById = async (req, res, next) => {
  try {
    const car = await carService.getCarById(req.params.id);
    
    res.status(200).json({
      success: true,
      data: car,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Handle creating a new car listing (Admin only)
 */
export const createCar = async (req, res, next) => {
  try {
    const carData = { ...req.body };
    
    // Process multiple uploaded files via AWS S3
    if (req.files && req.files.length > 0) {
      const imageUrls = await uploadMultipleToS3(req.files);
      carData.images = imageUrls;
    } else {
      carData.images = [];
    }

    const car = await carService.createCar(carData);
    
    res.status(201).json({
      success: true,
      message: 'Car created successfully',
      data: car,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Handle updating an existing car listing (Admin only)
 */
export const updateCar = async (req, res, next) => {
  try {
    const carData = { ...req.body };

    // Process multiple uploaded files via AWS S3 if provided
    if (req.files && req.files.length > 0) {
      const imageUrls = await uploadMultipleToS3(req.files);
      carData.images = imageUrls;
    }

    const car = await carService.updateCar(req.params.id, carData);
    
    res.status(200).json({
      success: true,
      message: 'Car updated successfully',
      data: car,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Handle deleting a car listing (Admin only)
 */
export const deleteCar = async (req, res, next) => {
  try {
    await carService.deleteCar(req.params.id);
    
    res.status(200).json({
      success: true,
      message: 'Car deleted successfully',
      data: null,
    });
  } catch (error) {
    next(error);
  }
};
