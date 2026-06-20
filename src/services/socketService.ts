// src/services/socketService.ts
// ✅ FIX lỗi ts(2339): thêm các method bị thiếu
//    joinChatRoom, leaveChatRoom, sendTyping, markAsRead, sendMessage

import { io, Socket } from 'socket.io-client';
import { ChatMessage } from '../types';

// ⚠️ ĐỔI IP NÀY thành địa chỉ IPv4 máy tính bạn đang chạy server
const SOCKET_URL = 'http://192.168.0.105:3000';
// const SOCKET_URL = 'http://10.213.174.204:3000';
// const SOCKET_URL = 'http://192.168.100.2:3000';
class SocketService {
  public socket: Socket | null = null;

  // ─── Kết nối / Ngắt kết nối ──────────────────────────────
  connect(token?: string) {
    if (this.socket?.connected) return;

    this.socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    });

    this.socket.on('connect', () =>
      console.log('✅ [Socket] Kết nối:', this.socket?.id)
    );
    this.socket.on('disconnect', (reason) =>
      console.log('🔴 [Socket] Mất kết nối:', reason)
    );
    this.socket.on('connect_error', (err) =>
      console.warn('❌ [Socket] Lỗi:', err.message)
    );
  }

  disconnect() {
    this.socket?.disconnect();
    this.socket = null;
  }

  // ─── Emit / On / Off cơ bản (giữ nguyên từ v1) ───────────
  emit(event: string, data?: any) {
    if (!this.socket?.connected) {
      console.warn(`[Socket] Chưa kết nối, bỏ qua emit: ${event}`);
      return;
    }
    this.socket.emit(event, data);
  }

  on(event: string, callback: (data: any) => void) {
    this.socket?.on(event, callback);
  }

  off(event: string, callback?: (data: any) => void) {
    if (callback) {
      this.socket?.off(event, callback);
    } else {
      this.socket?.removeAllListeners(event);
    }
  }

  // ─── CHAT API (✅ CÁC METHOD MỚI — fix lỗi ts(2339)) ────

  /** Tham gia phòng chat của đơn hàng */
  joinChatRoom(orderId: string) {
    this.emit('join_chat_room', { orderId });
  }

  /** Rời phòng chat khi thoát màn hình */
  leaveChatRoom(orderId: string) {
    this.emit('leave_chat_room', { orderId });
  }

  /** Gửi tin nhắn lên server */
  sendMessage(message: Omit<ChatMessage, 'status'> & { status?: ChatMessage['status'] }) {
    this.emit('send_message', message);
  }

  /**
   * Báo đang gõ — gọi mỗi lần onChangeText
   * Nhớ debounce ở UI để không spam (xem ChatScreen)
   */
  sendTyping(orderId: string, userId: string, isTyping: boolean) {
    this.emit('typing', { orderId, userId, isTyping });
  }

  /** Báo đã đọc tin nhắn → server sẽ thông báo cho người kia */
  markAsRead(orderId: string, messageId: string, userId: string) {
    this.emit('mark_read', { orderId, messageId, userId });
  }

  // ─── LOCATION & ORDER API (giữ nguyên từ v1) ─────────────

  updateMechanicLocation(
    mechanicId: string,
    orderId: string,
    lat: number,
    lng: number
  ) {
    this.emit('update_mechanic_location', {
      mechanicId,
      orderId,
      latitude: lat,
      longitude: lng,
    });
  }

  acceptOrder(orderId: string, mechanicId: string) {
    this.emit('accept_order', { orderId, mechanicId });
  }

  createRescueRoom(
    orderId: string,
    location: { latitude: number; longitude: number }
  ) {
    this.emit('create_rescue_room', { orderId, location });
  }

  updateMechanicStatus(mechanicId: string, status: 'ONLINE' | 'OFFLINE') {
    this.emit('mechanic_status_change', { mechanicId, status });
  }
}

export default new SocketService();