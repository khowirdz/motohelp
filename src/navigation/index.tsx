import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '../store';

import LoginScreen from '../screens/auth/LoginScreen';

import MechanicHomeScreen from '../screens/mechanic/MechanicHomeScreen';
import IncomingCallScreen from '../screens/mechanic/IncomingCallScreen';
import MechanicTrackingScreen from '../screens/mechanic/MechanicTrackingScreen';

import HomeScreen from '../screens/user/HomeScreen';
import SOSScreen from '../screens/user/SOSScreen';
import TrackingScreen from '../screens/user/TrackingScreen';
import ReviewScreen from '../screens/user/ReviewScreen';
import HistoryScreen from '../screens/user/HistoryScreen';
import ProfileScreen from '../screens/user/ProfileScreen';

import ChatScreen from '../screens/common/ChatScreen';

import AdminScreen from '../screens/admin/AdminScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function UserTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#ff4d4d',
        tabBarInactiveTintColor: '#999',
        tabBarStyle: { paddingBottom: 5, height: 58 },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{ title: 'Trang chủ', tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>🏠</Text> }}
      />
      <Tab.Screen
        name="History"
        component={HistoryScreen}
        options={{ title: 'Lịch sử', tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>📋</Text> }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ title: 'Hồ sơ', tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>👤</Text> }}
      />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const user = useSelector((state: RootState) => state.auth.user);

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user === null ? (
          <Stack.Screen name="Auth" component={LoginScreen} />
        ) : user.role === 'admin' ? (
          <Stack.Screen name="AdminHome" component={AdminScreen} />
        ) : user.role === 'mechanic' ? (
          <>
            <Stack.Screen name="MechanicHome" component={MechanicHomeScreen} />
            <Stack.Screen name="IncomingCall" component={IncomingCallScreen} />
            <Stack.Screen name="MechanicTracking" component={MechanicTrackingScreen} />
            <Stack.Screen name="Chat" component={ChatScreen} />
          </>
        ) : (
          <>
            <Stack.Screen name="MainTabs" component={UserTabs} />
            <Stack.Screen name="SOS" component={SOSScreen} />
            <Stack.Screen name="Tracking" component={TrackingScreen} />
            <Stack.Screen name="Review" component={ReviewScreen} />
            <Stack.Screen name="Chat" component={ChatScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
