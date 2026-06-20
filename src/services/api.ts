import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// LƯU Ý: Thay đổi IP này thành địa chỉ IP IPv4 máy tính của bạn (Ví dụ: 192.168.0.105)
// Tránh dùng 'localhost' vì máy ảo/điện thoại thật sẽ không hiểu localhost là máy tính
export const BASE_URL = 'http://192.168.0.105:3000/api';
// export const BASE_URL = 'http://10.213.174.204:3000/api';
// export const BASE_URL = 'http://192.168.100.2:3000/api';
const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor: Tự động đính kèm Token vào Header trước khi gửi request
apiClient.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('userToken');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default apiClient;