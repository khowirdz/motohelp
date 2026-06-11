// Định nghĩa cấu trúc tọa độ GPS
export interface LocationData {
  latitude: number;
  longitude: number;
}

// Định nghĩa cấu trúc tài khoản người dùng chung
export interface User {
  id: string;
  phoneNumber: string;
  name?: string;
  role: 'user' | 'mechanic' | 'admin';
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
  mechanicId?: string; // Có thể null nếu chưa có thợ nhận
  issueType: string;
  description?: string;
  status: 'PENDING' | 'ACCEPTED' | 'ARRIVED' | 'COMPLETED' | 'CANCELLED';
  userLocation: LocationData;
  priceEstimate: number;
  createdAt: string;
}