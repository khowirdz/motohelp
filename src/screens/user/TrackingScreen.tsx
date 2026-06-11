import React, { useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { updateMechanicLocation, setCurrentOrder } from '../../store/slices/orderSlice';
import socketService from '../../services/socketService';
import { ORDER_STATUS } from '../../constants';

export default function TrackingScreen({ route, navigation }: any) {
  const { orderId } = route.params;
  const dispatch = useDispatch();
  
  const currentOrder = useSelector((state: RootState) => state.order.currentOrder);
  const mechanicLocation = useSelector((state: RootState) => state.order.mechanicLocation);

  useEffect(() => {
    // Lắng nghe sự kiện thợ cập nhật vị trí di chuyển theo thời gian thực
    socketService.on('mechanic_location_changed', (coords) => {
      dispatch(updateMechanicLocation(coords));
    });

    // Lắng nghe sự kiện thay đổi trạng thái của đơn hàng (Đã đến nơi, Đã sửa xong...)
    socketService.on('order_status_changed', (updatedOrder) => {
      dispatch(setCurrentOrder(updatedOrder));
      if (updatedOrder.status === 'COMPLETED') {
        navigation.replace('Review', { orderId: updatedOrder.id });
      }
    });
  }, [orderId]);

  if (!currentOrder) {
    return (
      <View style={styles.center}>
        <Text style={styles.statusText}>Hệ thống đang tìm kiếm thợ sửa xe phù hợp nhất ở gần bạn...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: currentOrder.userLocation.latitude,
          longitude: currentOrder.userLocation.longitude,
          latitudeDelta: 0.02,
          longitudeDelta: 0.02,
        }}
      >
        {/* Vị trí xe hỏng của khách hàng */}
        <Marker coordinate={currentOrder.userLocation} title="Xe của bạn" pinColor="red" />

        {/* Vị trí thợ sửa xe đang di chuyển tiếp cận */}
        {mechanicLocation && (
          <Marker coordinate={mechanicLocation} title="Thợ cứu hộ đang đến" pinColor="blue" />
        )}
      </MapView>

      {/* Panel thông tin trạng thái cứu hộ phía dưới */}
      <View style={styles.infoCard}>
        <Text style={styles.stateTitle}>Trạng thái: {ORDER_STATUS[currentOrder.status]}</Text>
        <Text style={styles.priceEstimate}>
          Tổng chi phí dự kiến: {currentOrder.priceEstimate.toLocaleString('vi-VN')} Đ
        </Text>

        <View style={styles.btnGroup}>
          <TouchableOpacity
            style={styles.chatBtn}
            onPress={() => navigation.navigate('Chat', { orderId: currentOrder.id })}
          >
            <Text style={styles.chatBtnText}>💬 Nhắn tin với thợ</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  statusText: { fontSize: 16, textAlign: 'center', color: '#555', fontWeight: '500' },
  infoCard: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    right: 20,
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    elevation: 6,
  },
  stateTitle: { fontSize: 18, fontWeight: 'bold', color: '#e74c3c', marginBottom: 6 },
  priceEstimate: { fontSize: 15, color: '#2ec771', fontWeight: '600', marginBottom: 15 },
  btnGroup: { flexDirection: 'row', justifyContent: 'center' },
  chatBtn: { backgroundColor: '#0084ff', paddingVertical: 12, paddingHorizontal: 40, borderRadius: 25 },
  chatBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
});