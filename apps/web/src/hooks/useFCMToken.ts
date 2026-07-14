import { useEffect, useState } from 'react';
import { getToken, onMessage } from 'firebase/messaging';
import { messaging } from '../lib/firebase/config/firebaseApp';
import api from '../lib/api'; // assuming there's an api client in lib
import { toast } from 'sonner'; // this app uses sonner based on package.json

export const useFCMToken = (user: any) => {
  const [fcmToken, setFcmToken] = useState<string | null>(null);

  useEffect(() => {
    if (!user || !messaging) return;

    const requestPermissionAndGetToken = async () => {
      try {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          // Register the service worker with the config params
          const swUrl = `/firebase-messaging-sw.js?apiKey=${import.meta.env.VITE_FIREBASE_API_KEY}&authDomain=${import.meta.env.VITE_FIREBASE_AUTH_DOMAIN}&databaseURL=${import.meta.env.VITE_FIREBASE_DATABASE_URL}&projectId=${import.meta.env.VITE_FIREBASE_PROJECT_ID}&storageBucket=${import.meta.env.VITE_FIREBASE_STORAGE_BUCKET}&messagingSenderId=${import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID}&appId=${import.meta.env.VITE_FIREBASE_APP_ID}`;
          
          const registration = await navigator.serviceWorker.register(swUrl);
          
          const currentToken = await getToken(messaging, { 
            vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY, // Needs to be added to .env if web push cert is used, otherwise generic might fail
            serviceWorkerRegistration: registration 
          });

          if (currentToken) {
            setFcmToken(currentToken);
            // Send token to backend
            await api.post('/notifications/register-token', { token: currentToken });
          } else {
            console.log('No registration token available. Request permission to generate one.');
          }
        } else {
          console.log('Unable to get permission to notify.');
        }
      } catch (err) {
        console.error('An error occurred while retrieving token. ', err);
      }
    };

    requestPermissionAndGetToken();

    // Listen for foreground messages
    const unsubscribe = onMessage(messaging, (payload) => {
      console.log('Message received. ', payload);
      if (payload.notification) {
        toast(payload.notification.title, {
          description: payload.notification.body,
          action: payload.data?.url ? {
            label: 'View',
            onClick: () => window.location.href = payload.data!.url
          } : undefined
        });
      }
    });

    return () => unsubscribe();
  }, [user]);

  return { fcmToken };
};
