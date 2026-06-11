import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, TextInput, Alert } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { setCurrentOrder } from '../../store/slices/orderSlice';

export default function ReviewScreen({ navigation }: any) {
  const currentOrder = useSelector((state: RootState) => state.order.currentOrder);
  const dispatch = useDispatch();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  const handleSubmitReview = () => {
    Alert.alert('Cảm ơn', 'Đánh giá của bạn đã được ghi nhận thành công!', [
      {
        text: 'Quay lại Trang chủ',
        onPress: () => {
          dispatch(setCurrentOrder(null)); // Reset đơn hàng hiện tại về null
          navigation.replace('Home');
        }
      }
    ]);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.successIcon}>🎉</Text>
      <Text style={styles.title}>Sửa Chữa Hoàn Thành!</Text>
      
      <View style={styles.invoiceCard}>
        <Text style={styles.invoiceLabel}>Tổng chi phí dịch vụ:</Text>
        <Text style={styles.invoicePrice}>
          {currentOrder?.priceEstimate ? currentOrder.priceEstimate.toLocaleString('vi-VN') : '0'} VNĐ
        </Text>
      </View>

      <Text style={styles.ratingTitle}>Đánh giá chất lượng dịch vụ của thợ:</Text>
      <View style={styles.starRow}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity key={star} onPress={() => setRating(star)}>
            <Text style={[styles.star, star <= rating ? styles.activeStar : styles.inactiveStar]}>★</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TextInput
        style={styles.input}
        placeholder="Nhập ý kiến đóng góp (Ví dụ: Thợ đến rất nhanh, nhiệt tình...)"
        value={comment}
        onChangeText={setComment}
        multiline
      />

      <TouchableOpacity style={styles.submitBtn} onPress={handleSubmitReview}>
        <Text style={styles.submitBtnText}>GỬI ĐÁNH GIÁ</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', justifyContent: 'center', padding: 20 },
  successIcon: { fontSize: 64, textAlign: 'center', marginBottom: 10 },
  title: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', color: '#2ecc71', marginBottom: 30 },
  invoiceCard: { backgroundColor: '#f9f9f9', padding: 20, borderRadius: 10, borderWidth: 1, borderColor: '#eee', marginBottom: 30 },
  invoiceLabel: { fontSize: 15, color: '#666', textAlign: 'center' },
  invoicePrice: { fontSize: 28, fontWeight: 'bold', color: '#333', textAlign: 'center', marginTop: 10 },
  ratingTitle: { fontSize: 16, fontWeight: 'bold', color: '#444', marginBottom: 15, textAlign: 'center' },
  starRow: { flexDirection: 'row', justifyContent: 'center', marginBottom: 25 },
  star: { fontSize: 40, marginHorizontal: 5 },
  activeStar: { color: '#f1c40f' },
  inactiveStar: { color: '#ccc' },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 15, height: 100, textAlignVertical: 'top', marginBottom: 30 },
  submitBtn: { backgroundColor: '#2ecc71', paddingVertical: 16, borderRadius: 8, alignItems: 'center' },
  submitBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});