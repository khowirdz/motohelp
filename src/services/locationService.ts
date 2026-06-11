import * as Location from 'expo-location';
import { LocationData } from '../types';

class LocationService {
  // Yêu cầu cấp quyền truy cập vị trí
  async requestPermissions(): Promise<boolean> {
    const { status } = await Location.requestForegroundPermissionsAsync();
    return status === 'granted';
  }

  // Lấy tọa độ hiện tại
  async getCurrentLocation(): Promise<LocationData | null> {
    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        throw new Error('Không có quyền truy cập vị trí');
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      return {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };
    } catch (error) {
      console.error('Lỗi lấy vị trí:', error);
      return null;
    }
  }
}

export default new LocationService();