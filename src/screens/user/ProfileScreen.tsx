import React from 'react';
import { View, Text, Button } from 'react-native';
import { useDispatch } from 'react-redux';
import { logout } from '../../store/slices/authSlice';

export default function ProfileScreen() {
  const dispatch = useDispatch();
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
      <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 20 }}>Thông tin tài khoản</Text>
      <Button title="Đăng xuất" color="red" onPress={() => dispatch(logout())} />
    </View>
  );
}