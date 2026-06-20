import React, { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View, ScrollView } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { logout, loginSuccess } from '../../store/slices/authSlice';
import { RootState } from '../../store';
import { authService } from '../../services/authService';

export default function ProfileScreen({ navigation }: any) {
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.auth.user);
  const [name, setName] = useState(user?.name ?? '');
  const [editing, setEditing] = useState(false);

  const handleSave = async () => {
    if (!user) return;
    console.log("📡 Đang gửi cập nhật cho user:", user.id, "với data:", { name });
    try {
      await authService.updateProfile(user.id, { name });
      dispatch(loginSuccess({ ...user, name }));
      setEditing(false);
      Alert.alert('Thành công', 'Thông tin đã được cập nhật');
    } catch {
      Alert.alert('Lỗi', 'Không thể cập nhật hồ sơ.');
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* 1. HEADER AVATAR */}
      <View style={styles.avatarSection}>
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarText}>{(user?.name ?? '?')[0].toUpperCase()}</Text>
        </View>
        <Text style={styles.userNameHeader}>{user?.name || 'Người dùng mới'}</Text>
        <Text style={styles.userRole}>{user?.role === 'mechanic' ? 'Thợ sửa xe chuyên nghiệp' : 'Khách hàng'}</Text>
      </View>

      {/* 2. NHÓM THÔNG TIN CÁ NHÂN */}
      <Text style={styles.sectionTitle}>Thông tin cá nhân</Text>
      <View style={styles.card}>
        <ProfileRow icon="phone-portrait-outline" label="Số điện thoại" value={user?.phoneNumber} />
        <View style={styles.divider} />
        <View style={styles.row}>
          <Ionicons name="person-outline" size={20} color="#666" />
          <View style={styles.rowContent}>
            <Text style={styles.label}>Họ và tên</Text>
            {editing ? (
              <TextInput style={styles.input} value={name} onChangeText={setName} autoFocus />
            ) : (
              <Text style={styles.value}>{name || 'Chưa cập nhật'}</Text>
            )}
          </View>
        </View>
      </View>

      {/* 3. NHÓM TIỆN ÍCH (Mới thêm) */}
      <Text style={styles.sectionTitle}>Tiện ích</Text>
      <View style={styles.card}>
        <MenuItem icon="history" label="Lịch sử cứu hộ" onPress={() => navigation.navigate('History')} />
        <MenuItem icon="map-marker-outline" label="Địa chỉ đã lưu" onPress={() => {}} />
        <MenuItem icon="shield-check-outline" label="Chính sách bảo mật" onPress={() => {}} />
      </View>

      {/* 4. NÚT CHỨC NĂNG CHÍNH */}
      {editing ? (
        <View style={styles.btnRow}>
          <TouchableOpacity style={styles.cancelBtn} onPress={() => setEditing(false)}><Text style={styles.cancelBtnText}>Hủy</Text></TouchableOpacity>
          <TouchableOpacity style={styles.saveBtn} onPress={handleSave}><Text style={styles.saveBtnText}>Lưu thay đổi</Text></TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity style={styles.editBtn} onPress={() => setEditing(true)}>
          <Text style={styles.editBtnText}>Chỉnh sửa hồ sơ</Text>
        </TouchableOpacity>
      )}

      {/* 5. ĐĂNG XUẤT */}
      <TouchableOpacity style={styles.logoutBtn} onPress={() => dispatch(logout())}>
        <Ionicons name="log-out-outline" size={20} color="#FF4D4D" />
        <Text style={styles.logoutBtnText}>Đăng xuất</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

// Sub-components giúp code sạch
const ProfileRow = ({ icon, label, value }: any) => (
  <View style={styles.row}>
    <Ionicons name={icon} size={20} color="#666" />
    <View style={styles.rowContent}><Text style={styles.label}>{label}</Text><Text style={styles.value}>{value}</Text></View>
  </View>
);

const MenuItem = ({ icon, label, onPress }: any) => (
  <TouchableOpacity style={styles.menuItem} onPress={onPress}>
    <MaterialCommunityIcons name={icon} size={22} color="#0084FF" />
    <Text style={styles.menuLabel}>{label}</Text>
    <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  content: { padding: 20, paddingTop: 40 },
  avatarSection: { alignItems: 'center', marginBottom: 30 },
  avatarCircle: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#0084FF', justifyContent: 'center', alignItems: 'center', elevation: 5 },
  avatarText: { color: '#fff', fontSize: 40, fontWeight: 'bold' },
  userNameHeader: { fontSize: 22, fontWeight: '800', marginTop: 15 },
  userRole: { fontSize: 14, color: '#888', marginTop: 5 },
  sectionTitle: { fontSize: 13, fontWeight: '700', color: '#666', marginBottom: 8, marginTop: 10, textTransform: 'uppercase' },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 20, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, elevation: 2 },
  row: { flexDirection: 'row', alignItems: 'center', marginVertical: 8 },
  rowContent: { marginLeft: 15, flex: 1 },
  divider: { height: 1, backgroundColor: '#EEE', marginVertical: 10 },
  label: { fontSize: 12, color: '#999' },
  value: { fontSize: 16, color: '#333', fontWeight: '600', marginTop: 2 },
  input: { borderBottomWidth: 1, borderColor: '#0084FF', paddingVertical: 4, fontSize: 16 },
  menuItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
  menuLabel: { flex: 1, marginLeft: 15, fontSize: 15, fontWeight: '500' },
  btnRow: { flexDirection: 'row', gap: 10, marginTop: 20 },
  cancelBtn: { flex: 1, paddingVertical: 15, borderRadius: 12, backgroundColor: '#F0F0F0', alignItems: 'center' },
  saveBtn: { flex: 1, paddingVertical: 15, borderRadius: 12, backgroundColor: '#0084FF', alignItems: 'center' },
  cancelBtnText: { color: '#555', fontWeight: 'bold' },
  saveBtnText: { color: '#fff', fontWeight: 'bold' },
  editBtn: { paddingVertical: 15, borderRadius: 12, backgroundColor: '#FFF', borderWidth: 1, borderColor: '#0084FF', alignItems: 'center', marginTop: 20 },
  editBtnText: { color: '#0084FF', fontWeight: 'bold' },
  logoutBtn: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 30, padding: 15 },
  logoutBtnText: { color: '#FF4D4D', fontWeight: 'bold', marginLeft: 8, fontSize: 16 },
});