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
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    fs.writeFileSync(filepath, buffer);
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

    console.log('Seeding admin and multiple test users...');
    const adminUser = await User.create({
      fullName: 'V-Car Admin',
      email: 'admin',
      phone: '0912345678',
      password: '123456',
      role: 'admin',
    });

    const standardUser1 = await User.create({
      fullName: 'Nguyễn Văn A',
      email: 'john@gmail.com',
      phone: '0987654321',
      password: 'password123',
      role: 'user',
    });

    const standardUser2 = await User.create({
      fullName: 'Trần Thị B',
      email: 'user2@gmail.com',
      phone: '0911223344',
      password: 'password123',
      role: 'user',
    });

    const standardUser3 = await User.create({
      fullName: 'Phạm Minh C',
      email: 'user3@gmail.com',
      phone: '0988776655',
      password: 'password123',
      role: 'user',
    });

    const standardUser4 = await User.create({
      fullName: 'Lê Hoàng D',
      email: 'user4@gmail.com',
      phone: '0933445566',
      password: 'password123',
      role: 'user',
    });

    const standardUser5 = await User.create({
      fullName: 'Vũ Thị E',
      email: 'user5@gmail.com',
      phone: '0944556677',
      password: 'password123',
      role: 'user',
    });

    const standardUser6 = await User.create({
      fullName: 'Hoàng Văn F',
      email: 'user6@gmail.com',
      phone: '0955667788',
      password: 'password123',
      role: 'user',
    });

    const standardUser7 = await User.create({
      fullName: 'Đỗ Minh G',
      email: 'user7@gmail.com',
      phone: '0966778899',
      password: 'password123',
      role: 'user',
    });

    console.log('Downloading sample images in parallel...');
    const downloadPromises = [
      downloadCarImage('https://images.unsplash.com/photo-1619767886558-efdc259cde1a?q=80&w=600&auto=format&fit=crop', 'car-tesla.jpg'),
      downloadCarImage('https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?q=80&w=600&auto=format&fit=crop', 'car-honda.jpg'),
      downloadCarImage('https://images.unsplash.com/photo-1584345604476-8ec5e12e42dd?q=80&w=600&auto=format&fit=crop', 'car-ford.jpg'),
      downloadCarImage('https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?q=80&w=600&auto=format&fit=crop', 'car-mercedes.jpg'),
      downloadCarImage('https://images.unsplash.com/photo-1563720223185-11003d516935?q=80&w=600&auto=format&fit=crop', 'car-vinfast.jpg'),
      downloadCarImage('https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?q=80&w=600&auto=format&fit=crop', 'car-porsche.jpg'),
      downloadCarImage('https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?q=80&w=600&auto=format&fit=crop', 'car-toyota.jpg'),
      downloadCarImage('https://images.unsplash.com/photo-1606016159991-dfe4f2746ad5?q=80&w=600&auto=format&fit=crop', 'car-audi.jpg'),
      downloadCarImage('https://images.unsplash.com/photo-1555215695-3004980ad54e?q=80&w=600&auto=format&fit=crop', 'car-bmw.jpg'),
      downloadCarImage('https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=600&auto=format&fit=crop', 'car-carnival.jpg'),
      downloadCarImage('https://images.unsplash.com/photo-1532581291347-9c39cf10a73c?q=80&w=600&auto=format&fit=crop', 'car-mazda.jpg'),
      downloadCarImage('https://images.unsplash.com/photo-1549399542-7e3f8b79c341?q=80&w=600&auto=format&fit=crop', 'car-xpander.jpg'),
      downloadCarImage('https://images.unsplash.com/photo-1508974239320-0a029497e820?q=80&w=600&auto=format&fit=crop', 'car-rangerover.jpg'),
      downloadCarImage('https://images.unsplash.com/photo-1511919884226-fd3cad34687c?q=80&w=600&auto=format&fit=crop', 'car-lexus.jpg'),
      downloadCarImage('https://images.unsplash.com/photo-1552519507-da3b142c6e3d?q=80&w=600&auto=format&fit=crop', 'car-camaro.jpg'),
      
      // Additional car images
      downloadCarImage('https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=600&auto=format&fit=crop', 'car-vf9.jpg'),
      downloadCarImage('https://images.unsplash.com/photo-1553440569-bcc63803a83d?q=80&w=600&auto=format&fit=crop', 'car-rangerwildtrak.jpg'),
      downloadCarImage('https://images.unsplash.com/photo-1617531653332-bd46c24f2068?q=80&w=600&auto=format&fit=crop', 'car-s450.jpg'),
      downloadCarImage('https://images.unsplash.com/photo-1502877338535-766e1452684a?q=80&w=600&auto=format&fit=crop', 'car-camry.jpg'),
      downloadCarImage('https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?q=80&w=600&auto=format&fit=crop', 'car-crv.jpg'),
      downloadCarImage('https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?q=80&w=600&auto=format&fit=crop', 'car-santafe.jpg'),
      downloadCarImage('https://images.unsplash.com/photo-1616422285623-13ff0162193c?q=80&w=600&auto=format&fit=crop', 'car-tucson.jpg'),
      downloadCarImage('https://images.unsplash.com/photo-1549399542-7e3f8b79c341?q=80&w=600&auto=format&fit=crop', 'car-sorento.jpg'),
      downloadCarImage('https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?q=80&w=600&auto=format&fit=crop', 'car-cx5.jpg'),
      downloadCarImage('https://images.unsplash.com/photo-1609521263047-f8f205293f24?q=80&w=600&auto=format&fit=crop', 'car-accent.jpg'),
      downloadCarImage('https://images.unsplash.com/photo-1590362891991-f776e747a588?q=80&w=600&auto=format&fit=crop', 'car-vios.jpg'),
      downloadCarImage('https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?q=80&w=600&auto=format&fit=crop', 'car-everest.jpg'),
      downloadCarImage('https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=600&auto=format&fit=crop', 'car-macan.jpg'),
      downloadCarImage('https://images.unsplash.com/photo-1551524559-8af4e6624178?q=80&w=600&auto=format&fit=crop', 'car-cooper.jpg'),
      downloadCarImage('https://images.unsplash.com/photo-1619767886558-efdc259cde1a?q=80&w=600&auto=format&fit=crop', 'car-modely.jpg')
    ];

    const [
      teslaImg, hondaImg, fordImg, mercedesImg, vinfastImg,
      porscheImg, toyotaImg, audiImg, bmwImg, carnivalImg,
      mazdaImg, xpanderImg, rangeroverImg, lexusImg, camaroImg,
      vf9Img, rangerWildtrakImg, s450Img, camryImg, crvImg,
      santafeImg, tucsonImg, sorentoImg, cx5Img, accentImg,
      viosImg, everestImg, macanImg, cooperImg, modelyImg
    ] = await Promise.all(downloadPromises);

    console.log('Sample images downloaded.');

    console.log('Seeding initial car inventory (30 cars)...');
    const cars = await Car.insertMany([
      {
        name: 'Model 3',
        brand: 'Tesla',
        year: 2023,
        pricePerDay: 85,
        description: 'Xe điện cao cấp hoàn hảo. Tích hợp lái tự động Autopilot, trần kính panorama sang trọng, tăng tốc ấn tượng.',
        location: 'Hà Nội',
        images: [teslaImg],
        available: true,
      },
      {
        name: 'Civic RS',
        brand: 'Honda',
        year: 2022,
        pricePerDay: 50,
        description: 'Sedan thể thao với gói an toàn Honda Sensing, ghế da cao cấp, động cơ tăng áp 1.5L vận hành phấn khích.',
        location: 'Đà Nẵng',
        images: [hondaImg],
        available: true,
      },
      {
        name: 'Mustang GT Convertible',
        brand: 'Ford',
        year: 2021,
        pricePerDay: 120,
        description: 'Xe thể thao mui trần động cơ V8 mạnh mẽ. Ngoại hình cơ bắp, nội thất thể thao bọc da sang trọng.',
        location: 'Hồ Chí Minh',
        images: [fordImg],
        available: true,
      },
      {
        name: 'C200 Avantgarde',
        brand: 'Mercedes-Benz',
        year: 2022,
        pricePerDay: 150,
        description: 'Sedan hạng sang từ Đức. Trang bị đèn viền nội thất 64 màu, hệ thống lọc không khí và hỗ trợ phanh chủ động.',
        location: 'Hà Nội',
        images: [mercedesImg],
        available: true,
      },
      {
        name: 'VF 8 Plus',
        brand: 'VinFast',
        year: 2023,
        pricePerDay: 80,
        description: 'SUV điện thông minh thương hiệu Việt. Hỗ trợ trợ lý ảo tiếng Việt, hệ thống lái thông minh ADAS cấp độ 2.',
        location: 'Hải Phòng',
        images: [vinfastImg],
        available: true,
      },
      {
        name: '911 Carrera S',
        brand: 'Porsche',
        year: 2021,
        pricePerDay: 350,
        description: 'Biểu tượng xe thể thao toàn cầu. Động cơ tăng áp kép flat-six mạnh mẽ, hộp số PDK 8 cấp cực kỳ mượt mà.',
        location: 'Hồ Chí Minh',
        images: [porscheImg],
        available: true,
      },
      {
        name: 'Fortuner Legender',
        brand: 'Toyota',
        year: 2020,
        pricePerDay: 65,
        description: 'SUV 7 chỗ máy dầu bền bỉ. Dẫn động 2 cầu vượt địa hình mạnh mẽ, cabin rộng rãi phù hợp gia đình dã ngoại.',
        location: 'Đà Nẵng',
        images: [toyotaImg],
        available: true,
      },
      {
        name: 'A6 Luxury',
        brand: 'Audi',
        year: 2022,
        pricePerDay: 180,
        description: 'Sedan cao cấp với hệ thống buồng lái ảo Virtual Cockpit, dẫn động Quattro danh tiếng và đèn Matrix LED.',
        location: 'Hà Nội',
        images: [audiImg],
        available: true,
      },
      {
        name: '530i M-Sport',
        brand: 'BMW',
        year: 2022,
        pricePerDay: 195,
        description: 'Mẫu sedan thể thao cỡ trung mang lại cảm giác lái chân thật nhất. Gói nội ngoại thất thể thao M-Sport cao cấp.',
        location: 'Hồ Chí Minh',
        images: [bmwImg],
        available: true,
      },
      {
        name: 'Carnival Signature',
        brand: 'Kia',
        year: 2023,
        pricePerDay: 95,
        description: 'Mẫu MPV đô thị cỡ lớn đẳng cấp thương gia. Hàng ghế thứ 2 có sưởi, làm mát, ngả lưng chỉnh điện tối đa.',
        location: 'Hà Nội',
        images: [carnivalImg],
        available: true,
      },
      {
        name: 'Mazda 3 Premium',
        brand: 'Mazda',
        year: 2021,
        pricePerDay: 45,
        description: 'Thiết kế Kodo sang trọng tinh tế, động cơ SkyActiv tiết kiệm nhiên liệu tối ưu và hệ thống loa cao cấp.',
        location: 'Cần Thơ',
        images: [mazdaImg],
        available: true,
      },
      {
        name: 'Xpander Cross',
        brand: 'Mitsubishi',
        year: 2022,
        pricePerDay: 40,
        description: 'Mẫu MPV 7 chỗ gầm cao bán chạy nhất Việt Nam. Tiết kiệm nhiên liệu vượt trội, nội thất thực dụng, linh hoạt.',
        location: 'Nha Trang',
        images: [xpanderImg],
        available: true,
      },
      {
        name: 'Range Rover Vogue',
        brand: 'Land Rover',
        year: 2020,
        pricePerDay: 420,
        description: 'Ông vua của dòng SUV hạng sang. Sự kết hợp hoàn hảo giữa khả năng off-road phi thường và khoang cabin siêu VIP.',
        location: 'Hồ Chí Minh',
        images: [rangeroverImg],
        available: true,
      },
      {
        name: 'RX 350 Luxury',
        brand: 'Lexus',
        year: 2022,
        pricePerDay: 260,
        description: 'Mẫu crossover sang trọng 5 chỗ êm ái hàng đầu. Nội thất ốp gỗ cao cấp, da semi-aniline mịn màng.',
        location: 'Hà Nội',
        images: [lexusImg],
        available: true,
      },
      {
        name: 'Camaro RS Coupe',
        brand: 'Chevrolet',
        year: 2020,
        pricePerDay: 135,
        description: 'Dòng xe cơ bắp Mỹ đậm chất cá tính. Động cơ turbo mạnh mẽ, mâm thể thao 20 inch tạo dấu ấn khác biệt.',
        location: 'Đà Lạt',
        images: [camaroImg],
        available: true,
      },
      {
        name: 'VF 9 Plus',
        brand: 'VinFast',
        year: 2023,
        pricePerDay: 125,
        description: 'SUV điện full-size cao cấp nhất của VinFast. Ghế cơ trưởng massage nóng lạnh, sạc không dây hàng ghế sau, cửa hít.',
        location: 'Hà Nội',
        images: [vf9Img],
        available: true,
      },
      {
        name: 'Ranger Wildtrak 2.0L',
        brand: 'Ford',
        year: 2022,
        pricePerDay: 75,
        description: 'Vua bán tải đa dụng tại Việt Nam. Động cơ Bi-Turbo 2.0L mạnh mẽ, hộp số tự động 10 cấp, nhiều công nghệ hỗ trợ lái.',
        location: 'Quy Nhơn',
        images: [rangerWildtrakImg],
        available: true,
      },
      {
        name: 'S450 Luxury',
        brand: 'Mercedes-Benz',
        year: 2023,
        pricePerDay: 450,
        description: 'Sedan đầu bảng danh tiếng. Hệ thống treo khí nén êm ái tuyệt đối, hệ thống loa Burmester đỉnh cao và khoang sau chuẩn thương gia.',
        location: 'Hồ Chí Minh',
        images: [s450Img],
        available: true,
      },
      {
        name: 'Camry 2.5Q',
        brand: 'Toyota',
        year: 2022,
        pricePerDay: 70,
        description: 'Biểu tượng của sự thành đạt. Bản cao cấp nhất trang bị cửa sổ trời, màn hình HUD phản kính, hệ thống an toàn Toyota Safety Sense.',
        location: 'Vũng Tàu',
        images: [camryImg],
        available: true,
      },
      {
        name: 'CR-V L-Sensing',
        brand: 'Honda',
        year: 2022,
        pricePerDay: 60,
        description: 'SUV 7 chỗ rộng rãi, bền bỉ và tiết kiệm. Trang bị an toàn Honda Sensing, cửa sổ trời toàn cảnh, cốp điện rảnh tay.',
        location: 'Nha Trang',
        images: [crvImg],
        available: true,
      },
      {
        name: 'Santa Fe Premium',
        brand: 'Hyundai',
        year: 2022,
        pricePerDay: 80,
        description: 'SUV Hàn Quốc ngập tràn option. Động cơ dầu Smartstream 2.2D êm ái, màn hình trung tâm 10.25 inch, sưởi và làm mát ghế.',
        location: 'Đà Nẵng',
        images: [santafeImg],
        available: true,
      },
      {
        name: 'Tucson 1.6T Turbo',
        brand: 'Hyundai',
        year: 2023,
        pricePerDay: 55,
        description: 'Ngoại hình tương lai, phá cách. Động cơ tăng áp mạnh mẽ kết hợp cùng hộp số ly hợp kép 7 cấp lái cực bốc.',
        location: 'Cần Thơ',
        images: [tucsonImg],
        available: true,
      },
      {
        name: 'Sorento Signature',
        brand: 'Kia',
        year: 2022,
        pricePerDay: 78,
        description: 'SUV 7 chỗ thời thượng châu Âu. Màn hình đa thông tin và giải trí nối liền 12.3 inch, phanh tay điện tử hiện đại.',
        location: 'Phú Quốc',
        images: [sorentoImg],
        available: true,
      },
      {
        name: 'CX-5 2.5L Signature',
        brand: 'Mazda',
        year: 2022,
        pricePerDay: 50,
        description: 'Mẫu Crossover 5 chỗ bán chạy nhất phân khúc. Thiết kế sang trọng tinh tế, loa Bose cao cấp mang lại trải nghiệm âm thanh cực hay.',
        location: 'Đà Lạt',
        images: [cx5Img],
        available: true,
      },
      {
        name: 'Accent 1.4AT Đặc biệt',
        brand: 'Hyundai',
        year: 2021,
        pricePerDay: 35,
        description: 'Sedan hạng B cực kỳ tiết kiệm nhiên liệu, phù hợp di chuyển linh hoạt trong phố. Hỗ trợ khởi động từ xa tiện lợi.',
        location: 'Hồ Chí Minh',
        images: [accentImg],
        available: true,
      },
      {
        name: 'Vios 1.5G CVT',
        brand: 'Toyota',
        year: 2022,
        pricePerDay: 35,
        description: 'Mẫu xe quốc dân siêu bền bỉ, tiết kiệm nhiên liệu tối ưu. Khoang ngồi rộng rãi thoải mái lý tưởng cho gia đình nhỏ.',
        location: 'Đà Nẵng',
        images: [viosImg],
        available: true,
      },
      {
        name: 'Everest Titanium 4x4',
        brand: 'Ford',
        year: 2023,
        pricePerDay: 90,
        description: 'SUV việt dã đỉnh cao động cơ Bi-Turbo. Hộp số 10 cấp, dẫn động 2 cầu chủ động kết hợp camera 360 toàn cảnh sắc nét.',
        location: 'Hà Nội',
        images: [everestImg],
        available: true,
      },
      {
        name: 'Macan GTS',
        brand: 'Porsche',
        year: 2022,
        pricePerDay: 380,
        description: 'SUV thể thao xa xỉ mang DNA của dòng 911 huyền thoại. Âm thanh ống xả thể thao gầm rú phấn khích, tăng tốc 0-100km/h chỉ 4.3s.',
        location: 'Hồ Chí Minh',
        images: [macanImg],
        available: true,
      },
      {
        name: 'Cooper S 5-Door',
        brand: 'MINI',
        year: 2022,
        pricePerDay: 130,
        description: 'Xe nhỏ xinh thời trang mang phong cách Anh Quốc cổ điển sang trọng. Cảm giác lái như go-kart cực kỳ nhạy bén.',
        location: 'Hà Nội',
        images: [cooperImg],
        available: true,
      },
      {
        name: 'Model Y Long Range',
        brand: 'Tesla',
        year: 2023,
        pricePerDay: 110,
        description: 'Crossover điện bán chạy nhất thế giới. Quãng đường di chuyển ấn tượng, khoang hành lý siêu rộng thích hợp đi cắm trại.',
        location: 'Đà Nẵng',
        images: [modelyImg],
        available: true,
      }
    ]);

    console.log('Seeding booking requests (15 bookings)...');
    
    // Booking 1: Pending (Nguyễn Văn A đặt Tesla Model 3)
    await Booking.create({
      userId: standardUser1._id,
      carId: cars[0]._id,
      rentalDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      status: 'pending',
    });

    // Booking 2: Approved (Nguyễn Văn A đặt Honda Civic RS)
    await Booking.create({
      userId: standardUser1._id,
      carId: cars[1]._id,
      rentalDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      status: 'approved',
    });
    await Car.findByIdAndUpdate(cars[1]._id, { available: false });

    // Booking 3: Pending (Trần Thị B đặt Mercedes C200)
    await Booking.create({
      userId: standardUser2._id,
      carId: cars[3]._id,
      rentalDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      status: 'pending',
    });

    // Booking 4: Pending (Phạm Minh C đặt Porsche 911)
    await Booking.create({
      userId: standardUser3._id,
      carId: cars[5]._id,
      rentalDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
      status: 'pending',
    });

    // Booking 5: Approved (Trần Thị B đặt Carnival)
    await Booking.create({
      userId: standardUser2._id,
      carId: cars[9]._id,
      rentalDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
      status: 'approved',
    });
    await Car.findByIdAndUpdate(cars[9]._id, { available: false });

    // Booking 6: Cancelled (Phạm Minh C đặt VinFast VF8)
    await Booking.create({
      userId: standardUser3._id,
      carId: cars[4]._id,
      rentalDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // In the past
      status: 'cancelled',
    });

    // Booking 7: Approved (Lê Hoàng D đặt Toyota Fortuner)
    await Booking.create({
      userId: standardUser4._id,
      carId: cars[6]._id,
      rentalDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      status: 'approved',
    });
    await Car.findByIdAndUpdate(cars[6]._id, { available: false });

    // Booking 8: Pending (Vũ Thị E đặt VinFast VF 9)
    await Booking.create({
      userId: standardUser5._id,
      carId: cars[15]._id,
      rentalDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      status: 'pending',
    });

    // Booking 9: Pending (Hoàng Văn F đặt Ford Ranger Wildtrak)
    await Booking.create({
      userId: standardUser6._id,
      carId: cars[16]._id,
      rentalDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
      status: 'pending',
    });

    // Booking 10: Approved (Đỗ Minh G đặt Mercedes S450)
    await Booking.create({
      userId: standardUser7._id,
      carId: cars[17]._id,
      rentalDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      status: 'approved',
    });
    await Car.findByIdAndUpdate(cars[17]._id, { available: false });

    // Booking 11: Cancelled (Nguyễn Văn A đặt Toyota Camry)
    await Booking.create({
      userId: standardUser1._id,
      carId: cars[18]._id,
      rentalDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      status: 'cancelled',
    });

    // Booking 12: Pending (Trần Thị B đặt Honda CR-V)
    await Booking.create({
      userId: standardUser2._id,
      carId: cars[19]._id,
      rentalDate: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000),
      status: 'pending',
    });

    // Booking 13: Approved (Phạm Minh C đặt Hyundai Santa Fe)
    await Booking.create({
      userId: standardUser3._id,
      carId: cars[20]._id,
      rentalDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
      status: 'approved',
    });
    await Car.findByIdAndUpdate(cars[20]._id, { available: false });

    // Booking 14: Pending (Lê Hoàng D đặt Porsche Macan GTS)
    await Booking.create({
      userId: standardUser4._id,
      carId: cars[27]._id,
      rentalDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      status: 'pending',
    });

    // Booking 15: Approved (Vũ Thị E đặt Tesla Model Y)
    await Booking.create({
      userId: standardUser5._id,
      carId: cars[29]._id,
      rentalDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      status: 'approved',
    });
    await Car.findByIdAndUpdate(cars[29]._id, { available: false });

    console.log('✅ Database and local assets seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeder execution failed:', error.message);
    process.exit(1);
  }
};

seedData();
