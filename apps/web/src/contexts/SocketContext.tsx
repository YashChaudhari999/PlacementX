import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '@/stores/authStore';
import toast from 'react-hot-toast';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  joinRooms: (rooms: string[]) => void;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
  joinRooms: () => {},
});

export const useSocket = () => useContext(SocketContext);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, token } = useAuthStore();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!token || !user) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
        setIsConnected(false);
      }
      return;
    }

    const socketUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';
    
    const newSocket = io(socketUrl, {
      auth: {
        token
      },
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    newSocket.on('connect', () => {
      console.log('Socket connected:', newSocket.id);
      setIsConnected(true);
      
      // Request to join default rooms based on profile if needed
      // (The backend already joins user:id, role, etc. automatically)
      if (user.role === 'STUDENT' && (user as any).studentProfile?.branch) {
         newSocket.emit('notification:join', [`department:${(user as any).studentProfile.branch}`]);
      }
    });

    newSocket.on('disconnect', () => {
      console.log('Socket disconnected');
      setIsConnected(false);
    });

    // Global listener for new notifications to trigger toast
    newSocket.on('notification:new', (notification) => {
      // Use react-hot-toast for a global popup
      toast(
        (t) => (
          <div className="flex flex-col cursor-pointer" onClick={() => {
              if (notification.actionUrl) window.location.href = notification.actionUrl;
              toast.dismiss(t.id);
          }}>
            <strong className="text-sm font-semibold">{notification.title}</strong>
            <span className="text-sm text-gray-600 line-clamp-2">{notification.message}</span>
          </div>
        ),
        {
          duration: 5000,
          position: 'top-right',
          style: {
            borderLeft: notification.priority === 'HIGH' ? '4px solid #ef4444' : '4px solid #3b82f6',
          }
        }
      );
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [token, user]);

  const joinRooms = (rooms: string[]) => {
    if (socket && isConnected) {
      socket.emit('notification:join', rooms);
    }
  };

  return (
    <SocketContext.Provider value={{ socket, isConnected, joinRooms }}>
      {children}
    </SocketContext.Provider>
  );
};
