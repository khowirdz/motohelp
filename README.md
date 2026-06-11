# MotoCứu — Ứng dụng sửa xe lưu động

## Giới thiệu
Nền tảng kết nối người dùng gặp sự cố xe máy với thợ sửa xe lưu động gần nhất, hỗ trợ theo dõi thời gian thực qua GPS.

## Tech Stack

| Layer       | Công nghệ                                   |
|-------------|---------------------------------------------|
| Mobile      | React Native (Expo SDK 50) + TS             |
| State       | Redux Toolkit                               |
| Navigation  | React Navigation v6                         |
| Maps        | react-native-maps (Google Maps)             |
| Realtime    | Socket.io Client                            |
| HTTP        | Axios + Interceptors                        |
| GPS         | expo-location                               |
| Storage     | @react-native-async-storage/async-storage   |
| Backend*    | Node.js + Express + PostgreSQL              |
| Realtime*   | Socket.io Server                            |
| Push notif* | Expo Notifications / Firebase               |

## Cấu trúc dự án

```
src/
├── screens/
│   ├── auth/           # LoginScreen, OTPScreen
│   ├── user/           # HomeScreen, SOSScreen, TrackingScreen
│   │                   # HistoryScreen, ProfileScreen, ReviewScreen
│   ├── mechanic/       # (TODO) app dành cho thợ
│   └── admin/          # (TODO) quản trị
├── components/
│   ├── common/         # Button, Input, LoadingSpinner...
│   ├── map/            # MapView, Markers, Polyline
│   └── cards/          # MechanicCard, OrderCard
├── navigation/         # Stack + Tab navigators
├── services/
│   ├── api.ts          # Axios client + interceptors
│   ├── authService.ts  # OTP login/logout
│   ├── orderService.ts # CRUD đơn hàng
│   ├── locationService.ts # GPS + Geocoding + Haversine
│   └── socketService.ts   # Realtime tracking
├── store/
│   └── slices/
│       ├── authSlice.ts   # user, otpSent, loading
│       └── orderSlice.ts  # currentOrder, nearbyMechanics, mechanicLocation
├── hooks/
│   ├── useAppSelector.ts  # Typed selector
│   └── useLocation.ts     # GPS hook
├── constants/
│   ├── colors.ts          # Bảng màu
│   └── index.ts           # API URL, ISSUE_TYPES, ORDER_STATUS...
└── types/
    └── index.ts           # User, Order, Mechanic, Location...
```

## Luồng chính (Happy Path)

```
Đăng nhập OTP
    ↓
HomeScreen (nút SOS + thợ gần)
    ↓
SOSScreen (chọn sự cố → chọn thợ)
    ↓
TrackingScreen (bản đồ + ETA realtime)
    ↓
Sửa xong → ReviewScreen (đánh giá + thanh toán)
```

## Khởi chạy dự án (Yêu cầu cài sẵn ứng dụng Expo Go trên điện thoại)

```bash
# 1. Cài đặt toàn bộ dependencies tương thích
npm install

# 2. Khởi động Expo Server
npm start
```

## Cấu hình cần thiết

1. Cấu hình biến môi trường và quyền định vị trong file app.json.
2. Thay đổi API_BASE_URL và SOCKET_URL trong file src/constants/index.ts thành IP cục bộ (LAN IP) của máy tính đang chạy backend (Không để localhost).

## Màn hình đã hoàn thành

- [x] LoginScreen — đăng nhập SĐT
- [x] OTPScreen — xác minh OTP 6 số
- [x] HomeScreen — trang chủ + nút SOS + thợ gần
- [x] SOSScreen — chọn sự cố + gọi thợ
- [x] TrackingScreen — bản đồ + theo dõi realtime
- [x] ReviewScreen — đánh giá + hóa đơn
- [x] HistoryScreen — lịch sử đơn hàng
- [x] ProfileScreen — hồ sơ + đăng xuất

## TODO tiếp theo

- [ ] App thợ sửa xe (mechanic app) tại src/screens/mechanic/
- [ ] Push notification qua hệ thống Expo
- [ ] Thanh toán qua ví điện tử (MoMo, ZaloPay)
- [ ] Kênh Chat realtime bằng Socket.io giữa user và thợ
- [ ] Admin dashboard
- [ ] Unit tests
