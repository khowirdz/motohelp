import apiClient from './api';
import { Order, LocationData } from '../types';

export const orderService = {
  createOrder: async (data: { issueType: string; description: string; location: LocationData }) => {
    const response = await apiClient.post('/orders/create', data);
    return response.data;
  },

  getOrderById: async (orderId: string): Promise<Order> => {
    const response = await apiClient.get(`/orders/${orderId}`);
    return response.data;
  },

  getOrderHistory: async (userId: string): Promise<Order[]> => {
    const response = await apiClient.get(`/orders/history/${userId}`);
    return response.data.orders ?? [];
  },

  acceptOrder: async (orderId: string) => {
    const response = await apiClient.post(`/orders/${orderId}/accept`);
    return response.data;
  },

  updateOrderStatus: async (orderId: string, status: Order['status']): Promise<Order> => {
    const response = await apiClient.patch(`/orders/${orderId}/status`, { status });
    return response.data;
  },

  getMechanicActiveOrder: async (mechanicId: string): Promise<Order | null> => {
    try {
      const response = await apiClient.get(`/orders/mechanic/${mechanicId}/active`);
      return response.data.order ?? null;
    } catch {
      return null;
    }
  },
};
