# Car Rental Backend REST API MVP

A robust, production-ready REST API built with Node.js, Express, and MongoDB for a Car Rental application MVP.

## Tech Stack
- **Runtime**: Node.js (v18+)
- **Framework**: Express.js
- **Database**: MongoDB & Mongoose ODM
- **Authentication**: JWT & Bcryptjs
- **File Uploads**: Multer & AWS S3 (@aws-sdk/client-s3)
- **API Documentation**: Swagger (swagger-ui-express & swagger-jsdoc)
- **Validation**: express-validator

## Project Setup

1. **Clone & Install Dependencies**
   ```bash
   npm install
   ```

2. **Configure Environment Variables**
   Create a `.env` file from the `.env.example` template:
   ```bash
   cp .env.example .env
   ```
   Fill in your actual MongoDB URI and AWS S3 credentials.

3. **Run the Application**
   - Development mode (with nodemon auto-restart):
     ```bash
     npm run dev
     ```
   - Production mode:
     ```bash
     npm start
     ```

## API Documentation
Once the server is running, you can access the interactive Swagger API documentation at:
`http://localhost:5000/api-docs`

## Postman Collection
Import the `CarRentalMVP.postman_collection.json` file at the root of the project into Postman to test all endpoints.
