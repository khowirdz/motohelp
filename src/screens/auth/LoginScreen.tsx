import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useDispatch } from 'react-redux';
import { loginSuccess } from '../../store/slices/authSlice';

export default function LoginScreen({ navigation }: any) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const dispatch = useDispatch();

  const handleMockLogin = (role: 'user' | 'mechanic') => {
    if (!phoneNumber.trim()) {
      Alert.alert('Thông báo', 'Vui lòng nhập số điện thoại.');
      return;
    }
    
    // Giả lập dữ liệu đăng nhập thành công gửi về Redux Store
    dispatch(loginSuccess({
      id: role === 'user' ? 'USR_001' : 'MEC_999',
      phoneNumber: phoneNumber,
      name: role === 'user' ? 'Mai Hồng Khởi' : 'Thợ Sửa Xe Bách Khoa',
      role: role
    }));
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
        onChangeText={setPhoneNumber}
      />

      <Text style={styles.hintText}>Chọn vai trò đăng nhập để thử nghiệm luồng:</Text>
      
      <TouchableOpacity style={[styles.button, styles.userBtn]} onPress={() => handleMockLogin('user')}>
        <Text style={styles.btnText}>Đăng nhập vai KHÁCH HÀNG</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.button, styles.mechanicBtn]} onPress={() => handleMockLogin('mechanic')}>
        <Text style={styles.btnText}>Đăng nhập vai THỢ SỬA XE</Text>
      </TouchableOpacity>
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