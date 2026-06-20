import React, { useState } from 'react';
import { 
  StyleSheet, Text, View, FlatList, TouchableOpacity, 
  SafeAreaView, Dimensions 
} from 'react-native';

const { width } = Dimensions.get('window');

const MOCK_HISTORY = [
  { id: 'ORD_001', date: '17/06/2026', time: '14:30', issue: 'Vá lốp xe máy', price: 50000, status: 'COMPLETED' },
  { id: 'ORD_002', date: '17/06/2026', time: '09:15', issue: 'Kích bình ắc quy', price: 150000, status: 'COMPLETED' },
  { id: 'ORD_003', date: '16/06/2026', time: '19:00', issue: 'Mua xăng hộ', price: 30000, status: 'CANCELLED' },
  { id: 'ORD_004', date: '15/06/2026', time: '10:45', issue: 'Sửa khóa điện', price: 90000, status: 'COMPLETED' },
];

export default function MechanicHistoryScreen({ navigation }: any) {
  const [activeTab, setActiveTab] = useState<'TODAY' | 'WEEK' | 'MONTH'>('TODAY');

  const renderStatusBadge = (status: string) => {
    const isCompleted = status === 'COMPLETED';
    return (
      <View style={[styles.badge, isCompleted ? styles.badgeSuccess : styles.badgeError]}>
        <Text style={[styles.badgeText, isCompleted ? styles.textSuccess : styles.textError]}>
          {isCompleted ? 'Hoàn thành' : 'Đã hủy'}
        </Text>
      </View>
    );
  };

  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View>
          <Text style={styles.timeText}>{item.time} - {item.date}</Text>
          <Text style={styles.issueText}>{item.issue}</Text>
        </View>
        <Text style={[styles.priceText, item.status === 'CANCELLED' && { color: '#999', textDecorationLine: 'line-through' }]}>
          {item.price.toLocaleString('vi-VN')}đ
        </Text>
      </View>
      <View style={styles.cardFooter}>
        <Text style={styles.orderIdText}>Mã: {item.id}</Text>
        {renderStatusBadge(item.status)}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>❮ Quay lại</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Lịch sử & Thu nhập</Text>
        <View style={{ width: 80 }} />
      </View>

      <View style={styles.overviewCard}>
        <View style={styles.tabContainer}>
          {['TODAY', 'WEEK', 'MONTH'].map((tab) => (
            <TouchableOpacity 
              key={tab} 
              style={[styles.tabBtn, activeTab === tab && styles.tabBtnActive]}
              onPress={() => setActiveTab(tab as any)}
            >
              <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
                {tab === 'TODAY' ? 'Hôm nay' : tab === 'WEEK' ? 'Tuần này' : 'Tháng này'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.totalLabel}>Tổng thu nhập</Text>
        <Text style={styles.totalValue}>
          {activeTab === 'TODAY' ? '200.000' : activeTab === 'WEEK' ? '1.450.000' : '5.800.000'}đ
        </Text>
        
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{activeTab === 'TODAY' ? '2' : '15'}</Text>
            <Text style={styles.statLabel}>Đơn cứu hộ</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>100%</Text>
            <Text style={styles.statLabel}>Hoàn thành</Text>
          </View>
        </View>
      </View>

      <View style={styles.listContainer}>
        <Text style={styles.listTitle}>Chi tiết các đơn cứu hộ</Text>
        <FlatList
          data={MOCK_HISTORY}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 20 }}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F4F6' },
  
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, backgroundColor: '#FFF' },
  backBtn: { padding: 8 },
  backBtnText: { color: '#00B14F', fontSize: 16, fontWeight: '600' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#111827' },

  overviewCard: { backgroundColor: '#00B14F', margin: 16, borderRadius: 16, padding: 20, elevation: 6, shadowColor: '#00B14F', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 },
  
  tabContainer: { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 8, padding: 4, marginBottom: 20 },
  tabBtn: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 6 },
  tabBtnActive: { backgroundColor: '#FFF' },
  tabText: { color: '#FFF', fontSize: 13, fontWeight: '600' },
  tabTextActive: { color: '#00B14F' },

  totalLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 14, textAlign: 'center' },
  totalValue: { color: '#FFF', fontSize: 32, fontWeight: '800', textAlign: 'center', marginVertical: 8 },

  statsRow: { flexDirection: 'row', marginTop: 10, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.2)', paddingTop: 15 },
  statBox: { flex: 1, alignItems: 'center' },
  statDivider: { width: 1, backgroundColor: 'rgba(255,255,255,0.2)' },
  statNumber: { color: '#FFF', fontSize: 18, fontWeight: '700' },
  statLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 12, marginTop: 4 },

  listContainer: { flex: 1, paddingHorizontal: 16 },
  listTitle: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 12 },
  
  card: { backgroundColor: '#FFF', borderRadius: 12, padding: 16, marginBottom: 12, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  timeText: { fontSize: 12, color: '#6B7280', marginBottom: 4 },
  issueText: { fontSize: 16, fontWeight: '700', color: '#111827' },
  priceText: { fontSize: 16, fontWeight: '800', color: '#00B14F' },
  
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12, borderTopWidth: 1, borderTopColor: '#F3F4F6' },
  orderIdText: { fontSize: 12, color: '#9CA3AF' },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  badgeText: { textAlign: 'center' },
  badgeSuccess: { backgroundColor: '#DEF7EC' },
  badgeError: { backgroundColor: '#FDE8E8' },
  textSuccess: { color: '#03543F', fontSize: 11, fontWeight: '600' },
  textError: { color: '#9B1C1C', fontSize: 11, fontWeight: '600' },
});