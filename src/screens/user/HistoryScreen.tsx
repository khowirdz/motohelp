import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import apiClient from '../../services/api';
import { Order } from '../../types';

const STATUS_LABEL: Record<string, string> = {
  PENDING: 'Đang chờ',
  ACCEPTED: 'Đã nhận',
  ARRIVED: 'Đang sửa',
  COMPLETED: 'Hoàn thành',
  CANCELLED: 'Đã hủy',
};

export default function HistoryScreen() {
  const user = useSelector((state: RootState) => state.auth.user);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await apiClient.get(`/orders/history/${user?.id}`);
        setOrders(response.data.orders ?? []);
      } catch {
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [user?.id]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#ff4d4d" />
      </View>
    );
  }

  if (orders.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyText}>Bạn chưa có đơn cứu hộ nào.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={orders}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          const isCompleted = item.status === 'COMPLETED';
          return (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.issueType}>{item.issueType}</Text>
                <View style={[styles.statusBadge, isCompleted ? styles.badgeCompleted : styles.badgeCancelled]}>
                  <Text style={styles.statusText}>{STATUS_LABEL[item.status] ?? item.status}</Text>
                </View>
              </View>
              <Text style={styles.date}>
                {new Date(item.createdAt).toLocaleDateString('vi-VN', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                })}
              </Text>
              <Text style={styles.price}>{item.priceEstimate.toLocaleString('vi-VN')} VNĐ</Text>
            </View>
          );
        }}
        contentContainerStyle={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5f5f5' },
  emptyText: { fontSize: 15, color: '#888' },
  list: { padding: 16 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  issueType: { fontSize: 15, fontWeight: 'bold', color: '#333', flex: 1 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 12 },
  badgeCompleted: { backgroundColor: '#d5f5e3' },
  badgeCancelled: { backgroundColor: '#fde8e8' },
  statusText: { fontSize: 12, fontWeight: '600', color: '#333' },
  date: { fontSize: 12, color: '#888', marginBottom: 4 },
  price: { fontSize: 15, fontWeight: '600', color: '#2ecc71' },
});
