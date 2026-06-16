import fs from 'fs';
import path from 'path';
import multer from 'multer';
import { AppError } from './error.middleware.js';

const uploadDir = 'public/uploads';

// Ensure local upload directory exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Setup multer disk storage to save files directly in the public/uploads folder
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const fileExtension = path.extname(file.originalname);
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `car-${uniqueSuffix}${fileExtension}`);
  }
});

// File type filter - only allow image formats
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new AppError('Invalid file type. Only images (jpeg, png, webp, etc.) are allowed!', 400), false);
  }
};

// Initialize multer
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // Limit each file to 5MB max
  },
});

// Middleware to upload up to 5 images under the field name 'images'
export const uploadCarImages = upload.array('images', 5);
