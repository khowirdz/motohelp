// src/components/common/Avatar.tsx
// ✅ File này bị thiếu — gây lỗi "Cannot find module '../../components/common/Avatar'"

import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { COLORS } from '../../constants/theme';

interface AvatarProps {
  name?: string;
  uri?: string;
  size?: number;
  color?: string;
  bgColor?: string;
}

export const Avatar: React.FC<AvatarProps> = ({
  name = '?',
  uri,
  size = 40,
  color = COLORS.white,
  bgColor = COLORS.primary,
}) => {
  const initial = (name.trim()[0] ?? '?').toUpperCase();
  const fontSize = Math.round(size * 0.38);

  if (uri) {
    return (
      <Image
        source={{ uri }}
        style={{ width: size, height: size, borderRadius: size / 2 }}
      />
    );
  }

  return (
    <View
      style={[
        styles.base,
        { width: size, height: size, borderRadius: size / 2, backgroundColor: bgColor },
      ]}
    >
      <Text style={{ fontSize, color, fontWeight: '700', includeFontPadding: false }}>
        {initial}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
});