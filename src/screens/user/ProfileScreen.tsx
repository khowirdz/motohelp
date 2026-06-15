import React, { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { logout, loginSuccess } from '../../store/slices/authSlice';
import { RootState } from '../../store';
import { authService } from '../../services/authService';

export default function ProfileScreen() {
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.auth.user);
  const [name, setName] = useState(user?.name ?? '');
  const [editing, setEditing] = useState(false);

  const handleSave = async () => {
    if (!user) return;
    try {
      await authService.updateProfile(user.id, { name });
      dispatch(loginSuccess({ ...user, name }));
      setEditing(false);
    } catch {
      Alert.alert('Lỗi', 'Không thể cập nhật hồ sơ lúc này.');
    }
  };

  const avatarChar = (user?.name ?? user?.phoneNumber ?? '?')[0].toUpperCase();

  return (
    <View style={styles.container}>
      <View style={styles.avatarCircle}>
        <Text style={styles.avatarText}>{avatarChar}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Số điện thoại</Text>
        <Text style={styles.value}>{user?.phoneNumber}</Text>

        <Text style={styles.label}>Họ và tên</Text>
        {editing ? (
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Nhập tên của bạn..."
            autoFocus
          />
        ) : (
          <Text style={styles.value}>{name || 'Chưa cập nhật'}</Text>
        )}

        <Text style={styles.label}>Vai trò</Text>
        <Text style={styles.value}>{user?.role === 'mechanic' ? 'Thợ sửa xe' : 'Khách hàng'}</Text>
      </View>

      {editing ? (
        <View style={styles.btnRow}>
          <TouchableOpacity
            style={styles.cancelBtn}
            onPress={() => { setEditing(false); setName(user?.name ?? ''); }}
          >
            <Text style={styles.cancelBtnText}>Hủy</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
            <Text style={styles.saveBtnText}>Lưu</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity style={styles.editBtn} onPress={() => setEditing(true)}>
          <Text style={styles.editBtnText}>Chỉnh sửa hồ sơ</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity style={styles.logoutBtn} onPress={() => dispatch(logout())}>
        <Text style={styles.logoutBtnText}>Đăng xuất</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
    paddingTop: 60,
    alignItems: 'center',
  },
  avatarCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#ff4d4d',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  avatarText: { color: '#fff', fontSize: 32, fontWeight: 'bold' },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    width: '100%',
    marginBottom: 16,
    elevation: 1,
  },
  label: { fontSize: 12, color: '#888', marginTop: 12, marginBottom: 2 },
  value: { fontSize: 16, color: '#333', fontWeight: '500' },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    fontSize: 15,
    marginTop: 4,
  },
  btnRow: { flexDirection: 'row', width: '100%', gap: 10, marginBottom: 12 },
  cancelBtn: {
    flex: 1,
    backgroundColor: '#eee',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelBtnText: { color: '#555', fontWeight: 'bold', fontSize: 15 },
  saveBtn: {
    flex: 1,
    backgroundColor: '#457B9D',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
  editBtn: {
    backgroundColor: '#457B9D',
    paddingVertical: 14,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
    marginBottom: 12,
  },
  editBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
  logoutBtn: {
    backgroundColor: '#ff4d4d',
    paddingVertical: 14,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
  },
  logoutBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
});
