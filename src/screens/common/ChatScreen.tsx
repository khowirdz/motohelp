// src/screens/common/ChatScreen.tsx
// ✅ FIX lỗi ts(2554): sendTyping nhận đúng 3 argument
// ✅ FIX lỗi ts(2339): dùng socketService.sendTyping / sendMessage / joinChatRoom
// 🚀 UPDATE: Tự động nhận diện Tên, Vai trò và Số điện thoại đối tác từ Redux

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  StyleSheet, Text, View, TextInput, TouchableOpacity,
  FlatList, KeyboardAvoidingView, Platform, SafeAreaView,
  Linking, Alert,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import socketService from '../../services/socketService';
import apiClient from '../../services/api';
import {
  setHistory, addMessage, updateMessageStatus,
  setTyping, markOrderRead, incrementUnread, setLoadingHistory,
} from '../../store/slices/chatSlice';
import { ChatMessage } from '../../types';
import { Avatar } from '../../components/common/Avatar';
import { TypingIndicator } from '../../components/common/TypingIndicator';
import { MessageTick } from '../../components/common/MessageTick';
import { COLORS, FONT, RADIUS, SHADOW } from '../../constants/theme';

// ── Helpers ──────────────────────────────────────────────
const formatTime = (iso: string) => {
  if (!iso) return '';
  const d = new Date(iso);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
};

const formatDateDivider = (iso: string) => {
  const d = new Date(iso);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return 'Hôm nay';
  if (d.toDateString() === yesterday.toDateString()) return 'Hôm qua';
  return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

const QUICK_REPLIES = [
  'Tôi đang trên đường đến 🚗',
  'Khoảng 5 phút nữa tôi tới',
  'Bạn vui lòng chờ thêm một chút',
  'Tôi đã đến nơi rồi 📍',
  'Giá sửa khoảng bao nhiêu?',
  'Cảm ơn bạn!',
];

// ── Component ─────────────────────────────────────────────
export default function ChatScreen({ route, navigation }: any) {
  const { orderId, recipientName, recipientPhone } = route.params || {};
  const user     = useSelector((s: RootState) => s.auth.user);
  const dispatch = useDispatch();

  // 🔥 Lấy thêm thông tin order từ Redux để xử lý fallback
  const currentOrder = useSelector((s: RootState) => (s as any).order?.currentOrder);

  const messages    = useSelector((s: RootState) => s.chat.messagesByOrder[orderId] ?? []);
  const typingUsers = useSelector((s: RootState) => s.chat.typingByOrder[orderId] ?? []);
  const isTyping    = typingUsers.filter((id) => id !== user?.id).length > 0;

  const [input, setInput]         = useState('');
  const [showQuick, setShowQuick] = useState(false);
  const flatListRef  = useRef<FlatList>(null);
  const typingTimer  = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Logic Nhận Diện Đối Tác ──────────────────────────────
  const isCustomer = user?.role === 'user';
  
  // Nếu param truyền vào bị thiếu, hệ thống tự động chắt lọc từ currentOrder
  const partnerName = recipientName || (isCustomer ? currentOrder?.mechanicName : currentOrder?.userName) || 'Đối tác';
  const partnerPhone = recipientPhone || (isCustomer ? currentOrder?.mechanicPhone : currentOrder?.userPhone);
  const partnerRole = isCustomer ? 'Thợ sửa xe' : 'Khách hàng';

  // ── Load history + socket ──────────────────────────────
  useEffect(() => {
    const loadHistory = async () => {
      dispatch(setLoadingHistory(true));
      try {
        const res = await apiClient.get(`/orders/${orderId}/messages`);
        if (res.data?.success) {
          dispatch(setHistory({ orderId, messages: res.data.messages }));
        }
      } catch {
        // Không có lịch sử — không sao
      }
    };
    loadHistory();

    socketService.joinChatRoom(orderId);
    dispatch(markOrderRead(orderId));

    const handleReceive = (msg: ChatMessage) => {
      if (msg.orderId !== orderId) return;
      if (msg.senderId === user?.id) {
        dispatch(updateMessageStatus({ orderId, messageId: msg._id, status: 'delivered' }));
      } else {
        dispatch(addMessage(msg));
        socketService.markAsRead(orderId, msg._id, user?.id ?? '');
      }
    };

    const handleTyping = ({ userId, isTyping: typing }: { userId: string; isTyping: boolean }) => {
      dispatch(setTyping({ orderId, userId, isTyping: typing }));
    };

    const handleRead = ({ messageId }: { messageId: string }) => {
      dispatch(updateMessageStatus({ orderId, messageId, status: 'read' }));
    };

    socketService.on('receive_message', handleReceive);
    socketService.on('typing',         handleTyping);
    socketService.on('message_read',   handleRead);

    return () => {
      socketService.off('receive_message', handleReceive);
      socketService.off('typing',         handleTyping);
      socketService.off('message_read',   handleRead);
      socketService.leaveChatRoom(orderId);
      if (user?.id) socketService.sendTyping(orderId, user.id, false);
    };
  }, [orderId, user?.id, dispatch]);

  useEffect(() => {
    if (messages.length > 0 || isTyping) {
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [messages.length, isTyping]);

  // ── Xử lý gõ phím ─────────────────────────────────────
  const handleInputChange = useCallback((text: string) => {
    setInput(text);
    if (!user?.id) return;
    
    socketService.sendTyping(orderId, user.id, true);
    if (typingTimer.current) clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => {
      socketService.sendTyping(orderId, user!.id, false);
    }, 800);
  }, [orderId, user?.id]);

  // ── Gửi tin nhắn ──────────────────────────────────────
  const handleSend = useCallback((text?: string) => {
    const content = (text ?? input).trim();
    if (!content || !user) return;

    const tempId = `tmp_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    const msg: ChatMessage = {
      _id:       tempId,
      orderId,
      text:      content,
      senderId:  user.id,
      senderName: user.name,
      createdAt: new Date().toISOString(),
      status:    'sending',
      type:      'text',
    };

    dispatch(addMessage(msg));
    setInput('');
    setShowQuick(false);

    if (typingTimer.current) clearTimeout(typingTimer.current);
    socketService.sendTyping(orderId, user.id, false);
    socketService.sendMessage(msg);

    setTimeout(() => {
      dispatch(updateMessageStatus({ orderId, messageId: tempId, status: 'sent' }));
    }, 1000);
  }, [input, user, orderId, dispatch]);

  // ── Gọi điện ──────────────────────────────────────────
  const handleCall = () => {
    if (!partnerPhone) {
      Alert.alert('Không có số', 'Không tìm thấy số điện thoại của đối tác để gọi.');
      return;
    }
    Alert.alert(
      `Gọi cho ${partnerName}?`,
      partnerPhone,
      [
        { text: 'Hủy', style: 'cancel' },
        { text: '📞 Gọi ngay', onPress: () => Linking.openURL(`tel:${partnerPhone}`) },
      ]
    );
  };

  // ── Nhóm messages + date divider ──────────────────────
  const messagesWithDividers = useMemo(() => {
    const result: any[] = [];
    let lastDate = '';
    messages.forEach((msg) => {
      const date = new Date(msg.createdAt).toDateString();
      if (date !== lastDate) {
        result.push({ type: 'divider', date: formatDateDivider(msg.createdAt), key: `div_${date}` });
        lastDate = date;
      }
      result.push(msg);
    });
    return result;
  }, [messages]);

  // ── Render item ────────────────────────────────────────
  const renderItem = useCallback(({ item }: any) => {
    if (item.type === 'divider') {
      return (
        <View style={styles.dividerRow}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>{item.date}</Text>
          <View style={styles.dividerLine} />
        </View>
      );
    }
    if (item.type === 'system') {
      return (
        <View style={styles.systemRow}>
          <Text style={styles.systemText}>{item.text}</Text>
        </View>
      );
    }

    const isMe = item.senderId === user?.id;

    return (
      <View style={[styles.msgRow, isMe ? styles.msgRowMe : styles.msgRowThem]}>
        {!isMe && (
          <Avatar name={item.senderName ?? partnerName ?? '?'} size={30} bgColor={COLORS.blueMid} />
        )}
        <View style={[styles.msgGroup, isMe ? styles.msgGroupMe : styles.msgGroupThem]}>
          <View style={[styles.bubble, isMe ? styles.bubbleMe : styles.bubbleThem]}>
            <Text style={[styles.msgText, isMe ? styles.msgTextMe : styles.msgTextThem]}>
              {item.text}
            </Text>
          </View>
          <View style={[styles.metaRow, isMe ? styles.metaMe : styles.metaThem]}>
            <Text style={styles.timeText}>{formatTime(item.createdAt)}</Text>
            <MessageTick status={item.status} isMe={isMe} />
          </View>
        </View>
      </View>
    );
  }, [user?.id, partnerName]);

  // ── UI ────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.safe}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Avatar name={partnerName ?? '?'} size={38} bgColor={COLORS.primaryDark} />
          <View style={{ flex: 1 }}>
            <Text style={styles.headerName} numberOfLines={1}>{partnerName}</Text>
            
            {/* 🔥 Bổ sung Label Chức danh */}
            <Text style={styles.partnerRole}>{partnerRole}</Text>
            
            {isTyping
              ? <Text style={styles.typingLabel}>đang gõ...</Text>
              : <Text style={styles.onlineLabel}>● Đang hoạt động</Text>
            }
          </View>
        </View>
        <TouchableOpacity style={styles.callBtn} onPress={handleCall}>
          <Text style={{ fontSize: 18 }}>📞</Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 88 : 0}
      >
        {/* MESSAGES */}
        <FlatList
          ref={flatListRef}
          data={messagesWithDividers}
          keyExtractor={(item: any) => item._id ?? item.key}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
          onLayout={() => flatListRef.current?.scrollToEnd({ animated: false })}
          ListFooterComponent={isTyping ? <TypingIndicator /> : null}
        />

        {/* QUICK REPLIES */}
        {showQuick && (
          <View style={styles.quickWrap}>
            <FlatList
              horizontal
              data={QUICK_REPLIES}
              keyExtractor={(item) => item}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.quickList}
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.quickChip} onPress={() => handleSend(item)}>
                  <Text style={styles.quickText}>{item}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        )}

        {/* INPUT BAR */}
        <View style={styles.inputBar}>
          <TouchableOpacity
            style={[styles.iconBtn, showQuick && styles.iconBtnActive]}
            onPress={() => setShowQuick((v) => !v)}
          >
            <Text style={{ fontSize: 18 }}>⚡</Text>
          </TouchableOpacity>

          <TextInput
            style={styles.input}
            placeholder="Nhắn tin..."
            placeholderTextColor={COLORS.gray400}
            value={input}
            onChangeText={handleInputChange}
            multiline
            maxLength={500}
          />

          <TouchableOpacity
            style={[styles.sendBtn, !input.trim() && styles.sendBtnOff]}
            onPress={() => handleSend()}
            disabled={!input.trim()}
            activeOpacity={0.8}
          >
            <Text style={styles.sendIcon}>➤</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ── Styles ────────────────────────────────────────────────
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.white },
  flex: { flex: 1, backgroundColor: COLORS.chatBg },

  header: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.white,
    paddingHorizontal: 12, paddingVertical: 10,
    borderBottomWidth: 0.5, borderBottomColor: COLORS.gray200,
    ...SHADOW.sm, zIndex: 10,
  },
  backBtn:    { padding: 8, marginRight: 4 },
  backArrow:  { fontSize: 20, color: COLORS.primary, fontWeight: FONT.bold },
  headerInfo: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 },
  headerName: { fontSize: 15, fontWeight: FONT.semibold, color: COLORS.gray900 },
  
  // Style cho chức danh
  partnerRole: { fontSize: 12, color: COLORS.gray500, marginVertical: 1 },
  
  typingLabel: { fontSize: 12, color: COLORS.success, fontStyle: 'italic' },
  onlineLabel: { fontSize: 11, color: COLORS.success },
  callBtn: {
    width: 40, height: 40, borderRadius: RADIUS.full,
    backgroundColor: COLORS.successLight,
    alignItems: 'center', justifyContent: 'center',
  },

  list: { paddingHorizontal: 12, paddingTop: 16, paddingBottom: 8 },

  dividerRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 16, gap: 8 },
  dividerLine: { flex: 1, height: 0.5, backgroundColor: COLORS.gray300 },
  dividerText: { fontSize: 11, color: COLORS.gray500, fontWeight: FONT.medium },

  systemRow:  { alignItems: 'center', marginVertical: 8 },
  systemText: {
    fontSize: 12, color: COLORS.gray500, fontStyle: 'italic',
    backgroundColor: COLORS.gray100,
    paddingHorizontal: 14, paddingVertical: 4,
    borderRadius: RADIUS.full,
  },

  msgRow:     { flexDirection: 'row', alignItems: 'flex-end', marginBottom: 4, gap: 6 },
  msgRowMe:   { justifyContent: 'flex-end' },
  msgRowThem: { justifyContent: 'flex-start' },
  msgGroup:   { maxWidth: '78%' },
  msgGroupMe:   { alignItems: 'flex-end' },
  msgGroupThem: { alignItems: 'flex-start' },

  bubble: { paddingHorizontal: 14, paddingVertical: 10, ...SHADOW.sm },
  bubbleMe: {
    backgroundColor: COLORS.bubbleMe,
    borderRadius: RADIUS.lg, borderBottomRightRadius: RADIUS.xs,
  },
  bubbleThem: {
    backgroundColor: COLORS.bubbleThem,
    borderRadius: RADIUS.lg, borderBottomLeftRadius: RADIUS.xs,
    borderWidth: 0.5, borderColor: COLORS.gray200,
  },
  msgText:     { fontSize: 15, lineHeight: 21 },
  msgTextMe:   { color: COLORS.white },
  msgTextThem: { color: COLORS.gray900 },

  metaRow: { flexDirection: 'row', alignItems: 'center', marginTop: 3, gap: 3 },
  metaMe:   { justifyContent: 'flex-end' },
  metaThem: { justifyContent: 'flex-start' },
  timeText: { fontSize: 10, color: COLORS.gray400 },

  quickWrap: {
    backgroundColor: COLORS.white,
    borderTopWidth: 0.5, borderTopColor: COLORS.gray200, paddingVertical: 8,
  },
  quickList: { paddingHorizontal: 12, gap: 8 },
  quickChip: {
    backgroundColor: COLORS.primaryLight, borderRadius: RADIUS.full,
    paddingHorizontal: 14, paddingVertical: 8,
    borderWidth: 1, borderColor: `${COLORS.primary}40`,
  },
  quickText: { fontSize: 13, color: COLORS.primary, fontWeight: FONT.medium },

  inputBar: {
    flexDirection: 'row', alignItems: 'flex-end',
    backgroundColor: COLORS.white,
    paddingHorizontal: 10, paddingVertical: 8,
    paddingBottom: Platform.OS === 'ios' ? 20 : 8,
    borderTopWidth: 0.5, borderTopColor: COLORS.gray200, gap: 8,
  },
  iconBtn: {
    width: 38, height: 38, borderRadius: RADIUS.full,
    backgroundColor: COLORS.gray100,
    alignItems: 'center', justifyContent: 'center', alignSelf: 'flex-end',
  },
  iconBtnActive: { backgroundColor: COLORS.primaryLight },
  input: {
    flex: 1, minHeight: 38, maxHeight: 120,
    backgroundColor: COLORS.gray100,
    borderRadius: RADIUS.xl,
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 10 : 8,
    paddingBottom: Platform.OS === 'ios' ? 10 : 8,
    fontSize: 15, color: COLORS.gray900, lineHeight: 20,
  },
  sendBtn: {
    width: 38, height: 38, borderRadius: RADIUS.full,
    backgroundColor: COLORS.primary,
    alignItems: 'center', justifyContent: 'center', alignSelf: 'flex-end',
  },
  sendBtnOff: { backgroundColor: COLORS.gray300 },
  sendIcon:   { fontSize: 16, color: COLORS.white, marginLeft: 2 },
});