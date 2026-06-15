import React, { useState } from 'react';
import { 
  StyleSheet, Text, View, TouchableOpacity, TextInput, Alert, 
  KeyboardAvoidingView, Platform, ScrollView 
} from 'react-native';
import { ISSUE_TYPES } from '../../constants';
import apiClient from '../../services/api';
import socketService from '../../services/socketService';
import { useDispatch, useSelector } from 'react-redux'; // 🔥 Bổ sung useSelector
import { setCurrentOrder } from '../../store/slices/orderSlice';
import { RootState } from '../../store'; // 🔥 Bổ sung RootState để lấy type cho Redux

export default function SOSScreen({ route, navigation }: any) {
  const { userLocation } = route.params;
  const dispatch = useDispatch();
  
  // 🔥 LẤY THÔNG TIN TÀI KHOẢN KHÁCH HÀNG TỪ REDUX
  const user = useSelector((state: RootState) => state.auth.user);

  const [selectedIssue, setSelectedIssue] = useState<string | null>(null);
  const [basePrice, setBasePrice] = useState<number>(0);
  const [description, setDescription] = useState('');
  const [issubmitting, setIsSubmitting] = useState(false);

  const handleSelectIssue = (id: string, price: number) => {
    setSelectedIssue(id);
    setBasePrice(price);
  };

  const handleSendRequest = async () => {
    if (!selectedIssue) {
      Alert.alert('Thông báo', 'Vui lòng lựa chọn loại sự cố bạn đang gặp phải.');
      return;
    }

    setIsSubmitting(true);
    try {
      // 1. Gửi request tạo đơn hàng lên Backend kèm theo Số Điện Thoại
      const response = await apiClient.post('/orders/create', {
        issueType: selectedIssue,
        description: description,
        userLocation: userLocation,
        priceEstimate: basePrice, 
        userPhone: user?.phoneNumber, // 🔥 KẸP SỐ ĐIỆN THOẠI VÀO ĐÂY ĐỂ GỬI CHO THỢ
      });

      const newOrder = response.data.order;
      dispatch(setCurrentOrder(newOrder));

      console.log('📡 [App Khách] Chuẩn bị phát sóng SOS cho đơn:', newOrder.id);

      // 2. Bắn tín hiệu phòng cứu hộ qua WebSocket
      socketService.emit('create_rescue_room', { orderId: newOrder.id, location: userLocation });

      // 3. Chuyển sang màn hình Tracking
      navigation.navigate('Tracking', { orderId: newOrder.id });
      
    } catch (error: any) {
      console.error('Lỗi khi gửi yêu cầu cứu hộ:', error.response?.data || error.message);
      Alert.alert('Lỗi kết nối', 'Không thể gửi yêu cầu lúc này. Hãy kiểm tra lại IP mạng của bạn!');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        <Text style={styles.title}>Chọn sự cố xe gặp phải</Text>

        <View style={{ marginBottom: 10 }}>
          {ISSUE_TYPES.map((item) => {
            const isSelected = selectedIssue === item.id;
            return (
              <TouchableOpacity
                key={item.id}
                style={[styles.issueCard, isSelected && styles.selectedCard]}
                onPress={() => handleSelectIssue(item.id, item.price)}
              >
                <Text style={[styles.issueLabel, isSelected && styles.selectedText]}>
                  {item.label}
                </Text>
                {item.price > 0 && (
                  <Text style={styles.priceHint}>
                    Giá sàn: {item.price.toLocaleString('vi-VN')} Đ
                  </Text>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={styles.subTitle}>Mô tả thêm (Không bắt buộc)</Text>
        <TextInput
          style={styles.input}
          placeholder="Ví dụ: Xe Wave Alpha bị cán đinh vít, cần vá săm gấp..."
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={3}
        />

        <TouchableOpacity
          style={[styles.submitBtn, issubmitting && { backgroundColor: '#ccc' }]}
          onPress={handleSendRequest}
          disabled={issubmitting}
        >
          <Text style={styles.submitBtnText}>
            {issubmitting ? 'ĐANG GỬI YÊU CẦU...' : 'XÁC NHẬN GỌI THỢ'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 20, paddingTop: 60 },
  title: { fontSize: 20, fontWeight: 'bold', color: '#333', marginBottom: 20 },
  subTitle: { fontSize: 16, fontWeight: 'bold', color: '#555', marginTop: 10, marginBottom: 10 },
  issueCard: {
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectedCard: { borderColor: '#ff4d4d', backgroundColor: '#fff5f5' },
  issueLabel: { fontSize: 16, color: '#333' },
  selectedText: { color: '#ff4d4d', fontWeight: 'bold' },
  priceHint: { fontSize: 14, color: '#2ecc71', fontWeight: '600' },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    textAlignVertical: 'top',
    fontSize: 15,
    marginBottom: 30,
    minHeight: 80, 
  },
  submitBtn: {
    backgroundColor: '#ff4d4d',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});