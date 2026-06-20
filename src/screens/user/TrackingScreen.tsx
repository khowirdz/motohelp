import React, { useState, useEffect, useRef } from 'react';
import { 
  StyleSheet, Text, View, TouchableOpacity, ActivityIndicator, 
  Alert, SafeAreaView, Platform, Animated, Image, Linking
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import MapViewDirections from 'react-native-maps-directions';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store'; 
import { updateMechanicLocation, setCurrentOrder } from '../../store/slices/orderSlice';
import socketService from '../../services/socketService';
import apiClient from '../../services/api';
import { useLocation } from '../../hooks/useLocation'; 
import { GOOGLE_API_KEY } from '../../constants';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

// 🔥 TỪ ĐIỂN DỊCH TRẠNG THÁI HIỂN THỊ UI
const STATUS_DISPLAY: Record<string, { title: string, color: string }> = {
  PENDING: { title: 'Đang tìm thợ quanh đây...', color: '#FF4D4D' },
  ACCEPTED: { title: 'Thợ đang trên đường đến', color: '#0084FF' },
  ARRIVED: { title: 'Thợ đã đến nơi!', color: '#00C853' },
  COMPLETED: { title: 'Hoàn thành sửa chữa', color: '#8B5CF6' },
};

export default function TrackingScreen({ route, navigation }: any) {
  const { orderId } = route.params || {};
  const dispatch = useDispatch();
  const mapRef = useRef<MapView>(null);
  
  const { location: deviceLocation } = useLocation(); 
  
  const user = useSelector((state: RootState) => state.auth.user);
  const currentOrder = useSelector((state: RootState) => state.order.currentOrder);
  const mechanicLocation = useSelector((state: RootState) => state.order.mechanicLocation);

  const [distance, setDistance] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [isCancelling, setIsCancelling] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);

  const pulseAnim = useRef(new Animated.Value(0)).current;

  // 1. Đếm ngược 30 giây hủy chuyến
  useEffect(() => {
    if (currentOrder?.status !== 'PENDING') return; // Ngừng đếm nếu đã có người nhận
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [currentOrder?.status]);

  // 2. Hiệu ứng Radar nhịp đập
  useEffect(() => {
    if (currentOrder?.status === 'PENDING') {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1, duration: 1200, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 0, duration: 800, useNativeDriver: true })
        ])
      ).start();
    } else {
      pulseAnim.setValue(0);
    }
  }, [currentOrder?.status]);

  // 3. Lắng nghe Socket
  useEffect(() => {
    const socket = socketService.socket || socketService;
    const handleMechanicLocation = (coords: any) => dispatch(updateMechanicLocation(coords));
    
    const handleOrderStatus = (updatedOrder: any) => {
      dispatch(setCurrentOrder(updatedOrder));
      if (updatedOrder.status === 'COMPLETED') {
        navigation.replace('Review', { orderId: updatedOrder.id, mechanicName: (updatedOrder as any).mechanicName || (updatedOrder as any).mechanic?.name || 'Thợ sửa xe'}); 
      } else if (updatedOrder.status === 'CANCELLED') {
        Alert.alert('Thông báo', 'Cuốc xe này đã bị hủy.', [{ 
          text: 'OK', onPress: () => navigation.navigate('MainTabs')
        }]);
      }
    };

    socket.on('mechanic_location_changed', handleMechanicLocation);
    socket.on('order_status_changed', handleOrderStatus);
    return () => {
      socket.off('mechanic_location_changed', handleMechanicLocation);
      socket.off('order_status_changed', handleOrderStatus);
    };
  }, [dispatch, navigation]);

  const handleCancelOrder = () => {
    if (currentOrder?.status !== 'PENDING') {
      Alert.alert('Không thể hủy', 'Thợ đã nhận đơn, bạn không thể hủy lúc này!');
      return;
    }
    if (timeLeft === 0) {
      Alert.alert('Quá thời gian', 'Đã quá 30s kể từ lúc đặt, bạn không thể tự hủy chuyến đi.');
      return;
    }

    Alert.alert(
      'Xác nhận hủy',
      `Bạn còn ${timeLeft} giây để hủy yêu cầu này miễn phí. Bạn có chắc chắn muốn hủy không?`,
      [
        { text: 'Không', style: 'cancel' },
        { 
          text: 'Có, Hủy ngay', style: 'destructive',
          onPress: async () => {
            setIsCancelling(true);
            try {
              await apiClient.put(`/orders/${orderId || currentOrder?.id}/status`, { status: 'CANCELLED' });
              socketService.emit('mechanic_status_updated', { orderId: orderId || currentOrder?.id, status: 'CANCELLED' });
              dispatch(setCurrentOrder(null));
              navigation.navigate('MainTabs');
            } catch (error) {
              Alert.alert('Lỗi', 'Không thể hủy cuốc xe lúc này. Vui lòng kiểm tra mạng!');
            } finally {
              setIsCancelling(false);
            }
          }
        }
      ]
    );
  };

  // Xử lý gọi điện cho thợ
  const handleCallMechanic = () => {
    // Lấy số điện thoại từ đơn hàng (Cần đảm bảo Backend có trả về trường mechanicPhone)
    const phoneNumber = 
      (currentOrder as any)?.mechanic?.phone || 
      (currentOrder as any)?.mechanic?.phoneNumber ||
      (currentOrder as any)?.mechanicPhone;

    if (!phoneNumber) {
      Alert.alert('Thông báo', 'Chưa có thông tin số điện thoại của thợ.');
      return;
    }

    // Cú pháp chuẩn để mở ứng dụng điện thoại
    const url = `tel:${phoneNumber}`;

    Linking.canOpenURL(url)
      .then((supported) => {
        if (!supported) {
          Alert.alert('Lỗi', 'Thiết bị của bạn không hỗ trợ tính năng gọi điện.');
        } else {
          return Linking.openURL(url);
        }
      })
      .catch((err) => console.error('Lỗi khi mở trình gọi điện:', err));
  };

  const pickupLocation = currentOrder?.userLocation || deviceLocation;

  if (!currentOrder || !pickupLocation) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#0084FF" />
        <Text style={styles.statusText}>Đang đồng bộ vệ tinh...</Text>
      </View>
    );
  }

  const isPending = currentOrder.status === 'PENDING';
  const isAccepted = currentOrder.status === 'ACCEPTED' || currentOrder.status === 'ARRIVED';
  
  // Lấy cấu hình hiển thị trạng thái hiện tại
  const currentDisplay = STATUS_DISPLAY[currentOrder.status] || STATUS_DISPLAY['PENDING'];

  const radarScale = pulseAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 3] });
  const radarOpacity = pulseAnim.interpolate({ inputRange: [0, 1], outputRange: [0.6, 0] });

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        
        {/* BẢN ĐỒ */}
        <MapView
          ref={mapRef}
          style={styles.map}
          initialRegion={{
            latitude: pickupLocation.latitude,
            longitude: pickupLocation.longitude,
            latitudeDelta: 0.015,
            longitudeDelta: 0.015,
          }}
          mapPadding={{ top: 0, right: 0, bottom: isPending ? 250 : 350, left: 0 }} // Đẩy Map lên cao hơn khi có thẻ thợ
        >
          <Marker coordinate={pickupLocation} title="Vị trí sự cố">
            <View style={styles.markerContainer}>
              {isPending && (
                <Animated.View style={[styles.radarRing, { transform: [{ scale: radarScale }], opacity: radarOpacity }]} />
              )}
              <View style={styles.userDot} />
            </View>
          </Marker>
          
          {mechanicLocation && !isPending && (
            <>
              <Marker coordinate={mechanicLocation} title="Thợ đang đến">
                <View style={styles.mechanicMarker}>
                  <MaterialCommunityIcons name="motorbike" size={20} color="#FFF" />
                </View>
              </Marker>
              
              <MapViewDirections
                origin={mechanicLocation}
                destination={pickupLocation}
                apikey={GOOGLE_API_KEY}
                strokeWidth={5}
                strokeColor="#0084FF"
                onReady={(result) => {
                  setDistance(result.distance);
                  setDuration(result.duration);
                  mapRef.current?.fitToCoordinates(result.coordinates, {
                    edgePadding: { top: 80, right: 50, bottom: 350, left: 50 },
                    animated: true,
                  });
                }}
              />
            </>
          )}
        </MapView>

        {/* Nút Back nổi */}
        <TouchableOpacity style={styles.backBtnWrapper} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-down" size={28} color="#333" />
        </TouchableOpacity>

        {/* THẺ THÔNG TIN BÊN DƯỚI */}
        <View style={styles.infoCard}>
          <View style={styles.handleBar} />
          
          {/* TRẠNG THÁI CUỐC XE */}
          <View style={styles.headerCard}>
            {isPending ? (
              <ActivityIndicator size="small" color="#FF4D4D" style={{ marginRight: 10 }} />
            ) : (
              <View style={[styles.pulseDot, { backgroundColor: currentDisplay.color, borderColor: `${currentDisplay.color}40` }]} />
            )}
            <View style={{ flex: 1 }}>
              <Text style={[styles.stateTitle, { color: currentDisplay.color }]}>
                {currentDisplay.title}
              </Text>
              
              {isAccepted && duration > 0 && (
                <Text style={styles.etaText}>
                  Cách bạn {distance.toFixed(1)} km • <Text style={{ color: '#0084FF' }}>Khoảng {Math.ceil(duration)} phút</Text>
                </Text>
              )}
            </View>
          </View>

          <View style={styles.divider} />

          {/* 🔥 KHU VỰC HIỂN THỊ ĐỘNG: Giao diện Đợi thợ vs Giao diện Đã có thợ */}
          {isPending ? (
            // GIAO DIỆN ĐANG QUÉT (PENDING)
            <View>
              <View style={styles.priceRow}>
                <Text style={styles.priceLabel}>Chi phí dự kiến:</Text>
                <Text style={styles.priceValue}>{currentOrder.priceEstimate?.toLocaleString('vi-VN')} Đ</Text>
              </View>
              <View style={styles.btnGroup}>
                <TouchableOpacity 
                  style={[styles.actionBtn, timeLeft > 0 ? styles.cancelBtn : styles.cancelBtnDisabled]}
                  onPress={handleCancelOrder}
                  disabled={isCancelling || timeLeft === 0}
                >
                  <Text style={[timeLeft > 0 ? styles.cancelBtnText : styles.cancelBtnTextDisabled]}>
                    {isCancelling ? 'ĐANG HỦY...' : timeLeft > 0 ? `Hủy cuốc (${timeLeft}s)` : 'Hết thời gian hủy'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            // GIAO DIỆN ĐÃ CÓ THỢ NHẬN (ACCEPTED/ARRIVED)
            <View>
              <View style={styles.mechanicProfile}>
                <Image source={{ uri: 'https://img.icons8.com/fluency/96/worker-male.png' }} style={styles.avatar} />
                <View style={styles.mechanicDetails}>
                  <Text style={styles.mechanicName}>{(currentOrder as any).mechanicName || (currentOrder as any).mechanic?.name || 'Thợ chuyên nghiệp'}</Text>
                  <View style={styles.ratingRow}>
                    <Ionicons name="star" size={14} color="#FFC700" />
                    <Text style={styles.ratingText}>4.9</Text>
                    {/* Lấy biển số xe thật từ đơn hàng, nếu chưa có thì hiển thị fallback */}
                  <Text style={styles.plateNumber}> • {currentOrder.licensePlate || 'Xe máy đối tác'}</Text>
                  </View>
                </View>
                <View style={styles.priceTag}>
                  <Text style={styles.priceTagText}>{currentOrder.priceEstimate?.toLocaleString('vi-VN')}đ</Text>
                </View>
              </View>

              <View style={styles.btnGroup}>
                {/* 🔥 Cập nhật sự kiện onPress cho nút Gọi */}
                <TouchableOpacity 
                  style={[styles.actionBtn, styles.callBtn]} 
                  onPress={handleCallMechanic}
                >
                  <Ionicons name="call" size={20} color="#FFF" />
                  <Text style={styles.callBtnText}>Gọi điện</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[styles.actionBtn, styles.chatBtn, { marginLeft: 12 }]} 
                  onPress={() => navigation.navigate('Chat', { orderId: currentOrder.id })}
                >
                  <Ionicons name="chatbubble-ellipses" size={20} color="#FFF" />
                  <Text style={styles.chatBtnText}>Nhắn tin</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFF' },
  container: { flex: 1 },
  map: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F9FAFB' },
  statusText: { fontSize: 16, color: '#4B5563', fontWeight: '600', marginTop: 12 },
  
  // Marker
  markerContainer: { width: 60, height: 60, justifyContent: 'center', alignItems: 'center' },
  radarRing: { position: 'absolute', width: 24, height: 24, borderRadius: 12, backgroundColor: '#FF4D4D' },
  userDot: { width: 16, height: 16, borderRadius: 8, backgroundColor: '#FF4D4D', borderWidth: 3, borderColor: '#FFF', elevation: 5 },
  mechanicMarker: { width: 34, height: 34, borderRadius: 17, backgroundColor: '#0084FF', justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#FFF', elevation: 5 },

  // Nút Back
  backBtnWrapper: { position: 'absolute', top: Platform.OS === 'ios' ? 10 : 20, left: 20, width: 44, height: 44, borderRadius: 22, backgroundColor: '#FFF', justifyContent: 'center', alignItems: 'center', elevation: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 4 },

  // Bottom Card
  infoCard: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#FFF', paddingHorizontal: 24, paddingBottom: Platform.OS === 'ios' ? 34 : 24, paddingTop: 12, borderTopLeftRadius: 30, borderTopRightRadius: 30, elevation: 20, shadowColor: '#000', shadowOffset: { width: 0, height: -10 }, shadowOpacity: 0.08, shadowRadius: 20 },
  handleBar: { width: 40, height: 5, borderRadius: 3, backgroundColor: '#E5E7EB', alignSelf: 'center', marginBottom: 20 },
  
  headerCard: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  pulseDot: { width: 14, height: 14, borderRadius: 7, marginRight: 12, borderWidth: 3 },
  stateTitle: { fontSize: 18, fontWeight: '900' },
  etaText: { fontSize: 14, color: '#6B7280', marginTop: 4, fontWeight: '700' },
  divider: { height: 1, backgroundColor: '#F3F4F6', marginBottom: 20 },
  
  // UI PENDING
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  priceLabel: { fontSize: 15, color: '#6B7280', fontWeight: '600' },
  priceValue: { fontSize: 22, color: '#10B981', fontWeight: '900' },
  
  // UI ACCEPTED (Thông tin thợ)
  mechanicProfile: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 20 },
  avatar: { width: 54, height: 54, borderRadius: 27, backgroundColor: '#F3F4F6', borderWidth: 1, borderColor: '#E5E7EB', marginTop: 3 },
  mechanicDetails: { flex: 1, marginLeft: 14 },
  mechanicName: { fontSize: 17, fontWeight: 'bold', color: '#1F2937' },
  ratingRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  ratingText: { fontSize: 13, color: '#4B5563', marginLeft: 4, fontWeight: '700' },
  plateNumber: { fontSize: 13, color: '#6B7280', fontWeight: '500' },
  priceTag: { backgroundColor: '#ECFDF5', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, marginTop: -3 },
  priceTagText: { color: '#10B981', fontWeight: 'bold', fontSize: 14 },

  // Buttons
  btnGroup: { flexDirection: 'row', justifyContent: 'space-between' },
  actionBtn: { flex: 1, flexDirection: 'row', paddingVertical: 14, borderRadius: 16, alignItems: 'center', justifyContent: 'center', elevation: 2 },
  
  cancelBtn: { backgroundColor: '#FEF2F2', borderWidth: 1, borderColor: '#FECACA' },
  cancelBtnText: { color: '#EF4444', fontWeight: 'bold', fontSize: 15 },
  cancelBtnDisabled: { backgroundColor: '#F3F4F6' },
  cancelBtnTextDisabled: { color: '#9CA3AF', fontWeight: 'bold', fontSize: 15 },

  callBtn: { backgroundColor: '#10B981' },
  callBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 15, marginLeft: 8 },
  chatBtn: { backgroundColor: '#0084FF' },
  chatBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 15, marginLeft: 8 },
});