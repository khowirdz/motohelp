import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator, CardStyleInterpolators } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { Ionicons } from '@expo/vector-icons'; // 🔥 Dùng Icon chuẩn của Expo

// Auth
import LoginScreen from '../screens/auth/LoginScreen';

// Mechanic
import MechanicHomeScreen from '../screens/mechanic/MechanicHomeScreen';
import IncomingCallScreen from '../screens/mechanic/IncomingCallScreen';
import MechanicTrackingScreen from '../screens/mechanic/MechanicTrackingScreen';
import MechanicHistoryScreen from '../screens/mechanic/MechanicHistoryScreen';

// User
import HomeScreen from '../screens/user/HomeScreen';
import SOSScreen from '../screens/user/SOSScreen';
import TrackingScreen from '../screens/user/TrackingScreen';
import ReviewScreen from '../screens/user/ReviewScreen';
import HistoryScreen from '../screens/user/HistoryScreen';
import ProfileScreen from '../screens/user/ProfileScreen';

// Common & Admin
import ChatScreen from '../screens/common/ChatScreen';
import AdminScreen from '../screens/admin/AdminScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// ==========================================
// TABS CỦA KHÁCH HÀNG
// ==========================================
function UserTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#0084ff', // Xanh dương nổi bật cho Khách
        tabBarInactiveTintColor: '#9ca3af',
        tabBarStyle: { 
          paddingBottom: 5, 
          paddingTop: 5,
          height: 60, 
          backgroundColor: '#fff',
          borderTopWidth: 1,
          borderTopColor: '#f3f4f6'
        },
        // Đổi màu và trạng thái Icon khi click
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'ellipse';

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'History') {
            iconName = focused ? 'receipt' : 'receipt-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ title: 'Trang chủ' }} />
      <Tab.Screen name="History" component={HistoryScreen} options={{ title: 'Lịch sử' }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: 'Hồ sơ' }} />
    </Tab.Navigator>
  );
}

// ==========================================
// BỘ ĐIỀU HƯỚNG TỔNG (ROOT NAVIGATOR)
// ==========================================
export default function AppNavigator() {
  const user = useSelector((state: RootState) => state.auth.user);

  return (
    <NavigationContainer>
      <Stack.Navigator 
        screenOptions={{ 
          headerShown: false,
          // 🔥 Hiệu ứng trượt từ phải sang giống hệt app iOS/Android Native
          cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS, 
        }}
      >
        {user === null ? (
          <Stack.Screen name="Auth" component={LoginScreen} />
        ) : user.role === 'admin' ? (
          <Stack.Screen name="AdminHome" component={AdminScreen} />
        ) : user.role === 'mechanic' ? (
          <>
            <Stack.Screen name="MechanicHome" component={MechanicHomeScreen} />
            {/* 🔥 Màn hình có người gọi tới sẽ trượt từ dưới lên (Modal) */}
            <Stack.Screen 
              name="IncomingCall" 
              component={IncomingCallScreen} 
              options={{ 
                presentation: 'modal',
                cardStyleInterpolator: CardStyleInterpolators.forModalPresentationIOS
              }} 
            />
            <Stack.Screen name="MechanicTracking" component={MechanicTrackingScreen} />
            <Stack.Screen name="Chat" component={ChatScreen} />
            <Stack.Screen name="MechanicHistory" component={MechanicHistoryScreen} />
          </>
        ) : (
          <>
            <Stack.Screen name="MainTabs" component={UserTabs} />
            {/* 🔥 Màn hình xác nhận SOS trượt từ dưới lên để tạo cảm giác Form điền nhanh */}
            <Stack.Screen 
              name="SOS" 
              component={SOSScreen} 
              options={{ 
                presentation: 'modal',
                cardStyleInterpolator: CardStyleInterpolators.forModalPresentationIOS
              }} 
            />
            <Stack.Screen name="Tracking" component={TrackingScreen} />
            <Stack.Screen name="Review" component={ReviewScreen} />
            <Stack.Screen name="Chat" component={ChatScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}