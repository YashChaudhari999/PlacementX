import 'react-native-gesture-handler';
import { LogBox } from 'react-native';

const originalConsoleError = console.error;
console.error = (...args) => {
  if (typeof args[0] === 'string' && args[0].includes('expo-notifications')) {
    return;
  }
  originalConsoleError(...args);
};

const originalConsoleWarn = console.warn;
console.warn = (...args) => {
  if (typeof args[0] === 'string' && args[0].includes('expo-notifications')) {
    return;
  }
  originalConsoleWarn(...args);
};

LogBox.ignoreLogs([
  'expo-notifications: Android Push notifications functionality provided by expo-notifications was removed from Expo Go',
]);

import { registerRootComponent } from 'expo';
import App from './App';
registerRootComponent(App);
