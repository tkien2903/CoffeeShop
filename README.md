# CoffeeShop

CoffeeShop là hệ thống quản lý quán cafe, hiện tập trung vào app quản lý nội bộ cho admin/quản lý/nhân viên. Customer web cho khách quét QR gọi món sẽ phát triển sau.

## Cấu Trúc

```text
CoffeeShop/
  backend/      Spring Boot API + MongoDB
  admin-app/    Expo React Native app quản lý nội bộ
```

## Công Nghệ

- Backend: Java 21, Spring Boot 3.5, MongoDB
- Admin app: Expo SDK 56, React 19, React Native 0.85, Expo Router, TypeScript

Theo Expo SDK 56, Node.js nên dùng từ `22.13.x` trở lên.

## Chạy Backend

Backend dùng MongoDB local:

```text
mongodb://localhost:27017/tiemtra
```

Chạy backend:

```powershell
cd backend
.\mvnw.cmd spring-boot:run
```

Backend mặc định chạy tại:

```text
http://localhost:8080
```

Test nhanh:

```powershell
Invoke-WebRequest http://localhost:8080/api/mon-an
```

Database export mẫu nằm ở:

```text
backend/db_tiemtra/db_tiemtra
```

## Chạy Admin App

Cài dependencies:

```powershell
cd admin-app
npm install
```

Chạy Expo:

```powershell
npm start
```

Sau đó:

- Nhấn `a` để mở Android emulator.
- Nhấn `w` để chạy web.
- Quét QR bằng Expo Go nếu chạy trên điện thoại thật.

Nếu chạy trên điện thoại thật, không dùng `localhost`. Đặt API URL bằng IP LAN của máy đang chạy backend:

```powershell
$env:EXPO_PUBLIC_API_BASE_URL="http://<IP-may-tinh>:8080"
npm start
```

Android emulator dùng mặc định:

```text
http://10.0.2.2:8080
```

Web/iOS simulator dùng mặc định:

```text
http://localhost:8080
```

## Tài Khoản Demo

Theo database mẫu:

```text
Username: ghann
Password: 88888
```

Hoặc:

```text
Username: lhao
Password: 12345
```

## Kiểm Tra Code

Frontend:

```powershell
cd admin-app
npx tsc --noEmit
npm run lint
```

Backend:

```powershell
cd backend
.\mvnw.cmd test
```

## API Đang Dùng

- `POST /api/auth/login` (Đăng nhập và xác thực chung cho Admin & Nhân viên)
- `GET /api/mon-an` (Xem danh sách sản phẩm/món ăn)
- `GET /api/ban-an` (Xem danh sách bàn ăn và trạng thái)
- `GET /api/chi-tiet-don` (Xem chi tiết hóa đơn/đơn hàng)
- `GET /api/management/nhan-vien` (Danh sách nhân viên)
- `GET /api/management/phan-quyen` (Danh sách quyền hạn các vai trò)
- `PUT /api/management/phan-quyen` (Cập nhật quyền hạn cho vai trò)
- `GET /api/management/kho` (Theo dõi mức tồn kho nguyên liệu)
- `GET /api/management/bao-cao` (Báo cáo doanh thu chi tiết)

## Các Cập Nhật Mới (08/06/2026)

1. **Đăng nhập & Điều hướng theo vai trò (Role-based Routing)**:
   - Sử dụng API đăng nhập chung `/api/auth/login` cho cả Admin và nhân viên.
   - Định tuyến động dựa trên vai trò người dùng: Admin vào `/admin`, Thu ngân vào `/cashier`, Phục vụ vào `/staff`.
2. **Đăng xuất hoàn chỉnh**:
   - Nút đăng xuất xóa sạch phiên làm việc (`clearCurrentUser()`) và chuyển hướng về màn hình đăng nhập `/` để đăng nhập bằng tài khoản khác.
3. **Màn hình Thu ngân (`/cashier`) & Phục vụ (`/staff`) động**:
   - Hiển thị tên động, ca trực, mã nhân viên động lấy trực tiếp từ MongoDB.
   - Đồng hồ đo thời gian làm việc thực tế (giờ/phút) chạy tăng động trong suốt ca kể từ lúc đăng nhập.
   - Tải sơ đồ bàn ăn và trạng thái phục vụ thời gian thực.
4. **Phân quyền động thời gian thực**:
   - Tích hợp quyền năng tương tác cho màn hình Phân quyền (`/roles`), gửi dữ liệu thay đổi quyền của từng vai trò trực tiếp lên backend.
   - Các màn hình chức năng của nhân viên (như Báo cáo doanh thu, Quản lý kho, Mã QR) tự động khóa (hiển thị khóa 🔒) hoặc ẩn đi nếu Admin tắt quyền tương ứng của vai trò đó.

## Ghi Chú

- `website-source/` là thư mục source gốc được copy vào để tham chiếu, không commit lên GitHub.
- `customer-web` chưa nằm trong scope hiện tại.
- Không commit `node_modules/`, build output, file `.env`, mật khẩu thật hoặc API key.
