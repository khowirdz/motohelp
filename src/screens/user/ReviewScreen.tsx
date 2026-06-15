import React, { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store';
import { setCurrentOrder } from '../../store/slices/orderSlice';
import apiClient from '../../services/api';

type PaymentMethod = 'CASH' | 'MOMO' | 'ZALOPAY';

const PAYMENT_METHODS: { key: PaymentMethod; label: string; icon: string }[] = [
  { key: 'CASH', label: 'Tiền mặt', icon: '💵' },
  { key: 'MOMO', label: 'MoMo', icon: '💜' },
  { key: 'ZALOPAY', label: 'ZaloPay', icon: '💙' },
];

export default function ReviewScreen({ navigation }: any) {
  const currentOrder = useSelector((state: RootState) => state.order.currentOrder);
  const dispatch = useDispatch();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CASH');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmitReview = async () => {
    setSubmitting(true);
    try {
      if (currentOrder) {
        await apiClient.post(`/orders/${currentOrder.id}/review`, {
          rating,
          comment,
          paymentMethod,
        });
      }

      if (paymentMethod === 'MOMO') {
        Alert.alert(
          'Chuyển sang MoMo',
          `Vui lòng thanh toán ${currentOrder?.priceEstimate.toLocaleString('vi-VN')} VNĐ qua ứng dụng MoMo.`,
          [{ text: 'Đã thanh toán', onPress: finishAndGoHome }]
        );
      } else if (paymentMethod === 'ZALOPAY') {
        Alert.alert(
          'Chuyển sang ZaloPay',
          `Vui lòng thanh toán ${currentOrder?.priceEstimate.toLocaleString('vi-VN')} VNĐ qua ứng dụng ZaloPay.`,
          [{ text: 'Đã thanh toán', onPress: finishAndGoHome }]
        );
      } else {
        Alert.alert('Cảm ơn', 'Đánh giá của bạn đã được ghi nhận!', [
          { text: 'Quay lại Trang chủ', onPress: finishAndGoHome },
        ]);
      }
    } catch {
      Alert.alert('Cảm ơn', 'Đánh giá của bạn đã được ghi nhận!', [
        { text: 'Quay lại Trang chủ', onPress: finishAndGoHome },
      ]);
    } finally {
      setSubmitting(false);
    }
  };

  const finishAndGoHome = () => {
    dispatch(setCurrentOrder(null));
    navigation.replace('MainTabs');
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

      <Text style={styles.sectionTitle}>Phương thức thanh toán:</Text>
      <View style={styles.paymentRow}>
        {PAYMENT_METHODS.map((m) => (
          <TouchableOpacity
            key={m.key}
            style={[styles.paymentBtn, paymentMethod === m.key && styles.paymentBtnActive]}
            onPress={() => setPaymentMethod(m.key)}
          >
            <Text style={styles.paymentIcon}>{m.icon}</Text>
            <Text style={[styles.paymentLabel, paymentMethod === m.key && styles.paymentLabelActive]}>
              {m.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.sectionTitle}>Đánh giá chất lượng dịch vụ:</Text>
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

      <TouchableOpacity
        style={[styles.submitBtn, submitting && styles.submitBtnDisabled]}
        onPress={handleSubmitReview}
        disabled={submitting}
      >
        <Text style={styles.submitBtnText}>{submitting ? 'ĐANG XỬ LÝ...' : 'GỬI ĐÁNH GIÁ & THANH TOÁN'}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 20, paddingTop: 50 },
  successIcon: { fontSize: 56, textAlign: 'center', marginBottom: 8 },
  title: { fontSize: 22, fontWeight: 'bold', textAlign: 'center', color: '#2ecc71', marginBottom: 20 },
  invoiceCard: {
    backgroundColor: '#f9f9f9',
    padding: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#eee',
    marginBottom: 20,
  },
  invoiceLabel: { fontSize: 14, color: '#666', textAlign: 'center' },
  invoicePrice: { fontSize: 26, fontWeight: 'bold', color: '#333', textAlign: 'center', marginTop: 6 },
  sectionTitle: { fontSize: 15, fontWeight: 'bold', color: '#444', marginBottom: 10 },
  paymentRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20, gap: 8 },
  paymentBtn: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: '#ddd',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  paymentBtnActive: { borderColor: '#2ecc71', backgroundColor: '#f0fdf4' },
  paymentIcon: { fontSize: 22, marginBottom: 4 },
  paymentLabel: { fontSize: 12, color: '#666', fontWeight: '500' },
  paymentLabelActive: { color: '#2ecc71', fontWeight: 'bold' },
  starRow: { flexDirection: 'row', justifyContent: 'center', marginBottom: 16 },
  star: { fontSize: 38, marginHorizontal: 4 },
  activeStar: { color: '#f1c40f' },
  inactiveStar: { color: '#ccc' },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    height: 90,
    textAlignVertical: 'top',
    marginBottom: 20,
    fontSize: 14,
  },
  submitBtn: { backgroundColor: '#2ecc71', paddingVertical: 15, borderRadius: 8, alignItems: 'center' },
  submitBtnDisabled: { backgroundColor: '#a0d8b3' },
  submitBtnText: { color: '#fff', fontSize: 15, fontWeight: 'bold' },
});
