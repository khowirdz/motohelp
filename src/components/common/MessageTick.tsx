// src/components/common/MessageTick.tsx
// ✅ File này bị thiếu — gây lỗi "Cannot find module '../../components/common/MessageTick'"

import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { ChatMessage } from '../../types';
import { COLORS } from '../../constants/theme';

interface Props {
  status: ChatMessage['status'];
  isMe: boolean;
}

export const MessageTick: React.FC<Props> = ({ status, isMe }) => {
  if (!isMe) return null;

  const icon =
    status === 'sending'   ? '○'  :
    status === 'sent'      ? '✓'  :
    status === 'delivered' ? '✓✓' :
    status === 'read'      ? '✓✓' : '';

  const color = status === 'read' ? COLORS.blueMid : 'rgba(255,255,255,0.65)';

  return <Text style={[styles.tick, { color }]}>{icon}</Text>;
};

const styles = StyleSheet.create({
  tick: { fontSize: 11, marginLeft: 3 },
});