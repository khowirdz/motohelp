import apiClient from './api';
import { User } from '../types';

export const authService = {
  // Gửi số điện thoại để lấy mã OTP
  requestOtp: async (phoneNumber: string) => {
    const response = await apiClient.post('/auth/request-otp', { phoneNumber });
    return response.data;
  },

  // Xác thực mã OTP và nhận thông tin User
  verifyOtp: async (phoneNumber: string, otpCode: string): Promise<{ user: User; token: string }> => {
    const response = await apiClient.post('/auth/verify-otp', { phoneNumber, otpCode });
    return response.data; // Cấu trúc trả về kì vọng: { user: {...}, token: "..." }
  },

  // Cập nhật thông tin profile
  updateProfile: async (userId: string, data: Partial<User>) => {
    // Sửa từ '/auth/profile/...' thành '/users/profile/...'
    const response = await apiClient.put(`/users/profile/${userId}`, data);
    return response.data;
  },
};