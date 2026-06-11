import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface LocationData {
  latitude: number;
  longitude: number;
}

interface Mechanic {
  id: string;
  name: string;
  phoneNumber: string;
  location: LocationData;
  rating: number;
  avatar?: string;
}

interface Order {
  id: string;
  userId: string;
  mechanicId?: string;
  issueType: string;
  description?: string;
  status: 'PENDING' | 'ACCEPTED' | 'ARRIVED' | 'COMPLETED' | 'CANCELLED';
  userLocation: LocationData;
  priceEstimate: number;
  createdAt: string;
}

interface OrderState {
  currentOrder: Order | null;
  nearbyMechanics: Mechanic[];
  mechanicLocation: LocationData | null;
}

const initialState: OrderState = {
  currentOrder: null,
  nearbyMechanics: [],
  mechanicLocation: null,
};

const orderSlice = createSlice({
  name: 'order',
  initialState,
  reducers: {
    setNearbyMechanics: (state, action: PayloadAction<Mechanic[]>) => {
      state.nearbyMechanics = action.payload;
    },
    setCurrentOrder: (state, action: PayloadAction<Order | null>) => {
      state.currentOrder = action.payload;
    },
    updateMechanicLocation: (state, action: PayloadAction<LocationData>) => {
      state.mechanicLocation = action.payload;
    },
  },
});

export const { setNearbyMechanics, setCurrentOrder, updateMechanicLocation } = orderSlice.actions;
export default orderSlice.reducer;