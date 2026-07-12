import { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import { useAuthStore } from '@/stores/authStore';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

const POLL_INTERVAL = 30_000; // 30 seconds

// Map notification type to a simple emoji/symbol so we stay in .ts (no JSX)
const typeEmoji: Record<string, string> = {
  ALERT: '🚨',
  SUCCESS: '✅',
  WARNING: '⚠️',
  INFO: '🔔',
};

export function useNotifications() {
  const { user } = useAuthStore();
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<any[]>([]);
  const prevCountRef = useRef<number | null>(null);
  const navigate = useNavigate();

  const fetchNotifications = useCallback(async () => {
    if (!user?.id) return;
    try {
      const res = await axios.get('http://localhost:5000/api/notifications', {
        headers: { 'x-user-id': user.id },
      });
      const sorted = res.data.sort(
        (a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      const count = sorted.filter((n: any) => !n.isRead).length;

      // Fire a toast only when new notifications appear since the last poll
      if (prevCountRef.current !== null && count > prevCountRef.current) {
        const newNotifs = sorted
          .filter((n: any) => !n.isRead)
          .slice(0, count - (prevCountRef.current ?? 0));

        newNotifs.forEach((n: any) => {
          const icon = typeEmoji[n.type] ?? typeEmoji.INFO;

          toast(`${icon} ${n.title}`, {
            description: n.message,
            action: n.link
              ? { label: 'View', onClick: () => navigate(n.link) }
              : { label: 'Open', onClick: () => navigate('/student/notifications') },
            duration: 6000,
          });
        });
      }

      prevCountRef.current = count;
      setUnreadCount(count);
      setNotifications(sorted);
    } catch {
      // Silently fail polling errors — don't disrupt the UI
    }
  }, [user?.id, navigate]);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  return { unreadCount, notifications, refetch: fetchNotifications };
}
