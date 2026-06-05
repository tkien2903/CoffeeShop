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

- `POST /api/admin/login`
- `GET /api/mon-an`
- `GET /api/ban-an`
- `GET /api/chi-tiet-don`

Các màn quản lý nhân viên, phân quyền, kho, báo cáo chi tiết vẫn cần bổ sung API backend tương ứng để chuyển hoàn toàn từ mock sang dữ liệu động.

## Ghi Chú

- `website-source/` là thư mục source gốc được copy vào để tham chiếu, không commit lên GitHub.
- `customer-web` chưa nằm trong scope hiện tại.
- Không commit `node_modules/`, build output, file `.env`, mật khẩu thật hoặc API key.
