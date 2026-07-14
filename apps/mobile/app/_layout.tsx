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
        // Enforce student only access
        if (user.role === 'STUDENT') {
          router.replace('/(student)/dashboard');
        } else {
          // If a non-student somehow logs in, log them out or redirect to login
          router.replace('/auth/login');
        }
      } else {
        router.replace('/auth/login');
      }
    }
  }, [user, isLoading]);

  return (
    <>
      <StatusBar style="auto" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="auth/login" />
        <Stack.Screen name="(student)" />
      </Stack>
    </>
  );
}
