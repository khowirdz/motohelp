// src/store/index.ts
import { configureStore } from '@reduxjs/toolkit';
import authReducer  from './slices/authSlice';
import orderReducer from './slices/orderSlice';
import chatReducer  from './slices/chatSlice'; // ← THÊM DÒNG NÀY

export const store = configureStore({
  reducer: {
    auth:  authReducer,
    order: orderReducer,
    chat:  chatReducer,  // ← THÊM DÒNG NÀY
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false }),
});

export type RootState   = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;