import React, { useEffect, useRef } from 'react';
import { Provider } from 'react-redux';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as Notifications from 'expo-notifications';
import { store } from './src/store';
import AppNavigator from './src/navigation';
import { notificationService } from './src/services/notificationService';

export default function App() {
  // const notificationListener = useRef<Notifications.Subscription>();
  // const responseListener = useRef<Notifications.Subscription>();
// 
  // useEffect(() => {
    // notificationService.registerForPushNotifications();
// 
    // notificationListener.current = notificationService.addReceivedListener(() => {});
    // responseListener.current = notificationService.addResponseListener(() => {});
// 
    // return () => {
      // notificationListener.current?.remove();
      // responseListener.current?.remove();
    // };
  // }, []);

  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <AppNavigator />
      </SafeAreaProvider>
    </Provider>
  );
}
