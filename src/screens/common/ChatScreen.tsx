import React, { useState, useEffect, useRef } from 'react';
import { 
  StyleSheet, Text, View, TextInput, TouchableOpacity, 
  FlatList, KeyboardAvoidingView, Platform, SafeAreaView 
} from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '../../store'; 
import socketService from '../../services/socketService';
import apiClient from '../../services/api';

// Hàm hiển thị thời gian theo chuẩn HH:mm
const formatTime = (dateString: string) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
};

export default function ChatScreen({ route }: any) {
  const { orderId } = route.params;
  const user = useSelector((state: RootState) => state.auth.user);
  
  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState('');
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    // 1. Tải lịch sử chat từ Database (nếu có)
    const fetchChatHistory = async () => {
      try {
        const response = await apiClient.get(`/orders/${orderId}/messages`);
        if (response.data && response.data.success) {
          setMessages(response.data.messages);
        }
      } catch (error) {
        console.log('Chưa có lịch sử chat hoặc lỗi tải:', error);
      }
    };
    fetchChatHistory();

    // 2. Mở tai nghe chờ tin nhắn mới từ Socket
    const socket = socketService.socket || socketService;
    
    const handleReceiveMessage = (newMessage: any) => {
      if (newMessage.orderId === orderId) {
        setMessages((prevMessages) => {
          // 🔥 BỘ LỌC CHỐNG DỘI ÂM: 
          // Nếu tin nhắn từ server dội về đã có sẵn trên màn hình rồi thì bỏ qua
          const isDuplicate = prevMessages.some((msg) => msg._id === newMessage._id);
          if (isDuplicate) {
            return prevMessages; // Giữ nguyên danh sách hiện tại
          }
          // Nếu là tin nhắn mới tinh của đối phương thì mới thêm vào
          return [...prevMessages, newMessage];
        });
      }
    };

    socket.on('receive_message', handleReceiveMessage);
    
    return () => { 
      socket.off('receive_message', handleReceiveMessage); 
    };
  }, [orderId]);

  const handleSendMessage = () => {
    if (!inputText.trim() || !user) return;

    // Tạo gói dữ liệu tin nhắn
    const messageData = {
      _id: Math.random().toString(36).substring(7), 
      orderId: orderId,
      text: inputText.trim(),
      senderId: user.id,
      createdAt: new Date().toISOString(),
    };

    // 🚀 OPTIMISTIC UI: Hiển thị ngay lập tức lên màn hình của mình cho cảm giác mượt mà
    setMessages((prevMessages) => [...prevMessages, messageData]);
    
    // Xóa trắng ô nhập liệu ngay lập tức
    setInputText('');

    // Đẩy tín hiệu lên trạm phát (Server)
    socketService.emit('send_message', messageData);
  };

  const renderMessage = ({ item }: any) => {
    const isMe = item.senderId === user?.id;
    
    return (
      <View style={[styles.messageWrapper, isMe ? styles.messageWrapperMe : styles.messageWrapperThem]}>
        {!isMe && (
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>Kh</Text>
          </View>
        )}
        
        <View style={isMe ? styles.messageContentMe : styles.messageContentThem}>
          <View style={[styles.messageBubble, isMe ? styles.messageBubbleMe : styles.messageBubbleThem]}>
            <Text style={[styles.messageText, isMe ? styles.messageTextMe : styles.messageTextThem]}>
              {item.text}
            </Text>
          </View>
          <Text style={[styles.timeText, isMe ? styles.timeTextMe : styles.timeTextThem]}>
            {formatTime(item.createdAt)}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView 
        style={styles.container} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          // 🔥 CHÌA KHÓA BẢO MẬT: Ghép _id với index để đảm bảo không bao giờ báo lỗi đỏ
          keyExtractor={(item, index) => item._id ? `${item._id}-${index}` : index.toString()}
          renderItem={renderMessage}
          contentContainerStyle={styles.chatList}
          // Tự động cuộn xuống cuối khi có tin nhắn mới hoặc bàn phím bật lên
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          onLayout={() => flatListRef.current?.scrollToEnd({ animated: false })}
        />
        
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Nhập tin nhắn..."
            value={inputText}
            onChangeText={setInputText}
            multiline
          />
          <TouchableOpacity 
            style={[styles.sendBtn, !inputText.trim() && { opacity: 0.5 }]} 
            onPress={handleSendMessage}
            disabled={!inputText.trim()}
          >
            <Text style={styles.sendBtnText}>Gửi</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F0F2F5' },
  container: { flex: 1, backgroundColor: '#F0F2F5' }, 
  chatList: { padding: 16, paddingBottom: 20 },
  messageWrapper: { marginBottom: 16, flexDirection: 'row', alignItems: 'flex-end' },
  messageWrapperMe: { justifyContent: 'flex-end' },
  messageWrapperThem: { justifyContent: 'flex-start' },
  avatar: { 
    width: 32, height: 32, borderRadius: 16, backgroundColor: '#CCC', 
    justifyContent: 'center', alignItems: 'center', marginRight: 8 
  },
  avatarText: { color: '#FFF', fontSize: 12, fontWeight: 'bold' },
  messageContentMe: { alignItems: 'flex-end' },
  messageContentThem: { alignItems: 'flex-start' },
  messageBubble: { 
    maxWidth: '85%', paddingHorizontal: 16, paddingVertical: 10, 
    borderRadius: 20,
    elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 1,
  },
  messageBubbleMe: { 
    backgroundColor: '#0084FF', 
    borderBottomRightRadius: 4 
  },
  messageBubbleThem: { 
    backgroundColor: '#FFFFFF', 
    borderBottomLeftRadius: 4,
    borderWidth: 1, borderColor: '#E5E5EA'
  },
  messageText: { fontSize: 16, lineHeight: 22 },
  messageTextMe: { color: '#FFF' },
  messageTextThem: { color: '#050505' },
  timeText: { fontSize: 11, color: '#8E8E93', marginTop: 4 },
  timeTextMe: { marginRight: 4 },
  timeTextThem: { marginLeft: 4 },
  inputContainer: { 
    flexDirection: 'row', padding: 10, backgroundColor: '#FFF', 
    borderTopWidth: 1, borderColor: '#E5E5EA', alignItems: 'flex-end',
    paddingBottom: Platform.OS === 'ios' ? 20 : 10
  },
  input: { 
    flex: 1, minHeight: 40, maxHeight: 100, backgroundColor: '#F0F2F5', 
    borderRadius: 20, paddingHorizontal: 16, paddingTop: 10, paddingBottom: 10, 
    marginRight: 10, fontSize: 15
  },
  sendBtn: { 
    backgroundColor: '#0084FF', paddingVertical: 10, paddingHorizontal: 20, 
    borderRadius: 20, justifyContent: 'center', height: 40
  },
  sendBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 15 },
});