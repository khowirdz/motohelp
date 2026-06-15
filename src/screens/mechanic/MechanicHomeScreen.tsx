import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Switch, Alert } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { useLocation } from '../../hooks/useLocation';
import socketService from '../../services/socketService';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';

export default function MechanicHomeScreen({ navigation }: any) {
  const { location } = useLocation();
  const [isAvailable, setIsAvailable] = useState(false);
  const user = useSelector((state: RootState) => state.auth.user);

  // ---------------------------------------------------------
  // KHỐI 1: LẮNG NGHE ĐƠN HÀNG (TAI NGHE LUÔN LUÔN BẬT 24/24)
  // ---------------------------------------------------------
  useEffect(() => {
    socketService.connect();
    console.log('🎧 [MÁY THỢ] Đã đeo tai nghe, sẵn sàng đón lõng cuốc xe!');

    const handleNewRequest = (orderData: any) => {
      console.log('🔥 BÙM! [MÁY THỢ] ĐÃ BẮT ĐƯỢC ĐƠN:', orderData);
      
      // Bắn thẳng thông báo ra màn hình để báo hiệu chắc chắn tín hiệu đã tới
      Alert.alert(
        '🚨 CÓ YÊU CẦU CỨU HỘ!', 
        'Bạn vừa nhận được một đơn mới, chuyển hướng ngay!'
      );
      
      // Chuyển sang màn hình nhận cuốc
      navigation.navigate('IncomingCall', { order: orderData });
    };

    // Mở luồng lắng nghe Socket
    socketService.on('new_rescue_request', handleNewRequest);

    return () => {
      console.log('🔇 [MÁY THỢ] Tháo tai nghe...');
      socketService.off('new_rescue_request');
    };
  }, []); // Cặp ngoặc [] rỗng cực kỳ quan trọng: Giúp tai nghe không bị rơi ra khi bạn gạt công tắc

  // ---------------------------------------------------------
  // KHỐI 2: QUẢN LÝ CÔNG TẮC BÁO CÁO LÊN SERVER
  // ---------------------------------------------------------
  useEffect(() => {
    const currentMechanicId = user?.id || `THO_TEST_${Math.floor(Math.random() * 1000)}`;

    if (isAvailable) {
      console.log('🟢 [MÁY THỢ] Báo cáo Server: Đang sẵn sàng');
      socketService.emit('mechanic_status_change', { mechanicId: currentMechanicId, status: 'ONLINE' });
    } else {
      console.log('🔴 [MÁY THỢ] Báo cáo Server: Đi ngủ');
      socketService.emit('mechanic_status_change', { mechanicId: currentMechanicId, status: 'OFFLINE' });
    }
  }, [isAvailable, user]);

  // ---------------------------------------------------------
  // KHỐI 3: LUỒNG AUTO BẮN TỌA ĐỘ GPS 5 GIÂY / LẦN
  // ---------------------------------------------------------
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isAvailable && location) {
      const currentMechanicId = user?.id || 'THO_TEST_GPS';
      interval = setInterval(() => {
        socketService.emit('update_mechanic_location', {
          mechanicId: currentMechanicId,
          latitude: location.latitude,
          longitude: location.longitude,
        });
      }, 5000);
    }
    return () => { if (interval) clearInterval(interval); };
  }, [isAvailable, location, user]);

  if (!location) {
    return <View style={styles.center}><Text>Đang tải bản đồ định vị...</Text></View>;
  }

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: location.latitude,
          longitude: location.longitude,
          latitudeDelta: 0.015,
          longitudeDelta: 0.0121,
        }}
      >
        <Marker coordinate={location} title="Vị trí của bạn" pinColor="blue" />
      </MapView>

      <View style={styles.statusCard}>
        <Text style={styles.statusText}>
          Trạng thái: {isAvailable ? '🟢 Sẵn sàng nhận cuốc' : '🔴 Đang nghỉ'}
        </Text>
        <Switch
          value={isAvailable}
          onValueChange={(value) => setIsAvailable(value)}
          trackColor={{ false: '#767577', true: '#e74c3c' }}
          thumbColor={isAvailable ? '#fff' : '#f4f3f4'}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  statusCard: {
    position: 'absolute', bottom: 40, left: 20, right: 20,
    backgroundColor: 'white', padding: 20, borderRadius: 12,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    elevation: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 3.84,
  },
  statusText: { fontSize: 16, fontWeight: 'bold', color: '#333' },
});