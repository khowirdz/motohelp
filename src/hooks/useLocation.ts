import { useState, useEffect, useCallback } from 'react';
import locationService from '../services/locationService';
import { LocationData } from '../types';

export const useLocation = () => {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchLocation = useCallback(async () => {
    setLoading(true);
    setErrorMsg(null);
    
    try {
      // 1. Kiểm tra và xin quyền truy cập vị trí
      const hasPermission = await locationService.requestPermissions();
      if (!hasPermission) {
        setErrorMsg('Quyền truy cập vị trí bị từ chối. Vui lòng cấp quyền trong cài đặt của điện thoại.');
        setLoading(false);
        return;
      }

      // 2. Lấy tọa độ GPS hiện tại
      const locData = await locationService.getCurrentLocation();
      if (locData) {
        setLocation(locData);
      } else {
        setErrorMsg('Không thể lấy được tín hiệu GPS hiện tại. Vui lòng thử lại.');
      }
    } catch (error) {
      setErrorMsg('Đã xảy ra lỗi hệ thống khi lấy vị trí.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Tự động lấy vị trí ngay khi màn hình (component) được render lần đầu
  useEffect(() => {
    fetchLocation();
  }, [fetchLocation]);

  // Trả về dữ liệu để các màn hình khác sử dụng, kèm theo hàm refetch để làm mới vị trí bằng tay
  return { location, errorMsg, loading, refetch: fetchLocation };
};