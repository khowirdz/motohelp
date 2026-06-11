import { io, Socket } from 'socket.io-client';

// Đảm bảo IP này giống với BASE_URL ở file api.ts
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

// Export duy nhất 1 instance để dùng chung toàn app
export default new SocketService();