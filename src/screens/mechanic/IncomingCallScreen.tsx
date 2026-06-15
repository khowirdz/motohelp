import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Alert, Vibration } from 'react-native';
import socketService from '../../services/socketService';
import { useDispatch, useSelector } from 'react-redux';
import { setCurrentOrder } from '../../store/slices/orderSlice';
import { RootState } from '../../store';

export default function IncomingCallScreen({ route, navigation }: any) {
  const { order } = route.params;
  const dispatch = useDispatch();
  
  // Lấy thông tin người thợ đang đăng nhập từ Redux
  const mechanic = useSelector((state: RootState) => state.auth.user);
  
  const [countdown, setCountdown] = useState(30); // 30 giây đếm ngược nhận đơn

  useEffect(() => {
    // Rung điện thoại báo hiệu có cuốc khẩn cấp (Rung 400ms, nghỉ 400ms, lặp lại)
    Vibration.vibrate([400, 400, 400, 400]);

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          navigation.goBack(); // Tự động đóng nếu hết thời gian hoặc thợ khác đã nhận
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearInterval(timer);
      Vibration.cancel(); // Tắt rung khi thoát màn hình
    };
  }, []);

  const handleAccept = () => {
    // 1. Dừng đếm ngược và tắt rung
    Vibration.cancel();

    // 2. Phát tín hiệu đồng ý cứu hộ lên server, CẦN gửi kèm mechanicId để server biết ai nhận
    socketService.emit('accept_order', { 
      orderId: order.id,
      mechanicId: mechanic?.id 
    });
    
    // 3. Lưu đơn hàng vào Redux để hiển thị ở màn hình tiếp theo
    dispatch(setCurrentOrder(order));
    
    Alert.alert('Thành công', 'Bạn đã nhận cuốc xe này!', [
      // Đảm bảo tên route 'MechanicTrackingScreen' khớp với cấu hình trong navigation của bạn
      { text: 'Đến điểm hẹn', onPress: () => navigation.replace('MechanicTracking') }
    ]);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.alertTitle}>⚠️ YÊU CẦU CỨU HỘ!</Text>
      <Text style={styles.countdownText}>Thời gian phản hồi còn lại: {countdown}s</Text>

      <View style={styles.infoBox}>
        <Text style={styles.infoLabel}>Sự cố: <Text style={styles.infoValue}>{order.issueType}</Text></Text>
        <Text style={styles.infoLabel}>Mô tả: <Text style={styles.infoValue}>{order.description || 'Không có mô tả'}</Text></Text>
        <Text style={styles.infoLabel}>
          Giá ước tính: <Text style={styles.priceValue}>{order?.priceEstimate?.toLocaleString('vi-VN')} Đ</Text>
        </Text>
      </View>

      <View style={styles.btnGroup}>
        <TouchableOpacity style={[styles.btn, styles.btnReject]} onPress={() => navigation.goBack()}>
          <Text style={styles.btnText}>Bỏ qua</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={[styles.btn, styles.btnAccept]} onPress={handleAccept}>
          <Text style={styles.btnText}>Nhận Cứu Hộ</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1e1e24', justifyContent: 'center', alignItems: 'center', padding: 20 },
  alertTitle: { fontSize: 24, fontWeight: 'bold', color: '#ff4d4d', marginBottom: 10 },
  countdownText: { fontSize: 16, color: '#fff', marginBottom: 30 },
  infoBox: { backgroundColor: '#2a2a35', width: '100%', padding: 20, borderRadius: 12, marginBottom: 40 },
  infoLabel: { fontSize: 16, color: '#aaa', marginBottom: 8 },
  infoValue: { color: '#fff', fontWeight: 'bold' },
  priceValue: { color: '#4cd137', fontWeight: 'bold', fontSize: 18 },
  btnGroup: { flexDirection: 'row', width: '100%', justifyContent: 'space-between' },
  btn: { flex: 0.45, paddingVertical: 15, borderRadius: 8, alignItems: 'center' },
  btnReject: { backgroundColor: '#dcdde1' },
  btnAccept: { backgroundColor: '#4cd137' },
  btnText: { fontSize: 16, fontWeight: 'bold', color: '#000' },
});