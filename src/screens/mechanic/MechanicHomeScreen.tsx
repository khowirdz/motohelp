/**
 * MechanicHomeScreen — Phong cách Grab Driver
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet, Text, View, Switch, TouchableOpacity,
  Animated, Dimensions, Alert
} from 'react-native';
import MapView, { Marker, Circle as MapCircle } from 'react-native-maps';
import { useLocation } from '../../hooks/useLocation';
import socketService from '../../services/socketService';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';

const { height: H } = Dimensions.get('window');

// Dữ liệu thống kê giả lập (thực tế lấy từ API)
const MOCK_STATS = { trips: 8, km: 42.3, rating: 4.9, earnings: 320000 };

export default function MechanicHomeScreen({ navigation }: any) {
  const { location } = useLocation();
  const user = useSelector((s: RootState) => s.auth.user);

  const [isAvailable, setIsAvailable] = useState(false);
  const [stats]  = useState(MOCK_STATS);

  // Pulse animation cho vòng tròn xung quanh marker
  const pulseAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!isAvailable) { 
      pulseAnim.setValue(0); 
      return; 
    }
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1, duration: 1500, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 0, duration: 500,  useNativeDriver: true }),
      ])
    ).start();
  }, [isAvailable, pulseAnim]);

  // Kết nối socket và lắng nghe đơn mới (Phiên bản đã gắn Radar theo dõi)
  useEffect(() => {
    socketService.connect();

    // 1. Gắn máy nghe lén mọi sự kiện chạy qua máy thợ
    const anyListener = (eventName: string, ...args: any[]) => {
      console.log(`[SOCKET THỢ] Bắt được sóng: ${eventName}`);
    };
    if (socketService.socket) {
      socketService.socket.onAny(anyListener);
    }

    // 2. Hàm xử lý khi có đơn mới
    const handleNewRequest = (orderData: any) => {
      console.log('🔥🔥🔥 CÓ ĐƠN MỚI TỚI:', orderData);
      
      // Bật còi báo động hiển thị lên màn hình
      Alert.alert(
        'TÍT TÍT! CÓ ĐƠN MỚI', 
        'Đang chuyển sang màn hình nhận cuốc...',
        [
          { 
            text: 'OK', 
            onPress: () => navigation.navigate('IncomingCall', { order: orderData })
          }
        ]
      );
    };

    // 3. Đăng ký lắng nghe
    socketService.on('new_rescue_request', handleNewRequest);

    // 4. SỬA LỖI CLEANUP CHUẨN: Bắt buộc phải truyền handleNewRequest vào
    return () => { 
      socketService.off('new_rescue_request', handleNewRequest); 
      if (socketService.socket) {
        socketService.socket.offAny(anyListener);
      }
    };
  }, [navigation]);

  // Báo trạng thái online/offline lên server
  useEffect(() => {
    const id = user?.id ?? `THO_${Math.floor(Math.random() * 999)}`;
    socketService.emit('mechanic_status_change', {
      mechanicId: id,
      status:     isAvailable ? 'ONLINE' : 'OFFLINE',
      name:       user?.name,
      location,
    });
  }, [isAvailable, user, location]);

  // Bắn GPS định kỳ khi online
  useEffect(() => {
    if (!isAvailable || !location) return;
    const id = user?.id ?? 'THO_GPS';
    const iv = setInterval(() => {
      socketService.emit('update_mechanic_location', {
        mechanicId: id,
        latitude:   location.latitude,
        longitude:  location.longitude,
      });
    }, 5000);
    return () => clearInterval(iv);
  }, [isAvailable, location, user]);

  if (!location) {
    return (
      <View style={styles.loading}>
        <Text style={styles.loadingText}>Đang định vị vệ tinh...</Text>
      </View>
    );
  }

  // Cấu hình thông số Animation
  const pulseScale  = pulseAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 2.5] });
  const pulseOpacity = pulseAnim.interpolate({ inputRange: [0, 1], outputRange: [0.6, 0] });

  return (
    <View style={styles.container}>
      {/* HEADER THU NHẬP */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerGreet}>Xin chào, {user?.name?.split(' ').pop() ?? 'Thợ'} 👋</Text>
          <Text style={styles.headerSub}>Hôm nay bạn đã kiếm được</Text>
        </View>
        <View style={styles.earningsBox}>
          <Text style={styles.earningsVal}>
            {stats.earnings.toLocaleString('vi-VN')}đ
          </Text>
          <Text style={styles.earningsSub}>{stats.trips} cuốc</Text>
        </View>
      </View>

      {/* BẢN ĐỒ */}
      <MapView
        style={styles.map}
        initialRegion={{
          latitude:      location.latitude,
          longitude:     location.longitude,
          latitudeDelta: 0.012,
          longitudeDelta: 0.010,
        }}
        showsUserLocation={false}
      >
        {/* Vòng tròn tĩnh giới hạn khu vực (Tùy chọn) */}
        {isAvailable && (
          <MapCircle
            center={location}
            radius={150}
            strokeColor="rgba(0,177,79,0.2)"
            fillColor="rgba(0,177,79,0.05)"
          />
        )}
        
        {/* 🔥 FIX BUG: Marker nhúng Animated.View để tạo sóng Radar */}
        <Marker coordinate={location} title={user?.name ?? 'Vị trí của bạn'} anchor={{ x: 0.5, y: 0.5 }}>
          <View style={styles.markerWrapper}>
            {isAvailable && (
              <Animated.View style={[
                styles.pulseRing, 
                { transform: [{ scale: pulseScale }], opacity: pulseOpacity }
              ]} />
            )}
            <View style={[styles.mechMarker, isAvailable && styles.mechMarkerOnline]}>
              <Text style={{ fontSize: 20 }}>🏍️</Text>
            </View>
          </View>
        </Marker>
      </MapView>

      {/* BADGE TRẠNG THÁI nổi trên bản đồ */}
      {isAvailable && (
        <View style={styles.onlineBadge}>
          <View style={styles.onlineDot} />
          <Text style={styles.onlineText}>Đang sẵn sàng nhận đơn</Text>
        </View>
      )}

      {/* PANEL DƯỚI */}
      <View style={styles.bottomPanel}>
        {/* Thống kê nhanh */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statVal}>{stats.trips}</Text>
            <Text style={styles.statLabel}>Cứu hộ hôm nay</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statVal}>{stats.km.toFixed(1)}</Text>
            <Text style={styles.statLabel}>Km đã di chuyển</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={[styles.statVal, { color: '#F59E0B' }]}>⭐ {stats.rating}</Text>
            <Text style={styles.statLabel}>Đánh giá</Text>
          </View>
        </View>

        {/* TOGGLE ONLINE */}
        <View style={[styles.toggleCard, isAvailable && styles.toggleCardOnline]}>
          <View style={styles.toggleInfo}>
            <Text style={styles.toggleTitle}>
              {isAvailable ? '🟢 Đang sẵn sàng' : '🔴 Đang nghỉ'}
            </Text>
            <Text style={styles.toggleSub}>
              {isAvailable
                ? 'Hệ thống đang ưu tiên điều phối đơn cứu hộ cho bạn'
                : 'Bật để nhận yêu cầu cứu hộ quanh đây'}
            </Text>
          </View>
          <Switch
            value={isAvailable}
            onValueChange={setIsAvailable}
            trackColor={{ false: '#D1D5DB', true: '#00B14F' }}
            thumbColor="#FFFFFF"
            ios_backgroundColor="#D1D5DB"
          />
        </View>

        {/* Nút chat nếu đang có đơn */}
        <TouchableOpacity style={styles.historyBtn} onPress={() => navigation.navigate('MechanicHistory')}>
          <Text style={styles.historyBtnText}>📋  Lịch sử cứu hộ</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F4F6' },
  loading:   { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFF' },
  loadingText: { fontSize: 15, color: '#4B5563', fontWeight: '500' },

  // Header
  header: {
    backgroundColor: '#00B14F',
    paddingTop: 54,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 5,
  },
  headerGreet: { fontSize: 17, fontWeight: '700', color: '#FFF' },
  headerSub:   { fontSize: 12, color: 'rgba(255,255,255,0.85)', marginTop: 2 },
  earningsBox: { alignItems: 'flex-end' },
  earningsVal: { fontSize: 22, fontWeight: '800', color: '#FFF' },
  earningsSub: { fontSize: 11, color: 'rgba(255,255,255,0.8)', marginTop: 1 },

  // Map
  map: { flex: 1 },

  // Sửa lỗi Animation Marker
  markerWrapper: { 
    width: 100, height: 100, 
    justifyContent: 'center', alignItems: 'center' 
  },
  pulseRing: { 
    position: 'absolute', 
    width: 38, height: 38, 
    borderRadius: 19, 
    backgroundColor: '#00B14F' 
  },
  mechMarker: {
    backgroundColor: '#FFF',
    borderRadius: 24,
    padding: 8,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    borderWidth: 2,
    borderColor: '#D1D5DB',
  },
  mechMarkerOnline: { borderColor: '#00B14F', borderWidth: 2.5 },

  // Badge online
  onlineBadge: {
    position: 'absolute',
    top: 20,
    alignSelf: 'center',
    backgroundColor: '#FFF',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 25,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  onlineDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#00B14F' },
  onlineText: { fontSize: 14, fontWeight: '700', color: '#1A1A2E' },

  // Bottom panel
  bottomPanel: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 36,
    elevation: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -5 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    gap: 16,
  },

  statsRow: {
    flexDirection: 'row',
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  statItem:    { flex: 1, alignItems: 'center' },
  statDivider: { width: 1, backgroundColor: '#E5E7EB', marginVertical: 4 },
  statVal:     { fontSize: 18, fontWeight: '800', color: '#1F2937' },
  statLabel:   { fontSize: 12, color: '#6B7280', marginTop: 4, fontWeight: '500' },

  toggleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
  },
  toggleCardOnline: {
    borderColor: '#00B14F40',
    backgroundColor: '#F0FDF4',
  },
  toggleInfo: { flex: 1 },
  toggleTitle: { fontSize: 16, fontWeight: '800', color: '#111827' },
  toggleSub:   { fontSize: 13, color: '#6B7280', marginTop: 4 },

  historyBtn: {
    backgroundColor: '#F3F4F6',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  historyBtnText: { fontSize: 15, fontWeight: '700', color: '#374151' },
});