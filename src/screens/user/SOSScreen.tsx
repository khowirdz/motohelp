import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, Text, View, TouchableOpacity, TextInput, Alert, 
  KeyboardAvoidingView, Platform, ScrollView 
} from 'react-native';
import { ISSUE_TYPES } from '../../constants';
import apiClient from '../../services/api';
import socketService from '../../services/socketService';
import { useDispatch, useSelector } from 'react-redux';
import { setCurrentOrder } from '../../store/slices/orderSlice';
import { RootState } from '../../store';
import { Ionicons } from '@expo/vector-icons'; // 🔥 Import thêm icon để làm dấu tích xanh

export default function SOSScreen({ route, navigation }: any) {
  // Lấy thêm preSelectedIssue từ màn hình Home truyền sang
  const { location: userLocation, issueType: preSelectedIssue } = route.params || {};
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.auth.user);

  // Khởi tạo state với giá trị mặc định là lỗi được truyền từ Home sang
  const [selectedIssue, setSelectedIssue] = useState<string | null>(preSelectedIssue || null);
  const [basePrice, setBasePrice] = useState<number>(0);
  const [description, setDescription] = useState('');
  const [issubmitting, setIsSubmitting] = useState(false);

  // Bật kết nối Socket ngay khi vừa mở màn hình SOS
  useEffect(() => {
    socketService.connect();
  }, []);

  // Tự động lấy giá tiền của lỗi nếu được chọn sẵn từ Home
  useEffect(() => {
    if (preSelectedIssue) {
      const issueDetails = ISSUE_TYPES.find(item => item.id === preSelectedIssue);
      if (issueDetails) {
        setBasePrice(issueDetails.price);
      }
    }
  }, [preSelectedIssue]);

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
      // Gửi request tạo đơn hàng lên Backend
      const response = await apiClient.post('/orders/create', {
        userId: user?.id,
        userName: user?.name,
        issueType: selectedIssue,
        description: description,
        userLocation: userLocation,
        priceEstimate: basePrice, 
        userPhone: user?.phoneNumber,
      });

      const newOrder = response.data.order;
      dispatch(setCurrentOrder(newOrder));

      console.log('📡 [App Khách] Chuẩn bị phát sóng SOS cho đơn:', newOrder.id);

      // Bắn tín hiệu phòng cứu hộ qua WebSocket
      socketService.emit('create_rescue_room', { orderId: newOrder.id, location: userLocation });

      // Chuyển sang màn hình Tracking
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
        <Text style={styles.title}>Xác nhận sự cố</Text>

        <View style={{ marginBottom: 10 }}>
          {ISSUE_TYPES.map((item) => {
            const isSelected = selectedIssue === item.id;
            return (
              <TouchableOpacity
                key={item.id}
                style={[styles.issueCard, isSelected && styles.selectedCard]}
                onPress={() => handleSelectIssue(item.id, item.price)}
                activeOpacity={0.7}
              >
                <View>
                  <Text style={[styles.issueLabel, isSelected && styles.selectedText]}>
                    {item.label}
                  </Text>
                  {item.price > 0 && (
                    <Text style={styles.priceHint}>
                      Giá sàn: {item.price.toLocaleString('vi-VN')} Đ
                    </Text>
                  )}
                </View>

                {/* 🔥 HIỆU ỨNG NỔI BẬT: Thêm dấu tích xanh khi được chọn */}
                {isSelected && (
                  <Ionicons name="checkmark-circle" size={24} color="#0084FF" />
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={styles.subTitle}>Mô tả chi tiết tình trạng (Không bắt buộc)</Text>
        <TextInput
          style={styles.input}
          placeholder="Ví dụ: Xe dắt bị nặng bánh, nghi bị lủng xăm..."
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
            {issubmitting ? 'ĐANG ĐIỀU PHỐI THỢ...' : 'XÁC NHẬN GỌI THỢ'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB', padding: 20, paddingTop: 60 }, // Nền sáng hơn một chút
  title: { fontSize: 24, fontWeight: '900', color: '#1F2937', marginBottom: 20 },
  subTitle: { fontSize: 15, fontWeight: '700', color: '#4B5563', marginTop: 10, marginBottom: 10 },
  
  // Style mặc định của thẻ sự cố
  issueCard: {
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 14, // Bo góc mềm mại hơn
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1, // Đổ bóng nhẹ cho thẻ mặc định
  },
  
  // 🔥 HIỆU ỨNG NỔI BẬT: Style khi thẻ được chọn
  selectedCard: { 
    borderColor: '#0084FF', 
    backgroundColor: '#F0F8FF', // Nền xanh nhạt chuẩn UI/UX
    borderWidth: 2, // Viền đậm hơn để gây chú ý
    elevation: 4,
    shadowColor: '#0084FF', 
    shadowOffset: { width: 0, height: 4 }, 
    shadowOpacity: 0.15, 
    shadowRadius: 6
  },
  
  issueLabel: { fontSize: 16, color: '#374151', fontWeight: '600' },
  selectedText: { color: '#0084FF', fontWeight: '800' },
  priceHint: { fontSize: 14, color: '#10B981', fontWeight: '700', marginTop: 4 }, // Màu xanh lá nổi bật giá tiền
  
  input: {
    backgroundColor: '#FFF',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 14,
    padding: 16,
    textAlignVertical: 'top',
    fontSize: 15,
    marginBottom: 30,
    minHeight: 100, 
    color: '#1F2937'
  },
  submitBtn: {
    backgroundColor: '#FF4D4D',
    paddingVertical: 18,
    borderRadius: 14,
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#FF4D4D',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6
  },
  submitBtnText: { color: '#FFF', fontSize: 16, fontWeight: 'bold', letterSpacing: 0.5 },
});