import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ActivityIndicator, Alert, SafeAreaView, Platform } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store'; 
import { updateMechanicLocation, setCurrentOrder } from '../../store/slices/orderSlice';
import socketService from '../../services/socketService';
// import { notificationService } from '../../services/notificationService'; // Bật lại khi build production
import { ORDER_STATUS } from '../../constants';

const STATUS_NOTIFICATION: Partial<Record<string, string>> = {
  ACCEPTED: 'Thợ sửa xe đã nhận đơn và đang trên đường đến!',
  ARRIVED: 'Thợ sửa xe đã đến vị trí của bạn.',
  COMPLETED: 'Sửa chữa hoàn thành! Cảm ơn bạn đã sử dụng MotoCứu.',
};

export default function TrackingScreen({ route, navigation }: any) {
  const { orderId } = route.params;
  const dispatch = useDispatch();
  
  const user = useSelector((state: RootState) => state.auth.user);
  const currentOrder = useSelector((state: RootState) => state.order.currentOrder);
  const mechanicLocation = useSelector((state: RootState) => state.order.mechanicLocation);

  // State quản lý Popup thông báo tin nhắn
  const [showNotification, setShowNotification] = useState(false);
  const [latestMessage, setLatestMessage] = useState('');

  // LUỒNG 1: LẮNG NGHE VỊ TRÍ & TRẠNG THÁI ĐƠN HÀNG
  useEffect(() => {
    const socket = socketService.socket || socketService;

    const handleMechanicLocation = (coords: any) => {
      dispatch(updateMechanicLocation(coords));
    };

    const handleOrderStatus = (updatedOrder: any) => {
      dispatch(setCurrentOrder(updatedOrder));
      const message = STATUS_NOTIFICATION[updatedOrder.status];
      
      if (message) {
        // notificationService.notify('MotoCứu', message);
      }
      
      if (updatedOrder.status === 'COMPLETED') {
        // Chuyển sang trang đánh giá sau khi hoàn thành
        navigation.replace('Review', { orderId: updatedOrder.id }); // Đảm bảo tên là 'Review'
      }
    };

    socket.on('mechanic_location_changed', handleMechanicLocation);
    socket.on('order_status_changed', handleOrderStatus);

    return () => {
      socket.off('mechanic_location_changed', handleMechanicLocation);
      socket.off('order_status_changed', handleOrderStatus);
    };
  }, [orderId, dispatch, navigation]);

  // LUỒNG 2: LẮNG NGHE TIN NHẮN TỚI (ĐỂ HIỆN POPUP)
  useEffect(() => {
    const socket = socketService.socket || socketService;
    
    const handleIncomingMessage = (newMessage: any) => {
      // Chỉ hiện thông báo nếu đúng đơn hàng này VÀ người gửi không phải là mình
      if (newMessage.orderId === orderId && newMessage.senderId !== user?.id) {
        setLatestMessage(newMessage.text);
        setShowNotification(true);
        
        // Tự động ẩn popup sau 4 giây
        setTimeout(() => {
          setShowNotification(false);
        }, 4000);
      }
    };

    socket.on('receive_message', handleIncomingMessage);
    return () => { socket.off('receive_message', handleIncomingMessage); };
  }, [orderId, user]);

  if (!currentOrder) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#0084FF" />
        <Text style={styles.statusText}>Đang tải dữ liệu cuốc xe...</Text>
      </View>
    );
  }

  const isPending = currentOrder.status === 'PENDING';

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        
        {/* BẢN ĐỒ */}
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: currentOrder.userLocation.latitude,
            longitude: currentOrder.userLocation.longitude,
            latitudeDelta: 0.015,
            longitudeDelta: 0.015,
          }}
          // Dịch tâm bản đồ lên một chút để không bị thẻ InfoCard che mất marker
          mapPadding={{ top: 0, right: 0, bottom: 200, left: 0 }}
        >
          <Marker coordinate={currentOrder.userLocation} title="Xe của bạn" pinColor="red" />
          {mechanicLocation && !isPending && (
            <Marker coordinate={mechanicLocation} title="Thợ đang đến" pinColor="#0084FF" />
          )}
        </MapView>

        {/* POPUP THÔNG BÁO TIN NHẮN (Hiển thị khi có người nhắn) */}
        {showNotification && (
          <TouchableOpacity 
            style={styles.notificationBanner}
            activeOpacity={0.9}
            onPress={() => {
              setShowNotification(false);
              navigation.navigate('Chat', { orderId: currentOrder.id });
            }}
          >
            <Text style={styles.notiTitle}>🔔 Tin nhắn mới từ Thợ</Text>
            <Text style={styles.notiText} numberOfLines={1}>{latestMessage}</Text>
          </TouchableOpacity>
        )}

        {/* THẺ THÔNG TIN TRẠNG THÁI (Đã được làm đẹp) */}
        <View style={styles.infoCard}>
          <View style={styles.headerCard}>
            {isPending ? (
              <ActivityIndicator size="small" color="#FF4D4D" style={{ marginRight: 10 }} />
            ) : (
              <View style={styles.pulseDot} />
            )}
            <Text style={[styles.stateTitle, !isPending && { color: '#0084FF' }]}>
              {isPending ? 'Đang tìm thợ quanh đây...' : ORDER_STATUS[currentOrder.status] || currentOrder.status}
            </Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Tổng chi phí dự kiến:</Text>
            <Text style={styles.priceValue}>
              {currentOrder.priceEstimate?.toLocaleString('vi-VN')} Đ
            </Text>
          </View>

          <View style={styles.btnGroup}>
            {isPending ? (
              <TouchableOpacity 
                style={[styles.actionBtn, styles.cancelBtn]}
                onPress={() => Alert.alert('Thông báo', 'Tính năng hủy cuốc đang được phát triển.')}
              >
                <Text style={styles.cancelBtnText}>Hủy yêu cầu</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[styles.actionBtn, styles.chatBtn]}
                onPress={() => navigation.navigate('Chat', { orderId: currentOrder.id })}
              >
                <Text style={styles.chatBtnText}>💬 Nhắn tin với thợ</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFF' },
  container: { flex: 1 },
  map: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F0F2F5' },
  statusText: { fontSize: 16, color: '#555', fontWeight: '500', marginTop: 12 },
  
  // STYLE CHO THẺ THÔNG BÁO TIN NHẮN NỔI LÊN
  notificationBanner: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 10 : 40,
    left: 20, right: 20,
    backgroundColor: '#343A40',
    padding: 16,
    borderRadius: 16,
    zIndex: 999,
    elevation: 8,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 5,
  },
  notiTitle: { color: '#FFD700', fontWeight: 'bold', marginBottom: 6, fontSize: 14 },
  notiText: { color: '#FFF', fontSize: 15 },

  // STYLE CHO THẺ THÔNG TIN BÊN DƯỚI
  infoCard: {
    position: 'absolute', bottom: 30, left: 20, right: 20,
    backgroundColor: '#fff', padding: 20, borderRadius: 24,
    elevation: 10,
    shadowColor: '#000', shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.15, shadowRadius: 10,
  },
  headerCard: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  pulseDot: { 
    width: 12, height: 12, borderRadius: 6, backgroundColor: '#0084FF', 
    marginRight: 10, borderWidth: 2, borderColor: '#D0E8FF' 
  },
  stateTitle: { fontSize: 18, fontWeight: 'bold', color: '#FF4D4D', flex: 1 },
  divider: { height: 1, backgroundColor: '#F0F0F0', marginBottom: 16 },
  
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  priceLabel: { fontSize: 15, color: '#666' },
  priceValue: { fontSize: 18, color: '#2ecc71', fontWeight: 'bold' },
  
  btnGroup: { flexDirection: 'row', justifyContent: 'center' },
  actionBtn: { 
    flex: 1, paddingVertical: 14, borderRadius: 16, alignItems: 'center', justifyContent: 'center' 
  },
  chatBtn: { backgroundColor: '#0084FF' },
  chatBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
  cancelBtn: { backgroundColor: '#FFF5F5', borderWidth: 1, borderColor: '#FF4D4D' },
  cancelBtnText: { color: '#FF4D4D', fontWeight: 'bold', fontSize: 16 },
});