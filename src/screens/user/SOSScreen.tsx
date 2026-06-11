import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, FlatList, TextInput, Alert } from 'react-native';
import { ISSUE_TYPES } from '../../constants';
import apiClient from '../../services/api';
import socketService from '../../services/socketService';
import { useDispatch } from 'react-redux';
import { setCurrentOrder } from '../../store/slices/orderSlice';

export default function SOSScreen({ route, navigation }: any) {
  const { userLocation } = route.params;
  const dispatch = useDispatch();
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
      // 1. Gửi request tạo đơn hàng lên Backend HTTP Server
      const response = await apiClient.post('/orders/create', {
        issueType: selectedIssue,
        description: description,
        userLocation: userLocation,
        priceEstimate: basePrice, // Sẽ được tính toán động thêm theo quãng đường ở Backend
      });

      const newOrder = response.data.order;
      dispatch(setCurrentOrder(newOrder));

      // 2. Bắn tín hiệu phòng cứu hộ qua WebSocket để thông báo cho các thợ xung quanh
      socketService.emit('create_rescue_room', { orderId: newOrder.id, location: userLocation });

      // 3. Chuyển sang màn hình chờ thợ nhận cuốc và tracking
      navigation.navigate('Tracking', { orderId: newOrder.id });
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể gửi yêu cầu cứu hộ lúc này. Vui lòng thử lại!');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Chọn sự cố xe gặp phải</Text>

      <View style={{ maxHeight: 280 }}>
        <FlatList
          data={ISSUE_TYPES}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => {
            const isSelected = selectedIssue === item.id;
            return (
              <TouchableOpacity
                style={[styles.issueCard, isSelected && styles.selectedCard]}
                onPress={() => handleSelectIssue(item.id, item.price)}
              >
                <Text style={[styles.issueLabel, isSelected && styles.selectedText]}>{item.label}</Text>
                {item.price > 0 && (
                  <Text style={styles.priceHint}>Giá sàn: {item.price.toLocaleString('vi-VN')} Đ</Text>
                )}
              </TouchableOpacity>
            );
          }}
        />
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 20, paddingTop: 60 },
  title: { fontSize: 20, fontWeight: 'bold', color: '#333', marginBottom: 20 },
  subTitle: { fontSize: 16, fontWeight: 'bold', color: '#555', marginTop: 20, marginBottom: 10 },
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
  },
  submitBtn: {
    backgroundColor: '#ff4d4d',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});