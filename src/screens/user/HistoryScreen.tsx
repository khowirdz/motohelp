import React from 'react';
import { View, Text } from 'react-native';

export default function HistoryScreen() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
      <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#666' }}>Lịch sử cứu hộ của bạn trống.</Text>
    </View>
  );
}