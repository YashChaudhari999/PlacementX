import { Server, Socket } from 'socket.io';
import { Server as HttpServer } from 'http';
import jwt from 'jsonwebtoken';

let io: Server;

export const initSocket = (httpServer: HttpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: '*', // For development, allow all. Change to specific origin in prod
      methods: ['GET', 'POST']
    }
  });

  // JWT Authentication Middleware
  io.use((socket: Socket, next) => {
    const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.split(' ')[1];
    
    if (!token) {
      return next(new Error('Authentication error: Token missing'));
    }

    try {
      if (!process.env.JWT_SECRET) {
        throw new Error('JWT_SECRET is required');
      }
      const decoded = jwt.verify(token, process.env.JWT_SECRET) as { id: string, role: string };
      // Attach user info to socket
      (socket as any).user = decoded;
      next();
    } catch (err) {
      return next(new Error('Authentication error: Invalid token'));
    }
  });

  io.on('connection', (socket: Socket) => {
    const user = (socket as any).user;
    
    console.log(`Socket connected: ${socket.id} (User: ${user.id}, Role: ${user.role})`);

    // 1. Join Individual Room
    socket.join(`user:${user.id}`);
    
    // 2. Join Role Room
    if (user.role === 'STUDENT') {
      socket.join('students');
    } else if (user.role === 'SUPER_ADMIN') {
      socket.join('admins');
    } else if (user.role === 'PLACEMENT_COORDINATOR') {
      socket.join('placement-cell');
    }

    // 3. Dynamic Room Joining (e.g. branch for students)
    socket.on('notification:join', (rooms: string[]) => {
      rooms.forEach(room => {
        socket.join(room);
        console.log(`Socket ${socket.id} joined room: ${room}`);
      });
    });

    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });

  return io;
};

export const getIO = (): Server => {
  if (!io) {
    throw new Error('Socket.io is not initialized!');
  }
  return io;
};
