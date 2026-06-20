import React, { useEffect, useState, useRef } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Alert, Vibration, Animated } from 'react-native';
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
  
  // Hiệu ứng chớp tắt cảnh báo
  const fadeAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Rung điện thoại báo hiệu có cuốc khẩn cấp (Rung 400ms, nghỉ 400ms, lặp lại)
    Vibration.vibrate([400, 400, 400, 400]);

    // Hiệu ứng nhấp nháy chữ Cảnh báo
    Animated.loop(
      Animated.sequence([
        Animated.timing(fadeAnim, { toValue: 0.3, duration: 500, useNativeDriver: true }),
        Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true })
      ])
    ).start();

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

    // 2. 🔥 ĐÃ SỬA LỖI: Phát tín hiệu đồng ý cứu hộ lên server, gửi KÈM TÊN VÀ SỐ ĐIỆN THOẠI
    socketService.emit('accept_order', { 
      orderId: order.id,
      mechanicId: mechanic?.id,
      mechanicName: mechanic?.name || 'Thợ đối tác',
      // Lấy phoneNumber hoặc phone tùy thuộc vào cách bạn lưu trong Redux
      mechanicPhone: mechanic?.phoneNumber || (mechanic as any)?.phone || '0900000000', 
      licensePlate: (mechanic as any)?.licensePlate || 'Xe máy đối tác',
    });
    
    // 3. Lưu đơn hàng vào Redux để hiển thị ở màn hình tiếp theo
    dispatch(setCurrentOrder(order));
    
    Alert.alert('Thành công', 'Bạn đã nhận cuốc xe này!', [
      { text: 'Đến điểm hẹn', onPress: () => navigation.replace('MechanicTracking') }
    ]);
  };

  return (
    <View style={styles.container}>
      {/* Vòng tròn Radar phía sau */}
      <View style={styles.radarBackground} />

      <Animated.Text style={[styles.alertTitle, { opacity: fadeAnim }]}>
        ⚠️ YÊU CẦU CỨU HỘ!
      </Animated.Text>
      
      <Text style={styles.countdownText}>
        Thời gian phản hồi còn lại: <Text style={styles.countdownNumber}>{countdown}s</Text>
      </Text>

      <View style={styles.infoBox}>
        <View style={styles.row}>
          <Text style={styles.infoLabel}>Sự cố:</Text>
          <Text style={styles.infoValue}>{order.issueType}</Text>
        </View>
        <View style={styles.divider} />
        
        <View style={styles.row}>
          <Text style={styles.infoLabel}>Mô tả:</Text>
          <Text style={[styles.infoValue, { flex: 1, textAlign: 'right' }]} numberOfLines={2}>
            {order.description || 'Không có mô tả chi tiết'}
          </Text>
        </View>
        <View style={styles.divider} />

        <View style={styles.row}>
          <Text style={styles.infoLabel}>Giá ước tính:</Text>
          <Text style={styles.priceValue}>{order?.priceEstimate?.toLocaleString('vi-VN')} Đ</Text>
        </View>
      </View>

      <View style={styles.btnGroup}>
        <TouchableOpacity style={[styles.btn, styles.btnReject]} onPress={() => navigation.goBack()} activeOpacity={0.8}>
          <Text style={styles.btnRejectText}>Bỏ qua</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={[styles.btn, styles.btnAccept]} onPress={handleAccept} activeOpacity={0.8}>
          <Text style={styles.btnAcceptText}>CHỐT ĐƠN</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212', justifyContent: 'center', alignItems: 'center', padding: 24 },
  
  radarBackground: { position: 'absolute', width: 300, height: 300, borderRadius: 150, backgroundColor: 'rgba(255, 77, 77, 0.05)', borderWidth: 1, borderColor: 'rgba(255, 77, 77, 0.1)' },

  alertTitle: { fontSize: 28, fontWeight: '900', color: '#FF4D4D', marginBottom: 8, letterSpacing: 1 },
  countdownText: { fontSize: 16, color: '#A0A0A0', marginBottom: 40 },
  countdownNumber: { color: '#FFF', fontWeight: 'bold', fontSize: 18 },
  
  infoBox: { backgroundColor: '#1E1E1E', width: '100%', padding: 20, borderRadius: 16, marginBottom: 40, borderWidth: 1, borderColor: '#333', elevation: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 5 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingVertical: 10 },
  divider: { height: 1, backgroundColor: '#333', width: '100%' },
  
  infoLabel: { fontSize: 15, color: '#888', fontWeight: '500' },
  infoValue: { fontSize: 16, color: '#FFF', fontWeight: '700' },
  priceValue: { color: '#00E676', fontWeight: '900', fontSize: 20 },
  
  btnGroup: { flexDirection: 'row', width: '100%', justifyContent: 'space-between', gap: 16 },
  btn: { flex: 1, paddingVertical: 18, borderRadius: 14, alignItems: 'center', justifyContent: 'center', elevation: 5 },
  
  btnReject: { backgroundColor: '#2C2C2C', borderWidth: 1, borderColor: '#444' },
  btnRejectText: { fontSize: 16, fontWeight: 'bold', color: '#CCC' },
  
  btnAccept: { backgroundColor: '#00E676', shadowColor: '#00E676', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 8 },
  btnAcceptText: { fontSize: 16, fontWeight: '900', color: '#121212', letterSpacing: 0.5 },
});