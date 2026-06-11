import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useSelector } from 'react-redux';
import { RootState } from '../store';

// Màn hình Auth
import LoginScreen from '../screens/auth/LoginScreen';

// Màn hình Thợ
import MechanicHomeScreen from '../screens/mechanic/MechanicHomeScreen';
import IncomingCallScreen from '../screens/mechanic/IncomingCallScreen';

// Màn hình Người dùng
import HomeScreen from '../screens/user/HomeScreen';
import SOSScreen from '../screens/user/SOSScreen';
import TrackingScreen from '../screens/user/TrackingScreen';
import ReviewScreen from '../screens/user/ReviewScreen';

// Màn hình Dùng chung
import ChatScreen from '../screens/common/ChatScreen';

const Stack = createStackNavigator();

export default function AppNavigator() {
  const user = useSelector((state: RootState) => state.auth.user);

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user === null ? (
          // Khởi đầu vào App chưa có Session -> Đưa vào màn hình đăng nhập
          <Stack.Screen name="Auth" component={LoginScreen} />
        ) : user.role === 'mechanic' ? (
          // Luồng ứng dụng của bên đối tác Thợ
          <>
            <Stack.Screen name="MechanicHome" component={MechanicHomeScreen} />
            <Stack.Screen name="IncomingCall" component={IncomingCallScreen} />
          </>
        ) : (
          // Luồng ứng dụng của Khách hàng
          <>
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="SOS" component={SOSScreen} />
            <Stack.Screen name="Tracking" component={TrackingScreen} />
            <Stack.Screen name="Review" component={ReviewScreen} />
          </>
        )}
        
        {/* Màn hình Chat thời gian thực dùng chung */}
        <Stack.Screen name="Chat" component={ChatScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}