# CoffeeShop

Ứng dụng quản lý quán cà phê được xây dựng bằng Expo, React Native và Expo Router. Dự án hiện tập trung vào phần frontend/mock UI cho màn hình quản trị, dựa trên thiết kế mobile của The Coffee House.

## Tính năng hiện có

- Đăng nhập demo cho admin.
- Trang tổng quan với thống kê đơn hàng và biểu đồ món bán chạy.
- Danh sách sản phẩm theo danh mục.
- Màn hình quản lý mã QR theo bàn.
- Màn hình quản lý nhân viên.
- Màn hình phân quyền truy cập theo vai trò.
- Màn hình menu "Khác" để điều hướng tới các chức năng quản trị.

## Công nghệ

- Expo SDK 56
- React 19
- React Native 0.85
- Expo Router
- TypeScript
- ESLint Expo config

Theo tài liệu Expo SDK 56, môi trường khuyến nghị là Node.js 22.13.x trở lên.

## Yêu cầu cài đặt

Trước khi chạy dự án, cần cài:

- Node.js 22.13.x hoặc mới hơn
- npm
- Expo Go trên điện thoại nếu muốn test bằng thiết bị thật

Kiểm tra phiên bản Node:

```bash
node -v
```

## Cài đặt dự án

Clone repository:

```bash
git clone https://github.com/tkien2903/CoffeeShop.git
cd CoffeeShop
```

Cài dependencies:

```bash
npm install
```

## Chạy ứng dụng

Chạy Expo development server:

```bash
npm start
```

Sau đó có thể:

- Quét QR bằng Expo Go để chạy trên điện thoại.
- Nhấn `a` trong terminal để mở Android emulator.
- Nhấn `i` trong terminal để mở iOS simulator nếu dùng macOS.
- Nhấn `w` trong terminal để chạy bản web.

Chạy trực tiếp web:

```bash
npm run web
```

Chạy Android:

```bash
npm run android
```

Chạy iOS:

```bash
npm run ios
```

## Tài khoản demo

```text
Username: admin
Password: 123456
```

## Kiểm tra code

Kiểm tra TypeScript:

```bash
npx tsc --noEmit
```

Chạy lint:

```bash
npm run lint
```

## Cấu trúc thư mục chính

```text
assets/
  images/                 Hình ảnh, logo, icon dùng trong app

src/
  app/                    Các màn hình theo Expo Router
    index.tsx             Màn hình đăng nhập
    admin.tsx             Trang tổng quan admin
    products.tsx          Trang sản phẩm
    more.tsx              Menu chức năng khác
    qr.tsx                Quản lý mã QR theo bàn
    employees.tsx         Quản lý nhân viên
    roles.tsx             Phân quyền truy cập

  components/
    coffee-ui.tsx         Component UI dùng chung cho giao diện coffee shop

  hooks/                  Custom hooks
  constants/              Theme và hằng số giao diện
```

## Ghi chú phát triển

- Dữ liệu hiện tại là dữ liệu mock để dựng giao diện trước.
- Chưa kết nối backend/API.
- Khi thêm package Expo SDK, nên dùng:

```bash
npx expo install <package-name>
```

- Không commit `node_modules/`.
- Không đưa mật khẩu thật, API key hoặc file cấu hình nhạy cảm lên GitHub.

## Nguồn tài liệu

- Expo SDK 56: https://docs.expo.dev/versions/v56.0.0/
- Expo Router: https://docs.expo.dev/router/introduction/
