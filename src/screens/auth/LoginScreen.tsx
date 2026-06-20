import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useDispatch } from 'react-redux';
import { loginSuccess } from '../../store/slices/authSlice';

// 🚀 CƠ SỞ DỮ LIỆU GIẢ LẬP: Danh sách thợ đã được công ty cấp tài khoản
const COMPANY_MECHANICS = [
  { id: 'MEC_001', phone: '0342575103', name: 'Mai Hồng Khởi', licensePlate: 'Honda Wave • 29A1-123.45' },
  { id: 'MEC_002', phone: '0922222222', name: 'Trần Văn Hoàng', licensePlate: 'Yamaha Sirius • 30F2-987.65' },
  { id: 'MEC_003', phone: '0933333333', name: 'Lê Tuấn Anh', licensePlate: 'Honda Winner • 29E1-555.55' }
];

// 🚀 CƠ SỞ DỮ LIỆU GIẢ LẬP: Khách hàng cũ đã từng sử dụng app
const MOCK_CUSTOMERS = [
  { id: 'USR_001', phone: '0988888888', name: 'Nguyễn Khách Hàng' },
  { id: 'USR_002', phone: '0977777777', name: 'Trần Khách Test' }
];

export default function LoginScreen({ navigation }: any) {
  const [phoneNumber, setPhoneNumber] = useState('');
  
  // 🔥 Thêm State quản lý Họ tên cho khách mới
  const [customerName, setCustomerName] = useState('');
  const [isNewCustomer, setIsNewCustomer] = useState(false);

  const dispatch = useDispatch();

  const handleMockLogin = (role: 'user' | 'mechanic') => {
    if (!phoneNumber.trim()) {
      Alert.alert('Thông báo', 'Vui lòng nhập số điện thoại.');
      return;
    }
    
    // 1. XỬ LÝ ĐĂNG NHẬP CHO THỢ SỬA XE (Giữ nguyên)
    if (role === 'mechanic') {
      const mechanicData = COMPANY_MECHANICS.find(m => m.phone === phoneNumber);

      if (!mechanicData) {
        Alert.alert(
          'Từ chối truy cập', 
          'Số điện thoại này chưa được đăng ký làm Thợ đối tác. (Mẹo: Thử nhập 0342575103 hoặc 0922222222)'
        );
        return; 
      }

      dispatch(loginSuccess({
        id: mechanicData.id,
        phoneNumber: mechanicData.phone,
        name: mechanicData.name,         
        role: 'mechanic',
        licensePlate: mechanicData.licensePlate 
      }));
    } 
    
    // 2. 🔥 XỬ LÝ ĐĂNG NHẬP CHO KHÁCH HÀNG (Đã nâng cấp)
    else {
      // Tìm xem số điện thoại này đã có trong dữ liệu khách cũ chưa
      const existingCustomer = MOCK_CUSTOMERS.find(c => c.phone === phoneNumber);

      if (existingCustomer) {
        // Nếu là khách cũ -> Đăng nhập luôn
        dispatch(loginSuccess({
          id: existingCustomer.id,
          phoneNumber: existingCustomer.phone,
          name: existingCustomer.name,
          role: 'user'
        }));
      } else {
        // Nếu là số điện thoại mới tinh
        if (!isNewCustomer) {
          setIsNewCustomer(true); // Mở ô nhập tên
          Alert.alert('Chào bạn mới!', 'Vui lòng nhập Họ và Tên của bạn để thợ dễ dàng liên hệ nhé.');
          return;
        }

        if (!customerName.trim()) {
          Alert.alert('Thông báo', 'Vui lòng nhập đầy đủ Họ và Tên.');
          return;
        }

        // Đăng ký khách mới và cho vào app
        dispatch(loginSuccess({
          id: 'USR_' + Date.now(), // Random ID cho khách mới
          phoneNumber: phoneNumber,
          name: customerName,
          role: 'user'
        }));
      }
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.logo}>MotoCứu 🛠️</Text>
      <Text style={styles.subTitle}>Ứng dụng cứu hộ xe máy khẩn cấp</Text>

      <TextInput
        style={styles.input}
        placeholder="Nhập số điện thoại của bạn..."
        keyboardType="phone-pad"
        value={phoneNumber}
        onChangeText={(text) => {
          setPhoneNumber(text);
          setIsNewCustomer(false); // Reset lại nếu khách đổi ý nhập số khác
        }}
      />

      {/* 🔥 Ô NHẬP TÊN (Chỉ hiện khi khách nhập số lạ và bấm Đăng nhập) */}
      {isNewCustomer && (
        <TextInput
          style={[styles.input, { borderColor: '#ff4d4d', backgroundColor: '#FFF5F5' }]}
          placeholder="Nhập Họ và Tên của bạn..."
          value={customerName}
          onChangeText={setCustomerName}
          autoFocus={true} // Bật sẵn bàn phím
        />
      )}

      <Text style={styles.hintText}>Chọn vai trò đăng nhập để thử nghiệm luồng:</Text>
      
      <TouchableOpacity style={[styles.button, styles.userBtn]} onPress={() => handleMockLogin('user')}>
        <Text style={styles.btnText}>
          {isNewCustomer ? 'Xác nhận & Vào App' : 'Đăng nhập vai KHÁCH HÀNG'}
        </Text>
      </TouchableOpacity>

      {/* Tạm ẩn nút Thợ nếu đang trong quá trình khách mới nhập tên để tránh bấm nhầm */}
      {!isNewCustomer && (
        <TouchableOpacity style={[styles.button, styles.mechanicBtn]} onPress={() => handleMockLogin('mechanic')}>
          <Text style={styles.btnText}>Đăng nhập vai THỢ SỬA XE</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', justifyContent: 'center', padding: 20 },
  logo: { fontSize: 36, fontWeight: 'bold', color: '#ff4d4d', textAlign: 'center', marginBottom: 5 },
  subTitle: { fontSize: 16, color: '#666', textAlign: 'center', marginBottom: 40 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 15, fontSize: 16, marginBottom: 25 },
  hintText: { fontSize: 14, color: '#888', marginBottom: 12, textAlign: 'center' },
  button: { paddingVertical: 15, borderRadius: 8, alignItems: 'center', marginBottom: 15 },
  userBtn: { backgroundColor: '#ff4d4d' },
  mechanicBtn: { backgroundColor: '#0084ff' },
  btnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});