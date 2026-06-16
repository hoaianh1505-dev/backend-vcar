import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import router from './routes/index.js';
import { errorHandler } from './middlewares/error.middleware.js';
import { setupSwagger } from './docs/swagger.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Setup EJS view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Global Middlewares
app.use(cors());
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static frontend files
app.use(express.static('public'));

// Setup Swagger API Documentation
setupSwagger(app);

// Mount API routes (supports both base routes and /api/ prefixes for mobile FE)
app.use('/', router);
app.use('/api', router);

// Handle unknown routes
app.use('*', (req, res) => {
  res.status(404).json({ success: false, message: 'Resource not found' });
});

// Global Error Handler
app.use(errorHandler);

export default app;
