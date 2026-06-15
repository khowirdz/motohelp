import orderReducer, {
  setCurrentOrder,
  setNearbyMechanics,
  updateMechanicLocation,
} from '../store/slices/orderSlice';

const initialState = {
  currentOrder: null,
  nearbyMechanics: [],
  mechanicLocation: null,
};

const mockOrder = {
  id: 'ORD_001',
  userId: 'USR_001',
  issueType: 'FLAT_TIRE',
  status: 'PENDING' as const,
  userLocation: { latitude: 10.762, longitude: 106.66 },
  priceEstimate: 50000,
  createdAt: '2026-06-14T10:00:00.000Z',
};

describe('orderSlice reducers', () => {
  it('returns initial state', () => {
    expect(orderReducer(undefined, { type: 'unknown' })).toEqual(initialState);
  });

  it('sets current order', () => {
    const state = orderReducer(initialState, setCurrentOrder(mockOrder));
    expect(state.currentOrder).toEqual(mockOrder);
  });

  it('clears current order', () => {
    const withOrder = { ...initialState, currentOrder: mockOrder };
    const state = orderReducer(withOrder, setCurrentOrder(null));
    expect(state.currentOrder).toBeNull();
  });

  it('updates mechanic location', () => {
    const coords = { latitude: 10.78, longitude: 106.7 };
    const state = orderReducer(initialState, updateMechanicLocation(coords));
    expect(state.mechanicLocation).toEqual(coords);
  });

  it('sets nearby mechanics list', () => {
    const mechanics = [
      { id: 'MEC_001', name: 'Thợ A', phoneNumber: '0901234567', location: { latitude: 10.76, longitude: 106.65 }, rating: 4.8 },
      { id: 'MEC_002', name: 'Thợ B', phoneNumber: '0912345678', location: { latitude: 10.77, longitude: 106.67 }, rating: 4.5 },
    ];
    const state = orderReducer(initialState, setNearbyMechanics(mechanics));
    expect(state.nearbyMechanics).toHaveLength(2);
    expect(state.nearbyMechanics[0].id).toBe('MEC_001');
  });

  it('replaces mechanics list on each update', () => {
    const first = [{ id: 'MEC_001', name: 'Thợ A', phoneNumber: '09x', location: { latitude: 0, longitude: 0 }, rating: 5 }];
    const second = [
      { id: 'MEC_002', name: 'Thợ B', phoneNumber: '09y', location: { latitude: 0, longitude: 0 }, rating: 4 },
      { id: 'MEC_003', name: 'Thợ C', phoneNumber: '09z', location: { latitude: 0, longitude: 0 }, rating: 3 },
    ];
    let state = orderReducer(initialState, setNearbyMechanics(first));
    state = orderReducer(state, setNearbyMechanics(second));
    expect(state.nearbyMechanics).toHaveLength(2);
    expect(state.nearbyMechanics[0].id).toBe('MEC_002');
  });
});
