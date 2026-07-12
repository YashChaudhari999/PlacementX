import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { useAuthStore } from '../store/authStore';
import { useRouter } from 'expo-router';

export default function RootLayout() {
  const { loadFromStorage, user, isLoading } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    loadFromStorage();
  }, []);

  useEffect(() => {
    if (!isLoading) {
      if (user) {
        if (user.role === 'STUDENT') {
          router.replace('/(student)/dashboard');
        } else {
          router.replace('/(admin)/dashboard');
        }
      } else {
        router.replace('/auth/role-select');
      }
    }
  }, [user, isLoading]);

  return (
    <>
      <StatusBar style="auto" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="auth/role-select" />
        <Stack.Screen name="auth/login" />
        <Stack.Screen name="(student)" />
        <Stack.Screen name="(admin)" />
      </Stack>
    </>
  );
}
