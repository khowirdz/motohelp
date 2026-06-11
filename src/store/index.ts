import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import orderReducer from './slices/orderSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    order: orderReducer,
  },
});

// Định nghĩa kiểu dữ liệu cho toàn bộ State và Dispatch của App
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;