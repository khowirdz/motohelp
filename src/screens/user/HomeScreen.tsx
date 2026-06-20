import React, { useRef, useState, useEffect } from 'react';
import { 
  StyleSheet, Text, View, TouchableOpacity, TextInput,
  Dimensions, SafeAreaView, Platform, Keyboard, Image // 🔥 Import thêm Image
} from 'react-native';
import MapView, { Marker, Circle } from 'react-native-maps';
import { useLocation } from '../../hooks/useLocation';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

// 🔥 1. CẬP NHẬT MẢNG DATA: Dùng local assets (require) và màu shadow (Glow)
// 🎨 BỘ ICON 3D FLUENCY - CẮT SẴN, NỀN TRONG SUỐT, TỶ LỆ CHUẨN 1:1
const ISSUE_CATEGORIES = [
  { 
    id: '1', name: 'Thủng xăm', 
    imageUrl: 'https://img.icons8.com/fluency/96/wheel.png', 
    bgColor: '#ffefe5', shadowColor: '#FF8A00' //FFF0E5
  }, 
  { 
    id: '2', name: 'Hết xăng', 
    imageUrl: 'https://img.icons8.com/fluency/96/gas-station.png', 
    bgColor: '#e5f2ff', shadowColor: '#00aaff' 
  },     
  { 
    id: '3', name: 'Chết máy', 
    imageUrl: 'https://img.icons8.com/fluency/96/car-battery.png', 
    bgColor: '#F5E8FF', shadowColor: '#A020F0' 
  },  
  { 
    id: '4', name: 'Hỏng phanh', 
    imageUrl: 'https://img.icons8.com/fluency/96/maintenance.png',
    bgColor: '#FFE8EC', shadowColor: '#FF3B30' 
  },        
  { 
    id: '5', name: 'Sự cố khác', 
    imageUrl: 'https://img.icons8.com/fluency/96/general-warning-sign.png',
    bgColor: '#E5F9F1', shadowColor: '#00C853' 
  },    
];

export default function HomeScreen({ navigation }: any) {
  const { location } = useLocation();
  const mapRef = useRef<MapView>(null);
  const [address, setAddress] = useState('');

  // Logic map hiện tại của bạn
  useEffect(() => {
    if (location && mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: location.latitude,
        longitude: location.longitude,
        latitudeDelta: 0.0015,
        longitudeDelta: 0.0015,
      }, 1000); 
    }
  }, [location]);

  const handleSearchAddress = () => {
    Keyboard.dismiss();
    if (!address.trim()) return;
    alert(`Đang tìm tọa độ cho: ${address}\n(Cần kích hoạt Google Geocoding API)`);
  };

  if (!location) {
    return (
      <View style={styles.loadingContainer}>
        <MaterialCommunityIcons name="satellite-uplink" size={40} color="#0084FF" style={{ marginBottom: 10 }} />
        <Text style={styles.loadingText}>Đang kết nối vệ tinh định vị...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      
      {/* 1. BẢN ĐỒ CHIẾM KHÔNG GIAN LỚN */}
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={{
          latitude: location.latitude,
          longitude: location.longitude,
          latitudeDelta: 0.0015, 
          longitudeDelta: 0.0015,
        }}
        showsUserLocation={false}
        mapPadding={{ top: 0, right: 0, bottom: height * 0.35, left: 0 }}
      >
        <Circle
          center={location}
          radius={30}
          strokeWidth={0}
          fillColor="rgba(0, 132, 255, 0.15)"
        />
        
        <Marker coordinate={location} title="Vị trí đón thợ">
          <View style={styles.customMarker}>
            <MaterialCommunityIcons name="account" size={18} color="#FFF" />
          </View>
        </Marker>
      </MapView>

      {/* 2. THANH TÌM KIẾM BO TRÒN HIỆN ĐẠI */}
      <SafeAreaView style={styles.topSearchContainer} pointerEvents="box-none">
        <View style={styles.searchBar}>
          <View style={styles.searchIconBg}>
            <Ionicons name="location-sharp" size={24} color="#FF4D4D" />
          </View>
          
          <View style={styles.inputWrapper}>
            <Text style={styles.searchHint}>VỊ TRÍ ĐÓN THỢ HIỆN TẠI</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="Nhập địa chỉ cần gọi thợ..."
              placeholderTextColor="#888"
              value={address}
              onChangeText={setAddress}
              onSubmitEditing={handleSearchAddress}
              returnKeyType="search"
            />
          </View>

          <TouchableOpacity style={styles.searchBtn} onPress={handleSearchAddress}>
            <Ionicons name="search" size={22} color="#FFF" />
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      {/* 3. BOTTOM SHEET HIỂN THỊ DỊCH VỤ */}
      <View style={styles.bottomSheet}>
        <View style={styles.sheetHandle} />
        <Text style={styles.sheetTitle}>Bạn đang gặp sự cố gì?</Text>
        
        {/* LƯỚI ICON NỔI - Dàn đều 3 cột */}
        <View style={styles.gridContainer}>
          {ISSUE_CATEGORIES.map((item) => (
            <TouchableOpacity 
              key={item.id} 
              style={styles.gridItem}
              activeOpacity={0.6} // Tăng độ nhạy chạm
              onPress={() => navigation.navigate('SOS', { 
                issueType: item.id,
                location: location
               })}
            >
              {/* 🔥 2. Vòng tròn nền có hiệu ứng đổ bóng màu (Glow) */}
              <View style={[
                styles.iconCircle, 
                { backgroundColor: item.bgColor, shadowColor: item.shadowColor }
              ]}>
                {/* 🔥 3. Dùng Image 3D và load ảnh local */}
                <Image 
                  source={{ uri: item.imageUrl }}
                  style={styles.icon3D}
                  resizeMode="contain" 
                />
              </View>
              <Text style={styles.itemText} numberOfLines={1}>{item.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFF' },
  loadingText: { fontSize: 16, color: '#555', fontWeight: '500' },
  
  map: { flex: 1 },
  
  customMarker: { 
    width: 28, height: 28, borderRadius: 14, 
    backgroundColor: '#0084FF', justifyContent: 'center', alignItems: 'center', 
    borderWidth: 3, borderColor: '#FFF', 
    elevation: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, 
    shadowOpacity: 0.3, shadowRadius: 5 
  },

  topSearchContainer: { position: 'absolute', top: Platform.OS === 'ios' ? 10 : 50, left: 0, right: 0, paddingHorizontal: 20 },
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', borderRadius: 25, padding: 3, paddingLeft: 16, elevation: 15, shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.15, shadowRadius: 15 },
  searchIconBg: { marginRight: 12 },
  inputWrapper: { flex: 1, justifyContent: 'center', paddingVertical: 8 },
  searchHint: { fontSize: 10, color: '#555', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 0.5 },
  searchInput: { fontSize: 16, color: '#333', padding: 0, marginTop: 2 },
  searchBtn: { backgroundColor: '#0084FF', width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', marginLeft: 8 },

  bottomSheet: { 
    position: 'absolute', bottom: 0, left: 0, right: 0, 
    backgroundColor: '#FFF', borderTopLeftRadius: 30, borderTopRightRadius: 30, 
    paddingHorizontal: 20, paddingBottom: Platform.OS === 'ios' ? 40 : 30, paddingTop: 12, 
    elevation: 24, shadowColor: '#000', shadowOffset: { width: 0, height: -10 }, shadowOpacity: 0.1, shadowRadius: 20 
  },
  sheetHandle: { width: 40, height: 4, backgroundColor: '#DDD', borderRadius: 2, alignSelf: 'center', marginBottom: 20 },
  sheetTitle: { fontSize: 18, fontWeight: 'bold', color: '#111', marginBottom: 20, paddingHorizontal: 10 },
  
  // 🔥 4. STYLE MỚI CHO LƯỚI ICON 3D
  gridContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'flex-start' },
  gridItem: { width: '33.33%', alignItems: 'center', marginBottom: 24 },
  iconCircle: { 
    width: 68, height: 68, borderRadius: 34, 
    justifyContent: 'center', alignItems: 'center', marginBottom: 12,
    elevation: 8, // Nổi bật trên Android
    shadowOffset: { width: 0, height: 6 }, // Đổ bóng màu trên iOS (Hiệu ứng Glow)
    shadowOpacity: 0.35, 
    shadowRadius: 8,
  },
  icon3D: { 
    width: 42, 
    height: 42, 
  },
  itemText: { fontSize: 14, fontWeight: '700', color: '#333', textAlign: 'center' },
});