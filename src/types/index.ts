// src/types/index.ts
// Thêm ChatMessage vào file types hiện có của bạn

export interface LocationData {
  latitude: number;
  longitude: number;
}

export type UserRole = 'user' | 'mechanic' | 'admin';
export type OrderStatus = 'PENDING' | 'ACCEPTED' | 'ARRIVED' | 'COMPLETED' | 'CANCELLED';

export interface User {
  id: string;
  phoneNumber: string;
  name?: string;
  role: UserRole;
  avatar?: string;
}

export interface Mechanic {
  id: string;
  name: string;
  phoneNumber: string;
  location: LocationData;
  rating: number;
  totalReviews?: number;
  avatar?: string;
}

export interface Order {
  id: string;
  userId: string;
  userPhone?: string;
  userName?: string;
  mechanicId?: string;
  mechanicPhone?: string;
  mechanicName?: string;
  issueType: string;
  description?: string;
  status: OrderStatus;
  userLocation: LocationData;
  priceEstimate: number;
  createdAt: string;
  updatedAt?: string;
  licensePlate?: string;
}

// ✅ FIX: Thêm ChatMessage — đây là type bị thiếu gây lỗi ts(2305)
export interface ChatMessage {
  _id: string;
  orderId: string;
  text: string;
  senderId: string;
  senderName?: string;
  createdAt: string;
  // sending = đang gửi, sent = lên server, delivered = đối phương nhận, read = đã đọc
  status: 'sending' | 'sent' | 'delivered' | 'read';
  type: 'text' | 'image' | 'system';
}

export interface TypingStatus {
  userId: string;
  isTyping: boolean;
}