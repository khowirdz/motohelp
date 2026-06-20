import { Dimensions } from 'react-native';
export const GOOGLE_API_KEY = 'ĐIỀN_API_KEY_THẬT_CỦA_BẠN_VÀO_ĐÂY';

// Lấy kích thước màn hình thiết bị
const { width, height } = Dimensions.get('window');

export const SCREEN_WIDTH = width;
export const SCREEN_HEIGHT = height;

// Tỉ lệ thu phóng mặc định của bản đồ (Rất quan trọng cho các màn hình Tracking/SOS dùng react-native-maps)
export const ASPECT_RATIO = width / height;
export const LATITUDE_DELTA = 0.005; // Mức độ zoom cận cảnh vừa phải để thấy rõ các con đường
export const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

// Cố định các trạng thái của cuốc xe cứu hộ để tránh gõ sai chính tả ở các màn hình khác nhau
export const ORDER_STATUS = {
  PENDING: 'PENDING',       // Đang chờ thợ nhận
  ACCEPTED: 'ACCEPTED',     // Thợ đã nhận cuốc
  ARRIVED: 'ARRIVED',       // Thợ đã đến nơi
  COMPLETED: 'COMPLETED',   // Hoàn thành sửa chữa
  CANCELLED: 'CANCELLED',   // Đã hủy
};


// Gom và export luôn file colors.ts để các màn hình chỉ cần import từ 'constants'
export * from './colors';
export const ISSUE_TYPES = [
  { id: '1', label: 'Thủng xăm / Bể lốp', value: 'FLAT_TIRE', price: 50000 },
  { id: '2', label: 'Hết xăng giữa đường', value: 'OUT_OF_GAS', price: 30000 },
  { id: '3', label: 'Chết máy / Không nổ được', value: 'ENGINE_FAILURE', price: 100000 },
  { id: '4', label: 'Đứt xích / Hỏng phanh', value: 'CHAIN_BRAKE', price: 80000 },
  { id: '5', label: 'Sự cố khác', value: 'OTHER', price: 50000 },
];