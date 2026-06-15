import locationService from '../services/locationService';

jest.mock('expo-location', () => ({
  requestForegroundPermissionsAsync: jest.fn(),
  getCurrentPositionAsync: jest.fn(),
  Accuracy: { Balanced: 3 },
}));

describe('locationService.calculateDistance (Haversine)', () => {
  it('returns 0 for identical coordinates', () => {
    const point = { latitude: 10.762, longitude: 106.66 };
    expect(locationService.calculateDistance(point, point)).toBe(0);
  });

  it('calculates approximate distance between Hà Nội and TP.HCM (~1740km)', () => {
    const hanoi = { latitude: 21.028, longitude: 105.834 };
    const hcmc = { latitude: 10.823, longitude: 106.629 };
    const dist = locationService.calculateDistance(hanoi, hcmc);
    expect(dist).toBeGreaterThan(1600);
    expect(dist).toBeLessThan(1850);
  });

  it('is symmetric (A→B == B→A)', () => {
    const a = { latitude: 10.0, longitude: 106.0 };
    const b = { latitude: 10.5, longitude: 106.5 };
    expect(locationService.calculateDistance(a, b)).toBeCloseTo(
      locationService.calculateDistance(b, a),
      8
    );
  });

  it('returns positive value for any two different points', () => {
    const a = { latitude: 10.762, longitude: 106.66 };
    const b = { latitude: 10.771, longitude: 106.698 };
    expect(locationService.calculateDistance(a, b)).toBeGreaterThan(0);
  });
});

describe('locationService.formatDistance', () => {
  it('formats meters for distance under 1km', () => {
    expect(locationService.formatDistance(0.5)).toBe('500 m');
  });

  it('formats kilometers for distance over 1km', () => {
    expect(locationService.formatDistance(3.456)).toBe('3.5 km');
  });

  it('formats exactly 1km', () => {
    expect(locationService.formatDistance(1)).toBe('1.0 km');
  });
});
