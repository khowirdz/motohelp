import { io, Socket } from 'socket.io-client';

// ĐÃ SỬA: Xóa chữ /api ở đuôi. Trỏ trực tiếp vào cổng 3000.
const SOCKET_URL = 'http://192.168.0.105:3000';

class SocketService {
  public socket: Socket | null = null;

  connect(token?: string) {
    if (!this.socket) {
      this.socket = io(SOCKET_URL, {
        auth: { token },
        transports: ['websocket'],
      });

      this.socket.on('connect', () => {
        console.log('Socket connected:', this.socket?.id);
      });

      this.socket.on('disconnect', () => {
        console.log('Socket disconnected');
      });

      // THÊM ĐOẠN NÀY VÀO ĐỂ BẮT LỖI TẬN GỐC
      this.socket.on('connect_error', (error) => {
        console.log('❌ LỖI KẾT NỐI SOCKET TỪ ĐIỆN THOẠI:', error.message);
      });
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  emit(event: string, data?: any) {
    if (this.socket) {
      this.socket.emit(event, data);
    }
  }

  on(event: string, callback: (data: any) => void) {
    if (this.socket) {
      this.socket.on(event, callback);
    }
  }

  off(event: string) {
    if (this.socket) {
      this.socket.off(event);
    }
  }
}

export default new SocketService();