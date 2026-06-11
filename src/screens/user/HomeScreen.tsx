import React, { useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ActivityIndicator } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { useLocation } from '../../hooks/useLocation';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { setNearbyMechanics } from '../../store/slices/orderSlice';
import socketService from '../../services/socketService';

export default function HomeScreen({ navigation }: any) {
  const { location, loading, errorMsg } = useLocation();
  const dispatch = useDispatch();
  const nearbyMechanics = useSelector((state: RootState) => state.order.nearbyMechanics);

  useEffect(() => {
    // Kết nối socket khi vào trang chủ
    socketService.connect();

    // Lắng nghe danh sách thợ sửa xe xung quanh được cập nhật từ Server
    socketService.on('nearby_mechanics_list', (mechanics) => {
      dispatch(setNearbyMechanics(mechanics));
    });

    return () => {
      socketService.disconnect();
    };
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#ff4d4d" />
        <Text style={styles.loadingText}>Đang xác định vị trí GPS của bạn...</Text>
      </View>
    );
  }

  if (errorMsg) {
    return <View style={styles.center}><Text style={styles.errorText}>{errorMsg}</Text></View>;
  }

  return (
    <View style={styles.container}>
      {location && (
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: location.latitude,
            longitude: location.longitude,
            latitudeDelta: 0.015,
            longitudeDelta: 0.0121,
          }}
        >
          {/* Marker vị trí của người dùng */}
          <Marker
            coordinate={{ latitude: location.latitude, longitude: location.longitude }}
            title="Vị trí của bạn"
            pinColor="red"
          />

          {/* Hiển thị các thợ sửa xe xung quanh */}
          {nearbyMechanics.map((mechanic) => (
            <Marker
              key={mechanic.id}
              coordinate={{
                latitude: mechanic.location.latitude,
                longitude: mechanic.location.longitude,
              }}
              title={mechanic.name}
              description={`Đánh giá: ⭐ ${mechanic.rating}`}
              pinColor="blue"
            />
          ))}
        </MapView>
      )}

      {/* Nút Gọi cứu hộ khẩn cấp SOS */}
      <View style={styles.actionContainer}>
        <TouchableOpacity
          style={styles.sosButton}
          onPress={() => navigation.navigate('SOS', { userLocation: location })}
        >
          <Text style={styles.sosText}>SOS</Text>
          <Text style={styles.sosSubText}>GỌI CỨU HỘ KHẨN CẤP</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  loadingText: { marginTop: 10, fontSize: 15, color: '#666' },
  errorText: { fontSize: 16, color: 'red', fontWeight: 'bold' },
  actionContainer: {
    position: 'absolute',
    bottom: 50,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  sosButton: {
    backgroundColor: '#ff4d4d',
    width: 140,
    height: 140,
    borderRadius: 70,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    borderWidth: 4,
    borderColor: '#fff',
  },
  sosText: { color: '#fff', fontSize: 32, fontWeight: 'bold', letterSpacing: 1 },
  sosSubText: { color: '#fff', fontSize: 9, fontWeight: 'bold', marginTop: 2 },
});