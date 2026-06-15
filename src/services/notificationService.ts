import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true, // Bổ sung cờ hiển thị biểu ngữ nổi
    shouldShowList: true,   // Bổ sung cờ lưu vào danh sách thông báo
  }),
});

export const notificationService = {
  async registerForPushNotifications(): Promise<string | null> {
    const { status: existing } = await Notifications.getPermissionsAsync();
    let finalStatus = existing;
    if (existing !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') return null;

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'MotoCứu',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#E63946',
      });
    }

    try {
      const token = await Notifications.getExpoPushTokenAsync();
      return token.data;
    } catch {
      return null;
    }
  },

  async notify(title: string, body: string) {
    await Notifications.scheduleNotificationAsync({
      content: { title, body, sound: true },
      trigger: null,
    });
  },

  addReceivedListener(callback: (n: Notifications.Notification) => void) {
    return Notifications.addNotificationReceivedListener(callback);
  },

  // addResponseListener(callback: (r: Notifications.NotificationResponse) => void) {
    // return Notifications.addNotificationResponseListener(callback);
  // },
};
