import RNToast from 'react-native-toast-message';

export const Toast = {
  show: (message: string, isError: boolean = false) => {
    RNToast.show({
      type: isError ? 'error' : 'success',
      text1: isError ? 'Error' : 'Success',
      text2: message,
      position: 'bottom',
      visibilityTime: 4000,
    });
  },
  success: (message: string) => {
    RNToast.show({
      type: 'success',
      text1: 'Success',
      text2: message,
      position: 'bottom',
    });
  },
  error: (message: string) => {
    RNToast.show({
      type: 'error',
      text1: 'Error',
      text2: message,
      position: 'bottom',
    });
  },
  info: (message: string) => {
    RNToast.show({
      type: 'info',
      text1: 'Info',
      text2: message,
      position: 'bottom',
    });
  },
};
