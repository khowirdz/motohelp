// Định nghĩa cấu trúc tọa độ GPS
export interface LocationData {
  latitude: number;
  longitude: number;
}

// Tách riêng các trạng thái thành Type độc lập để dễ quản lý và tái sử dụng
export type UserRole = 'user' | 'mechanic' | 'admin';
export type OrderStatus = 'PENDING' | 'ACCEPTED' | 'ARRIVED' | 'COMPLETED' | 'CANCELLED';

// Định nghĩa cấu trúc tài khoản người dùng chung
export interface User {
  id: string;
  phoneNumber: string;
  name?: string;
  role: UserRole;
}

// Định nghĩa cấu trúc riêng cho thợ sửa xe (Đối tác)
export interface Mechanic {
  id: string;
  name: string;
  phoneNumber: string;
  location: LocationData;
  rating: number;
  avatar?: string;
}

// Định nghĩa cấu trúc của một đơn hàng cứu hộ
export interface Order {
  id: string;
  userId: string;
  userPhone?: string;      // Thêm dòng này: Để Thợ có thể bấm gọi Khách
  userName?: string;       // Thêm dòng này: Để Thợ biết tên Khách
  
  mechanicId?: string;     // Có thể null nếu chưa có thợ nhận
  mechanicPhone?: string;  // Thêm dòng này: Để Khách có thể bấm gọi Thợ
  mechanicName?: string;   // Thêm dòng này: Để Khách biết tên Thợ
  
  issueType: string;
  description?: string;
  status: OrderStatus;     // Sử dụng type OrderStatus đã tách ở trên cho gọn
  userLocation: LocationData;
  priceEstimate: number;
  createdAt: string;
  updatedAt?: string;      // Thêm dòng này: Để biết đơn hàng cập nhật trạng thái lúc mấy giờ
}