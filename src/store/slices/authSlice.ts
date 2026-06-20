import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface User {
  id: string;
  phoneNumber: string;
  name?: string;
  licensePlate?: string;
  role: 'user' | 'mechanic' | 'admin';
}

interface AuthState {
  user: User | null;
  otpSent: boolean;
  loading: boolean;
}

const initialState: AuthState = {
  user: null,
  otpSent: false,
  loading: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setOtpSent: (state, action: PayloadAction<boolean>) => {
      state.otpSent = action.payload;
    },
    loginSuccess: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.otpSent = false;
    },
    logout: (state) => {
      state.user = null;
    },
  },
});

export const { setLoading, setOtpSent, loginSuccess, logout } = authSlice.actions;
export default authSlice.reducer;