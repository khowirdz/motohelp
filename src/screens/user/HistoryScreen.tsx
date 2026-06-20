import React, { useState, useEffect, useCallback } from 'react';
import { 
  StyleSheet, Text, View, FlatList, TouchableOpacity, 
  SafeAreaView, ActivityIndicator, RefreshControl 
} from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import apiClient from '../../services/api';

export default function HistoryScreen({ navigation }: any) {
  const user = useSelector((state: RootState) => state.auth.user);
  
  const [historyData, setHistoryData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Hàm tải dữ liệu từ Server
  const fetchHistory = async () => {
    if (!user) return;
    try {
      // 🚧 Nơi gọi API thật (Bạn mở comment khi Backend đã có API này)
      // const response = await apiClient.get(`/orders/user/${user.id}`);
      // setHistoryData(response.data.orders);
      const response = await apiClient.get(`/orders/user/${user.id}`);
      setHistoryData(response.data.orders);
      // 💡 DỮ LIỆU MẪU (Mock Data) để bạn test giao diện ngay lúc này
      setTimeout(() => {
        setHistoryData([
          {
            id: 'ORDER_178123456',
            issueType: '1', // Sửa khóa/Điện
            mechanicName: 'Nguyễn Văn Thợ',
            priceEstimate: 50000,
            status: 'COMPLETED',
            createdAt: new Date().toISOString(),
          },
          {
            id: 'ORDER_178098765',
            issueType: '2', // Hết xăng
            mechanicName: 'Trần Văn Cứu',
            priceEstimate: 30000,
            status: 'CANCELLED',
            createdAt: new Date(Date.now() - 86400000).toISOString(), // Hôm qua
          }
        ]);
        setIsLoading(false);
        setRefreshing(false);
      }, 1000);

    } catch (error) {
      console.error('Lỗi khi tải lịch sử:', error);
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [user]);

  // Hàm xử lý vuốt xuống để làm mới
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchHistory();
  }, []);

  // Helper: Format ngày tháng
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')} - ${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
  };

  // Helper: Trả về màu và tên trạng thái
  const getStatusDisplay = (status: string) => {
    switch (status) {
      case 'COMPLETED': return { text: 'Hoàn thành', color: '#27ae60', bgColor: '#e8f8f5' };
      case 'CANCELLED': return { text: 'Đã hủy', color: '#e74c3c', bgColor: '#fdedec' };
      default: return { text: 'Đang xử lý', color: '#f39c12', bgColor: '#fef5e7' };
    }
  };

  // Giao diện khi danh sách trống
  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyEmoji}>📭</Text>
      <Text style={styles.emptyTitle}>Chưa có chuyến đi nào</Text>
      <Text style={styles.emptySub}>Khi bạn đặt cuốc xe cứu hộ, thông tin sẽ xuất hiện ở đây.</Text>
      <TouchableOpacity 
        style={styles.bookBtn}
        onPress={() => navigation.navigate('Home')}
      >
        <Text style={styles.bookBtnText}>Đặt xe ngay</Text>
      </TouchableOpacity>
    </View>
  );

  // Giao diện của 1 thẻ cuốc xe
  const renderItem = ({ item }: { item: any }) => {
    const statusDisplay = getStatusDisplay(item.status);

    return (
      <TouchableOpacity 
        style={styles.card}
        // Có thể navigate sang màn hình Chi tiết đơn hàng nếu bạn muốn
        onPress={() => {}} 
        activeOpacity={0.7}
      >
        <View style={styles.cardHeader}>
          <Text style={styles.dateText}>{formatDate(item.createdAt)}</Text>
          <View style={[styles.statusBadge, { backgroundColor: statusDisplay.bgColor }]}>
            <Text style={[styles.statusText, { color: statusDisplay.color }]}>
              {statusDisplay.text}
            </Text>
          </View>
        </View>

        <View style={styles.cardBody}>
          <View style={styles.serviceInfo}>
            <Text style={styles.issueText}>Sự cố: {item.issueType === '1' ? 'Sửa khóa/Điện' : item.issueType === '2' ? 'Hết xăng' : 'Hỏng lốp/Xăm'}</Text>
            <Text style={styles.mechanicText}>Thợ: {item.mechanicName || 'Chưa có'}</Text>
          </View>
          <Text style={styles.priceText}>{item.priceEstimate?.toLocaleString()} Đ</Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0084ff" />
        <Text style={styles.loadingText}>Đang tải lịch sử...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Lịch sử cứu hộ</Text>
      </View>

      <FlatList
        data={historyData}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#0084ff']} />
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: {
    backgroundColor: '#fff', padding: 20, paddingTop: 40,
    borderBottomWidth: 1, borderBottomColor: '#eee',
    alignItems: 'center', elevation: 2, shadowColor: '#000', shadowOpacity: 0.05,
  },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 10, color: '#666' },
  
  listContent: { padding: 15, paddingBottom: 30, flexGrow: 1 },
  
  card: {
    backgroundColor: '#fff', borderRadius: 12, padding: 15, marginBottom: 15,
    elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15, borderBottomWidth: 1, borderBottomColor: '#f0f0f0', paddingBottom: 10 },
  dateText: { color: '#888', fontSize: 13, fontWeight: '500' },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  statusText: { fontSize: 12, fontWeight: 'bold' },
  
  cardBody: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  serviceInfo: { flex: 1 },
  issueText: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 4 },
  mechanicText: { fontSize: 14, color: '#666' },
  priceText: { fontSize: 16, fontWeight: 'bold', color: '#0084ff' },

  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 80 },
  emptyEmoji: { fontSize: 60, marginBottom: 15 },
  emptyTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 8 },
  emptySub: { fontSize: 14, color: '#777', textAlign: 'center', paddingHorizontal: 40, marginBottom: 25 },
  bookBtn: { backgroundColor: '#0084ff', paddingHorizontal: 30, paddingVertical: 12, borderRadius: 8 },
  bookBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
});