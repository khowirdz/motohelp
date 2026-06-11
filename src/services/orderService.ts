import apiClient from './api';
import { Order, LocationData } from '../types';

export const orderService = {
  // Khách hàng tạo yêu cầu sửa xe
  createOrder: async (data: { issueType: string; description: string; location: LocationData }) => {
    const response = await apiClient.post('/orders/create', data);
    return response.data;
  },

  // Lấy chi tiết một đơn hàng cụ thể
  getOrderById: async (orderId: string): Promise<Order> => {
    const response = await apiClient.get(`/orders/${orderId}`);
    return response.data;
  },

  // Thợ xác nhận nhận đơn
  acceptOrder: async (orderId: string) => {
    const response = await apiClient.post(`/orders/${orderId}/accept`);
    return response.data;
  },

  // Cập nhật trạng thái đơn (ARRIVED, COMPLETED, CANCELLED)
  updateOrderStatus: async (orderId: string, status: Order['status']) => {
    const response = await apiClient.patch(`/orders/${orderId}/status`, { status });
    return response.data;
  },
};