import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Switch, TouchableOpacity } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { useLocation } from '../../hooks/useLocation';
import socketService from '../../services/socketService';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';

export default function MechanicHomeScreen({ navigation }: any) {
  const { location } = useLocation();
  const [isAvailable, setIsAvailable] = useState(false);
  const user = useSelector((state: RootState) => state.auth.user);

  // Tự động gửi tọa độ lên server mỗi 5 giây nếu thợ đang ở trạng thái Sẵn sàng
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    
    if (isAvailable && location && user) {
      interval = setInterval(() => {
        socketService.emit('update_mechanic_location', {
          mechanicId: user.id,
          latitude: location.latitude,
          longitude: location.longitude,
        });
      }, 5000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isAvailable, location, user]);

  // Lắng nghe xem có cuốc cứu hộ khẩn cấp nào gửi tới không
  useEffect(() => {
    if (isAvailable) {
      socketService.on('new_rescue_request', (orderData) => {
        // Chuyển hướng sang màn hình nhận đơn khi có khách gọi cứu hộ
        navigation.navigate('IncomingCall', { order: orderData });
      });
    }
  }, [isAvailable]);

  if (!location) {
    return <View style={styles.center}><Text>Đang tải bản đồ...</Text></View>;
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
        <Marker 
          coordinate={{ latitude: location.latitude, longitude: location.longitude }}
          title="Vị trí của bạn (Thợ)"
          pinColor="blue"
        />
      </MapView>

      <View style={styles.statusCard}>
        <Text style={styles.statusText}>
          Trạng thái: {isAvailable ? '🟢 Đang sẵn sàng cứu hộ' : '🔴 Đang nghỉ'}
        </Text>
        <Switch
          value={isAvailable}
          onValueChange={(value) => setIsAvailable(value)}
          trackColor={{ false: '#767577', true: '#81b0ff' }}
          thumbColor={isAvailable ? '#f5dd4b' : '#f4f3f4'}
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
    position: 'absolute',
    bottom: 40,
    left: 20,
    right: 20,
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 5,
  },
  statusText: { fontSize: 16, fontWeight: 'bold' },
});