import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, FlatList, TouchableOpacity } from 'react-native';
import socketService from '../../services/socketService';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';

interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: string;
}

export default function ChatScreen({ route }: any) {
  const { orderId } = route.params;
  const user = useSelector((state: RootState) => state.auth.user);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');

  useEffect(() => {
    // Đăng ký tham gia vào phòng chat riêng của đơn hàng này
    socketService.emit('join_chat_room', { orderId });

    // Lắng nghe tin nhắn mới từ đối phương
    socketService.on('receive_message', (newMessage: Message) => {
      setMessages((prev) => [newMessage, ...prev]);
    });
  }, [orderId]);

  const sendMessage = () => {
    if (!inputText.trim() || !user) return;

    const messageData: Message = {
      id: Date.now().toString(),
      senderId: user.id,
      text: inputText.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    socketService.emit('send_message', { orderId, message: messageData });
    setMessages((prev) => [messageData, ...prev]); // Hiển thị ngay phía giao diện của mình
    setInputText('');
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        inverted // Cuộn từ dưới lên trên giống Messenger/Zalo
        renderItem={({ item }) => {
          const isMyMessage = item.senderId === user?.id;
          return (
            <View style={[styles.msgBubble, isMyMessage ? styles.myMsg : styles.theirMsg]}>
              <Text style={isMyMessage ? styles.myText : styles.theirText}>{item.text}</Text>
              <Text style={styles.timeText}>{item.timestamp}</Text>
            </View>
          );
        }}
      />

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Nhập tin nhắn..."
        />
        <TouchableOpacity style={styles.sendBtn} onPress={sendMessage}>
          <Text style={styles.sendBtnText}>Gửi</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', padding: 10 },
  msgBubble: { maxWidth: '75%', padding: 12, borderRadius: 16, marginVertical: 5 },
  myMsg: { backgroundColor: '#0084ff', alignSelf: 'flex-end', borderBottomRightRadius: 2 },
  theirMsg: { backgroundColor: '#e5e5ea', alignSelf: 'flex-start', borderBottomLeftRadius: 2 },
  myText: { color: '#fff', fontSize: 15 },
  theirText: { color: '#000', fontSize: 15 },
  timeText: { fontSize: 10, color: '#8e8e93', marginTop: 4, alignSelf: 'flex-end' },
  inputContainer: { flexDirection: 'row', padding: 10, alignItems: 'center' },
  input: { flex: 1, backgroundColor: '#fff', padding: 10, borderRadius: 20, borderWidth: 1, borderColor: '#ddd', marginRight: 10 },
  sendBtn: { backgroundColor: '#0084ff', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 20 },
  sendBtnText: { color: '#fff', fontWeight: 'bold' },
});