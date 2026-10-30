// ─── Socket.IO Client Service ───────────────────────────
// Manages WebSocket connection for real-time notifications.
// Auto-connects on login, disconnects on logout, handles
// reconnection with exponential backoff.

import { io, Socket } from 'socket.io-client';
import { API_BASE_URL } from '../config/api';
import { useAuthStore } from '../stores/authStore';

let socket: Socket | null = null;
let isConnected = false;

// ─── Event Callback Types ───────────────────────────────

type NotificationCallback = (notification: any) => void;
type CountUpdateCallback = (data: { count: number }) => void;
type UpdateCallback = () => void;
type DataChangedCallback = (event: { method: string; resource: string; path: string; occurredAt: string }) => void;

const listeners: {
  onNewNotification: NotificationCallback[];
  onCountUpdate: CountUpdateCallback[];
  onUpdate: UpdateCallback[];
  onDataChanged: DataChangedCallback[];
  onConnected: UpdateCallback[];
} = {
  onNewNotification: [],
  onCountUpdate: [],
  onUpdate: [],
  onDataChanged: [],
  onConnected: [],
};

// ─── Connection Management ──────────────────────────────

/**
 * Initialize Socket.IO connection with JWT authentication.
 * Auto-reconnects on disconnection with exponential backoff.
 */
export const connectSocket = (): void => {
  const token = useAuthStore.getState().token;
  if (!token) {
    console.log('No auth token — skipping socket connection.');
    return;
  }

  // Don't create duplicate connections
  if (socket?.connected) {
    return;
  }

  // Parse the base URL to get the socket server URL
  // API_BASE_URL is like "http://host:port/api", socket connects to "http://host:port"
  const socketUrl = API_BASE_URL.replace(/\/api$/, '');

  socket = io(socketUrl, {
    auth: { token },
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 30000,
    timeout: 10000,
  });

  // ─── Event Handlers ─────────────────────────────────

  socket.on('connect', () => {
    isConnected = true;
    console.log('Socket connected:', socket?.id);
    listeners.onConnected.forEach(cb => cb());
  });

  socket.on('disconnect', (reason) => {
    isConnected = false;
    console.log('Socket disconnected:', reason);
  });

  socket.on('connect_error', (error) => {
    isConnected = false;
    console.error('Socket connection error:', error.message);
  });

  // ─── Notification Events ────────────────────────────

  socket.on('notification:new', (notification: any) => {
    listeners.onNewNotification.forEach(cb => cb(notification));
  });

  socket.on('notification:count-update', (data: { count: number }) => {
    listeners.onCountUpdate.forEach(cb => cb(data));
  });

  socket.on('notification:update', () => {
    listeners.onUpdate.forEach(cb => cb());
  });

  socket.on('data:changed', (event) => {
    listeners.onDataChanged.forEach(cb => cb(event));
  });
};

/**
 * Disconnect the socket connection (on logout).
 */
export const disconnectSocket = (): void => {
  if (socket) {
    socket.removeAllListeners();
    socket.disconnect();
    socket = null;
    isConnected = false;
    console.log('Socket disconnected manually.');
  }
};

// ─── Event Subscription ────────────────────────────────

/**
 * Subscribe to new notification events.
 * Returns an unsubscribe function.
 */
export const onNewNotification = (callback: NotificationCallback): (() => void) => {
  listeners.onNewNotification.push(callback);
  return () => {
    listeners.onNewNotification = listeners.onNewNotification.filter(cb => cb !== callback);
  };
};

/**
 * Subscribe to unread count updates.
 * Returns an unsubscribe function.
 */
export const onCountUpdate = (callback: CountUpdateCallback): (() => void) => {
  listeners.onCountUpdate.push(callback);
  return () => {
    listeners.onCountUpdate = listeners.onCountUpdate.filter(cb => cb !== callback);
  };
};

/**
 * Subscribe to generic notification update events (triggers refetch).
 * Returns an unsubscribe function.
 */
export const onNotificationUpdate = (callback: UpdateCallback): (() => void) => {
  listeners.onUpdate.push(callback);
  return () => {
    listeners.onUpdate = listeners.onUpdate.filter(cb => cb !== callback);
  };
};

export const onDataChanged = (callback: DataChangedCallback): (() => void) => {
  listeners.onDataChanged.push(callback);
  return () => {
    listeners.onDataChanged = listeners.onDataChanged.filter(cb => cb !== callback);
  };
};

export const onSocketConnected = (callback: UpdateCallback): (() => void) => {
  listeners.onConnected.push(callback);
  return () => {
    listeners.onConnected = listeners.onConnected.filter(cb => cb !== callback);
  };
};

// ─── Status ─────────────────────────────────────────────

/**
 * Check if the socket is currently connected.
 */
export const getSocketStatus = (): boolean => isConnected;

/**
 * Get the raw socket instance (for advanced use).
 */
export const getSocket = (): Socket | null => socket;
