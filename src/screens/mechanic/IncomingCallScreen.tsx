import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Alert } from 'react-native';
import socketService from '../../services/socketService';
import { useDispatch } from 'react-redux';
import { setCurrentOrder } from '../../store/slices/orderSlice';

export default function IncomingCallScreen({ route, navigation }: any) {
  const { order } = route.params;
  const dispatch = useDispatch();
  const [countdown, setCountdown] = useState(30); // 30 giây đếm ngược nhận đơn

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          navigation.goBack(); // Tự động đóng nếu hết thời gian
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleAccept = () => {
    // Phát tín hiệu đồng ý cứu hộ lên server qua Socket.io
    socketService.emit('accept_order', { orderId: order.id });
    dispatch(setCurrentOrder(order));
    
    Alert.alert('Thành công', 'Bạn đã nhận cuốc xe này!', [
      { text: 'Đến điểm hẹn', onPress: () => navigation.navigate('MechanicTracking') }
    ]);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.alertTitle}>⚠️ YÊU CẦU CỨU HỘ KHẨN CẤP!</Text>
      <Text style={styles.countdownText}>Thời gian phản hồi còn lại: {countdown}s</Text>

      <View style={styles.infoBox}>
        <Text style={styles.infoLabel}>Sự cố: <Text style={styles.infoValue}>{order.issueType}</Text></Text>
        <Text style={styles.infoLabel}>Mô tả: <Text style={styles.infoValue}>{order.description || 'Không có mô tả'}</Text></Text>
        <Text style={styles.infoLabel}>Giá ước tính: <Text style={styles.priceValue}>{order.priceEstimate.toLocaleString('vi-VN')} Đ</Text></Text>
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