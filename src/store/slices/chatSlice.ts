// src/store/slices/chatSlice.ts
// ✅ FIX lỗi ts(2305): import ChatMessage từ đúng đường dẫn

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ChatMessage } from '../../types';  // ← đường dẫn đúng cho Expo project

interface ChatState {
  messagesByOrder: Record<string, ChatMessage[]>;
  typingByOrder:   Record<string, string[]>;
  unreadByOrder:   Record<string, number>;
  isLoadingHistory: boolean;
}

const initialState: ChatState = {
  messagesByOrder:  {},
  typingByOrder:    {},
  unreadByOrder:    {},
  isLoadingHistory: false,
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setHistory: (
      state,
      action: PayloadAction<{ orderId: string; messages: ChatMessage[] }>
    ) => {
      state.messagesByOrder[action.payload.orderId] = action.payload.messages;
      state.isLoadingHistory = false;
    },

    addMessage: (state, action: PayloadAction<ChatMessage>) => {
      const { orderId } = action.payload;
      if (!state.messagesByOrder[orderId]) {
        state.messagesByOrder[orderId] = [];
      }
      // Chống dội âm: chỉ thêm nếu _id chưa tồn tại
      const exists = state.messagesByOrder[orderId].some(
        (m) => m._id === action.payload._id
      );
      if (!exists) {
        state.messagesByOrder[orderId].push(action.payload);
      }
    },

    updateMessageStatus: (
      state,
      action: PayloadAction<{
        orderId: string;
        messageId: string;
        status: ChatMessage['status'];
      }>
    ) => {
      const { orderId, messageId, status } = action.payload;
      const msgs = state.messagesByOrder[orderId];
      if (!msgs) return;
      const msg = msgs.find((m) => m._id === messageId);
      if (msg) msg.status = status;
    },

    setTyping: (
      state,
      action: PayloadAction<{ orderId: string; userId: string; isTyping: boolean }>
    ) => {
      const { orderId, userId, isTyping } = action.payload;
      if (!state.typingByOrder[orderId]) state.typingByOrder[orderId] = [];
      if (isTyping) {
        if (!state.typingByOrder[orderId].includes(userId)) {
          state.typingByOrder[orderId].push(userId);
        }
      } else {
        state.typingByOrder[orderId] = state.typingByOrder[orderId].filter(
          (id) => id !== userId
        );
      }
    },

    markOrderRead: (state, action: PayloadAction<string>) => {
      state.unreadByOrder[action.payload] = 0;
    },

    incrementUnread: (state, action: PayloadAction<string>) => {
      const orderId = action.payload;
      state.unreadByOrder[orderId] = (state.unreadByOrder[orderId] ?? 0) + 1;
    },

    setLoadingHistory: (state, action: PayloadAction<boolean>) => {
      state.isLoadingHistory = action.payload;
    },

    clearChat: (state, action: PayloadAction<string>) => {
      delete state.messagesByOrder[action.payload];
      delete state.typingByOrder[action.payload];
      delete state.unreadByOrder[action.payload];
    },
  },
});

export const {
  setHistory,
  addMessage,
  updateMessageStatus,
  setTyping,
  markOrderRead,
  incrementUnread,
  setLoadingHistory,
  clearChat,
} = chatSlice.actions;

export default chatSlice.reducer;