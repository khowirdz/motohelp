import React from 'react';
import { Provider } from 'react-redux';
import { store } from './src/store'; // Điều chỉnh lại đường dẫn chính xác tới store của nhóm bạn
import AppNavigator from '././src/navigation'; // Điều chỉnh đường dẫn tới file Root Navigation chính
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function App() {
  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <AppNavigator />
      </SafeAreaProvider>
    </Provider>
  );
}