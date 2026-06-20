import React, { useEffect, useRef, useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View, Linking, Platform } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation } from '../../hooks/useLocation';
import { orderService } from '../../services/orderService';
import socketService from '../../services/socketService';
import { setCurrentOrder } from '../../store/slices/orderSlice';
import { RootState } from '../../store';

export default function MechanicTrackingScreen({ navigation }: any) {
  const dispatch = useDispatch();
  const { location } = useLocation();
  const currentOrder = useSelector((state: RootState) => state.order.currentOrder);
  const user = useSelector((state: RootState) => state.auth.user);
  
  const mapRef = useRef<MapView>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  // 1. Luồng bắn tọa độ liên tục (Radar)
  useEffect(() => {
    if (!location || !user || !currentOrder) return;
    const interval = setInterval(() => {
      socketService.emit('update_mechanic_location', {
        mechanicId: user.id,
        orderId: currentOrder.id,
        latitude: location.latitude,
        longitude: location.longitude,
      });
    }, 3000);
    return () => clearInterval(interval);
  }, [location, user, currentOrder]);

  // 2. Tự động căn giữa bản đồ
  useEffect(() => {
    if (location && currentOrder?.userLocation && mapRef.current) {
      mapRef.current.fitToCoordinates(
        [location, currentOrder.userLocation],
        { 
          edgePadding: { top: 50, right: 50, bottom: 250, left: 50 }, 
          animated: true 
        }
      );
    }
  }, [location, currentOrder]);

  // 3. VŨ KHÍ MỚI: Lắng nghe tin nhắn từ Khách khi đang xem bản đồ
  useEffect(() => {
    if (!currentOrder || !user) return;
    const socket = socketService.socket || socketService;

    const handleNewMessageAlert = (newMessage: any) => {
      if (newMessage.orderId === currentOrder.id && newMessage.senderId !== user.id) {
        Alert.alert(
          '💬 Tin nhắn từ Khách hàng', 
          newMessage.text,
          [
            { text: 'Đóng', style: 'cancel' },
            { text: 'Trả lời', onPress: () => navigation.navigate('Chat', { orderId: currentOrder.id }) }
          ]
        );
      }
    };

    socket.on('receive_message', handleNewMessageAlert);
    return () => { socket.off('receive_message', handleNewMessageAlert); };
  }, [currentOrder, user, navigation]);

  // Hàm gọi điện thoại trực tiếp
  const handleCallUser = () => {
    const phoneNumber = (currentOrder as any)?.userPhone || '0988888888';
    Linking.openURL(`tel:${phoneNumber}`).catch(() => {
      Alert.alert('Lỗi', 'Thiết bị của bạn không hỗ trợ gọi điện thoại.');
    });
  };

  // 🔥 TÍNH NĂNG MỚI: Mở ứng dụng bản đồ ngoài (Google Maps / Apple Maps) để dẫn đường giọng nói
  const openExternalMap = () => {
    if (!currentOrder) return;
    const { latitude, longitude } = currentOrder.userLocation;
    const url = Platform.select({
      ios: `maps:0,0?q=${latitude},${longitude}`,
      android: `google.navigation:q=${latitude},${longitude}`
    });
    Linking.openURL(url!).catch(() => Alert.alert('Lỗi', 'Không thể mở ứng dụng bản đồ.'));
  };

  const updateStatus = async (status: 'ARRIVED' | 'COMPLETED') => {
    if (!currentOrder || isUpdating) return;
    
    setIsUpdating(true);
    try {
      const updated = await orderService.updateOrderStatus(currentOrder.id, status);
      dispatch(setCurrentOrder(updated));
      
      socketService.emit('mechanic_status_updated', { orderId: currentOrder.id, status });
      
      if (status === 'COMPLETED') {
        dispatch(setCurrentOrder(null));
        Alert.alert('Thành công', 'Chúc mừng bạn đã hoàn thành cuốc xe!');
        
        // 🔥 ĐÃ FIX LỖI ĐIỀU HƯỚNG: Dùng reset thay cho replace để đảm bảo an toàn tuyệt đối 100%
        navigation.reset({
          index: 0,
          routes: [{ name: 'MechanicHome' }]
        });
      }
    } catch {
      Alert.alert('Lỗi', 'Không thể cập nhật trạng thái. Vui lòng kiểm tra mạng!');
    } finally {
      setIsUpdating(false);
    }
  };

  if (!currentOrder || !location) {
    return (
      <View style={styles.center}>
        <Text style={styles.loadingText}>Đang khởi động vệ tinh định vị...</Text>
      </View>
    );
  }

  const isArrived = currentOrder.status === 'ARRIVED';

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={{
          latitude: (location.latitude + currentOrder.userLocation.latitude) / 2,
          longitude: (location.longitude + currentOrder.userLocation.longitude) / 2,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
      >
        <Marker coordinate={location} title="Vị trí của bạn" pinColor="blue" />
        <Marker coordinate={currentOrder.userLocation} title="Khách hàng cần cứu hộ" pinColor="red" />
        
        <Polyline
          coordinates={[location, currentOrder.userLocation]}
          strokeColor="#0084ff" // Đổi sang màu xanh cho giống màu vẽ đường đi
          strokeWidth={4}
          lineDashPattern={[10, 10]} 
        />
      </MapView>

      <View style={styles.panel}>
        <Text style={styles.issueText}>Sự cố: {currentOrder.issueType}</Text>
        <Text style={styles.priceText}>
          Phí dịch vụ: {currentOrder.priceEstimate?.toLocaleString('vi-VN')} Đ
        </Text>

        <View style={styles.actionRow}>
          {/* Thêm nút Dẫn đường vào bộ 3 nút thao tác nhanh */}
          <View style={styles.contactRow}>
            <TouchableOpacity style={styles.callBtn} onPress={handleCallUser}>
              <Text style={styles.btnText}>📞 Gọi</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.chatBtn} onPress={() => navigation.navigate('Chat', { orderId: currentOrder.id })}>
              <Text style={styles.btnText}>💬 Chat</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.navBtn} onPress={openExternalMap}>
              <Text style={styles.btnText}>🧭 Đường</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity 
            style={[
              styles.statusBtn, 
              isArrived ? styles.doneBtn : styles.arrivedBtn,
              isUpdating && { opacity: 0.7 }
            ]} 
            onPress={() => updateStatus(isArrived ? 'COMPLETED' : 'ARRIVED')}
            disabled={isUpdating}
          >
            <Text style={styles.statusBtnText}>
              {isUpdating ? 'ĐANG CẬP NHẬT...' : (isArrived ? '🔧 HOÀN THÀNH SỬA CHỮA' : '📍 ĐÃ ĐẾN NƠI')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { fontSize: 16, color: '#555', fontWeight: 'bold' },
  panel: {
    position: 'absolute',
    bottom: 20, left: 15, right: 15,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    elevation: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 6,
  },
  issueText: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 6 },
  priceText: { fontSize: 16, color: '#2ecc71', fontWeight: 'bold', marginBottom: 16 },
  actionRow: { display: 'flex', flexDirection: 'column', gap: 12 },
  contactRow: { flexDirection: 'row', gap: 8 },
  callBtn: { flex: 1, backgroundColor: '#27ae60', padding: 12, borderRadius: 8, alignItems: 'center' },
  chatBtn: { flex: 1, backgroundColor: '#0084ff', padding: 12, borderRadius: 8, alignItems: 'center' },
  navBtn:  { flex: 1, backgroundColor: '#f39c12', padding: 12, borderRadius: 8, alignItems: 'center' }, // Style nút dẫn đường mới
  statusBtn: { padding: 16, borderRadius: 8, alignItems: 'center', marginTop: 4 },
  arrivedBtn: { backgroundColor: '#34495e' }, // Chuyển màu để nổi bật sự chuyên nghiệp
  doneBtn: { backgroundColor: '#e74c3c' }, 
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  statusBtnText: { color: '#fff', fontWeight: '900', fontSize: 16, textTransform: 'uppercase' },
});