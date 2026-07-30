import { Platform, ToastAndroid, Alert } from 'react-native';

export const Toast = {
  show: (message: string, isError: boolean = false) => {
    if (Platform.OS === 'android') {
      ToastAndroid.show(message, ToastAndroid.SHORT);
    } else {
      Alert.alert(isError ? 'Error' : 'Notification', message);
    }
  },
  success: (message: string) => Toast.show(message, false),
  error: (message: string) => Toast.show(message, true),
  info: (message: string) => Toast.show(message, false),
};
