import React, { useState } from 'react';
import { 
  StyleSheet, Text, View, TouchableOpacity, TextInput, 
  SafeAreaView, KeyboardAvoidingView, Platform, ScrollView, Alert 
} from 'react-native';
import { useDispatch } from 'react-redux';
import { setCurrentOrder } from '../../store/slices/orderSlice';
import apiClient from '../../services/api';

const REVIEW_TAGS = [
  'Nhanh chóng', 'Nhiệt tình', 'Chuyên nghiệp', 
  'Giá hợp lý', 'Bắt bệnh chuẩn', 'Cẩn thận'
];

export default function ReviewScreen({ route, navigation }: any) {
  // Lấy thông tin đơn hàng vừa hoàn thành được truyền sang từ TrackingScreen
  const { orderId, mechanicName } = route.params || { orderId: 'UNKNOWN', mechanicName: 'Thợ sửa xe' };
  const dispatch = useDispatch();

  const [rating, setRating] = useState(5); // Mặc định 5 sao cho khách dễ tính
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Xử lý chọn/bỏ chọn thẻ Tag
  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleSubmitReview = async () => {
    setIsSubmitting(true);
    try {
      // 🚧 Gọi API gửi đánh giá (Bạn có thể tạo API này ở Backend sau)
      /*
      await apiClient.post(`/orders/${orderId}/review`, {
        rating,
        tags: selectedTags,
        comment
      });
      */

      // Giả lập độ trễ mạng
      await new Promise(resolve => setTimeout(resolve, 800));

      Alert.alert('Cảm ơn bạn!', 'Đánh giá của bạn giúp dịch vụ tốt lên mỗi ngày.', [
        { 
          text: 'Về trang chủ', 
          onPress: () => {
            dispatch(setCurrentOrder(null)); // Xóa cuốc xe hiện tại khỏi Redux
            navigation.reset({ index: 0, routes: [{ name: 'Home' }] }); // Reset stack về Home
          } 
        }
      ]);
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể gửi đánh giá lúc này.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView 
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Chuyến đi hoàn tất</Text>
            <Text style={styles.subTitle}>Bạn cảm thấy dịch vụ thế nào?</Text>
          </View>

          {/* CARD THÔNG TIN THỢ */}
          <View style={styles.mechanicCard}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>Thợ</Text>
            </View>
            <Text style={styles.mechanicName}>{mechanicName}</Text>
            <Text style={styles.mechanicRole}>Đối tác MotoCứu</Text>
          </View>

          {/* CHỌN SAO (STAR RATING) */}
          <View style={styles.starsContainer}>
            {[1, 2, 3, 4, 5].map((star) => (
              <TouchableOpacity key={star} onPress={() => setRating(star)}>
                <Text style={[styles.starText, star <= rating ? styles.starActive : styles.starInactive]}>
                  ★
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={styles.ratingText}>
            {rating === 5 ? 'Tuyệt vời!' : rating >= 3 ? 'Khá tốt' : 'Cần cố gắng'}
          </Text>

          {/* THẺ TAGS (QUICK FEEDBACK) */}
          <View style={styles.tagsContainer}>
            {REVIEW_TAGS.map((tag) => {
              const isSelected = selectedTags.includes(tag);
              return (
                <TouchableOpacity 
                  key={tag} 
                  style={[styles.tagBadge, isSelected && styles.tagBadgeActive]}
                  onPress={() => toggleTag(tag)}
                >
                  <Text style={[styles.tagText, isSelected && styles.tagTextActive]}>{tag}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Ô NHẬP TEXT */}
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Chia sẻ thêm trải nghiệm của bạn (không bắt buộc)..."
              value={comment}
              onChangeText={setComment}
              multiline
              numberOfLines={4}
            />
          </View>

        </ScrollView>

        {/* NÚT XÁC NHẬN */}
        <View style={styles.footer}>
          <TouchableOpacity 
            style={[styles.submitBtn, isSubmitting && styles.submitBtnDisabled]}
            onPress={handleSubmitReview}
            disabled={isSubmitting}
          >
            <Text style={styles.submitBtnText}>
              {isSubmitting ? 'ĐANG GỬI...' : 'GỬI ĐÁNH GIÁ'}
            </Text>
          </TouchableOpacity>
        </View>

      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fff' },
  container: { flex: 1 },
  scrollContent: { padding: 20, alignItems: 'center' },
  
  header: { alignItems: 'center', marginBottom: 30, marginTop: 20 },
  headerTitle: { fontSize: 24, fontWeight: '900', color: '#27ae60', marginBottom: 8 },
  subTitle: { fontSize: 16, color: '#666' },
  
  mechanicCard: { alignItems: 'center', marginBottom: 30 },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#0084ff', justifyContent: 'center', alignItems: 'center', marginBottom: 12, elevation: 5, shadowColor: '#0084ff', shadowOpacity: 0.3, shadowRadius: 8, shadowOffset: { width: 0, height: 4 } },
  avatarText: { color: '#fff', fontWeight: 'bold', fontSize: 20 },
  mechanicName: { fontSize: 20, fontWeight: 'bold', color: '#333' },
  mechanicRole: { fontSize: 14, color: '#888', marginTop: 4 },
  
  starsContainer: { flexDirection: 'row', justifyContent: 'center', gap: 10, marginBottom: 10 },
  starText: { fontSize: 50 },
  starActive: { color: '#f1c40f' }, // Màu vàng
  starInactive: { color: '#e0e0e0' }, // Màu xám
  ratingText: { fontSize: 16, fontWeight: 'bold', color: '#f39c12', marginBottom: 30 },
  
  tagsContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 10, marginBottom: 30 },
  tagBadge: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, borderWidth: 1, borderColor: '#ddd', backgroundColor: '#f9f9f9' },
  tagBadgeActive: { backgroundColor: '#eaf4ff', borderColor: '#0084ff' },
  tagText: { color: '#555', fontWeight: '500' },
  tagTextActive: { color: '#0084ff', fontWeight: 'bold' },
  
  inputContainer: { width: '100%', marginBottom: 20 },
  input: { backgroundColor: '#f5f7fa', borderRadius: 12, padding: 15, fontSize: 15, minHeight: 100, textAlignVertical: 'top', borderWidth: 1, borderColor: '#eef0f2' },
  
  footer: { padding: 20, borderTopWidth: 1, borderTopColor: '#f0f0f0', backgroundColor: '#fff' },
  submitBtn: { backgroundColor: '#0084ff', paddingVertical: 16, borderRadius: 12, alignItems: 'center', elevation: 2 },
  submitBtnDisabled: { backgroundColor: '#a0c4ff' },
  submitBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});