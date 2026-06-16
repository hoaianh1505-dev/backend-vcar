# Car Rental Backend REST API MVP

Dự án Backend cung cấp REST API và trang quản trị SSR (Server-Side Rendered) cho ứng dụng cho thuê xe tự lái (MVP) viết bằng Kotlin.

---

## 🚀 Môi trường & Link Deploy
* **Local Server**: `http://localhost:5000` (hoặc `http://localhost:5000/api`)
* **Production Server (Render)**: `https://backend-vcar.onrender.com` (hoặc `https://backend-vcar.onrender.com/api`)
* **Swagger API Docs**: `https://backend-vcar.onrender.com/api-docs` (hoặc chạy local: `/api-docs`)
* **Admin Dashboard EJS (SSR)**: `https://backend-vcar.onrender.com/login` (Tài khoản mặc định: `admin` / `123456`)

---

## 📌 Các đầu mạng API & Cấu trúc Phản hồi (JSON Response)

> [!TIP]
> Tất cả các API bên dưới đều hỗ trợ tiền tố `/api` (ví dụ: `/cars` có thể gọi qua `/api/cars` từ ứng dụng di động Kotlin của bạn).
> Các API yêu cầu xác thực cần đính kèm Header: `Authorization: Bearer <JWT_TOKEN>`.

### 1. Nhóm Xác thực & Người dùng (Authentication)

#### 🔸 Đăng ký tài khoản mới (`POST /api/auth/register`)
* **Body (JSON)**:
  ```json
  {
    "fullName": "Do Hoai Anh",
    "email": "user@gmail.com",
    "phone": "0987654321",
    "password": "password123",
    "role": "user" // Hoặc "admin"
  }
  ```
* **Response (201 Created)**:
  ```json
  {
    "success": true,
    "message": "User registered successfully",
    "data": {
      "_id": "60d21b4667d0d8992e610c85",
      "fullName": "Do Hoai Anh",
      "email": "user@gmail.com",
      "phone": "0987654321",
      "role": "user"
    }
  }
  ```

#### 🔸 Đăng nhập (`POST /api/auth/login`)
* **Body (JSON)**:
  ```json
  {
    "email": "user@gmail.com", // Hoặc "admin" (đăng nhập bằng username của admin)
    "password": "password123"
  }
  ```
* **Response (200 OK)**:
  ```json
  {
    "success": true,
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "60d21b4667d0d8992e610c85",
      "fullName": "Do Hoai Anh",
      "email": "user@gmail.com",
      "role": "user"
    }
  }
  ```

#### 🔸 Lấy thông tin cá nhân (`GET /api/auth/profile`)
* **Headers**: `Authorization: Bearer <JWT_TOKEN>`
* **Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "_id": "60d21b4667d0d8992e610c85",
      "fullName": "Do Hoai Anh",
      "email": "user@gmail.com",
      "phone": "0987654321",
      "role": "user"
    }
  }
  ```

---

### 2. Nhóm Quản lý Danh sách Xe (Cars)

#### 🔸 Lấy danh sách xe (`GET /api/cars`)
* **Query Params (Tùy chọn)**: `?available=true` (Lọc các xe đang sẵn sàng cho thuê)
* **Response (200 OK)**:
  ```json
  {
    "success": true,
    "count": 30,
    "data": [
      {
        "_id": "60d21b4667d0d8992e610c90",
        "name": "Model 3",
        "brand": "Tesla",
        "year": 2023,
        "pricePerDay": 85,
        "description": "Xe điện cao cấp hoàn hảo. Tích hợp lái tự động Autopilot...",
        "location": "Hồ Chí Minh",
        "images": ["/uploads/car-tesla.jpg"],
        "available": true
      }
    ]
  }
  ```

#### 🔸 Lấy thông tin chi tiết một xe (`GET /api/cars/:id`)
* **Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "_id": "60d21b4667d0d8992e610c90",
      "name": "Model 3",
      "brand": "Tesla",
      "year": 2023,
      "pricePerDay": 85,
      "description": "Xe điện cao cấp hoàn hảo. Tích hợp lái tự động Autopilot...",
      "location": "Hồ Chí Minh",
      "images": ["/uploads/car-tesla.jpg"],
      "available": true
    }
  }
  ```

#### 🔸 Thêm xe mới - Admin (`POST /api/cars`)
* **Headers**: `Authorization: Bearer <JWT_TOKEN>` (Admin token)
* **Request (Multipart/Form-Data)**:
  * `name`: String
  * `brand`: String
  * `year`: Number
  * `pricePerDay`: Number
  * `description`: String
  * `location`: String
  * `images`: Files (Tối đa 5 ảnh)
* **Response (201 Created)**:
  ```json
  {
    "success": true,
    "message": "Car created successfully",
    "data": {
      "_id": "60d21b4667d0d8992e610c99",
      "name": "Civic RS",
      "brand": "Honda",
      "images": ["/uploads/image-1782672.jpg"],
      "available": true
    }
  }
  ```

#### 🔸 Sửa thông tin xe - Admin (`PUT /api/cars/:id`)
* **Request (Multipart/Form-Data)**: Các trường tương tự như tạo xe.
* **Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Car updated successfully",
    "data": { ... }
  }
  ```

#### 🔸 Xóa xe - Admin (`DELETE /api/cars/:id`)
* **Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Car deleted successfully",
    "data": null
  }
  ```

---

### 3. Nhóm Quản lý Đặt xe (Bookings)

#### 🔸 Gửi yêu cầu thuê xe (`POST /api/bookings`)
* **Headers**: `Authorization: Bearer <JWT_TOKEN>`
* **Body (JSON)**:
  ```json
  {
    "carId": "60d21b4667d0d8992e610c90",
    "rentalDate": "2026-06-20T09:00:00.000Z"
  }
  ```
* **Response (201 Created)**:
  ```json
  {
    "success": true,
    "data": {
      "_id": "60d21b4667d0d8992e610d00",
      "userId": "60d21b4667d0d8992e610c85",
      "carId": "60d21b4667d0d8992e610c90",
      "rentalDate": "2026-06-20T09:00:00.000Z",
      "status": "pending"
    }
  }
  ```

#### 🔸 Xem lịch sử thuê xe của tôi (`GET /api/bookings/my`)
* **Headers**: `Authorization: Bearer <JWT_TOKEN>`
* **Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": [
      {
        "_id": "60d21b4667d0d8992e610d00",
        "carId": {
          "_id": "60d21b4667d0d8992e610c90",
          "name": "Model 3",
          "brand": "Tesla"
        },
        "rentalDate": "2026-06-20T09:00:00.000Z",
        "status": "pending"
      }
    ]
  }
  ```

---

### 4. Nhóm Quản trị Đơn hàng - Admin (`/api/admin`)

#### 🔸 Lấy toàn bộ danh sách đơn đặt xe (`GET /api/admin/bookings`)
* **Headers**: `Authorization: Bearer <JWT_TOKEN>` (Admin token)
* **Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": [
      {
        "_id": "60d21b4667d0d8992e610d00",
        "userId": {
          "fullName": "Nguyễn Văn A",
          "email": "john@gmail.com"
        },
        "carId": {
          "name": "Model 3",
          "brand": "Tesla"
        },
        "rentalDate": "2026-06-20T09:00:00.000Z",
        "status": "pending"
      }
    ]
  }
  ```

#### 🔸 Phê duyệt đơn hàng (`PATCH /api/admin/bookings/:id/approve`)
* **Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Booking approved successfully",
    "data": {
      "_id": "60d21b4667d0d8992e610d00",
      "status": "approved"
    }
  }
  ```

#### 🔸 Từ chối/Hủy đơn hàng (`PATCH /api/admin/bookings/:id/cancel`)
* **Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Booking cancelled successfully",
    "data": {
      "_id": "60d21b4667d0d8992e610d00",
      "status": "cancelled"
    }
  }
  ```

---

## 🛠️ Hướng dẫn Chạy & Seed lại Dữ liệu Local
1. **Cài đặt thư viện**: `npm install`
2. **Khởi chạy môi trường Dev**: `npm run dev`
3. **Nạp lại dữ liệu gốc (30 xe ở HCM, 15 bookings)**:
   ```bash
   npm run seed
   ```
