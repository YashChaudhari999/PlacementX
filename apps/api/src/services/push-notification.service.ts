import prisma from '../utils/prisma';
// ─── Push Notification Service ──────────────────────────
// Handles sending push notifications via Expo Push Notification API.
// Supports batch sending, automatic token cleanup, and priority mapping.



// Expo Push API endpoint
const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';

// ─── Types ──────────────────────────────────────────────

interface PushPayload {
  userId: string;
  title: string;
  body: string;
  data?: Record<string, any>;
  priority?: 'HIGH' | 'MEDIUM' | 'LOW';
  channelId?: string;
  image?: string;
  sound?: string;
  badge?: number;
}

interface ExpoPushMessage {
  to: string;
  title: string;
  body: string;
  data?: Record<string, any>;
  priority?: 'high' | 'normal' | 'default';
  sound?: 'default' | null;
  channelId?: string;
  badge?: number;
  _displayInForeground?: boolean;
}

interface ExpoPushTicket {
  status: 'ok' | 'error';
  id?: string;
  message?: string;
  details?: {
    error?: 'DeviceNotRegistered' | 'MessageTooBig' | 'MessageRateExceeded' | 'MismatchSenderId' | 'InvalidCredentials';
  };
}

// ─── Priority Mapping ───────────────────────────────────

const mapPriority = (priority: string): 'high' | 'normal' | 'default' => {
  switch (priority) {
    case 'HIGH': return 'high';
    case 'MEDIUM': return 'normal';
    case 'LOW': return 'default';
    default: return 'normal';
  }
};

// ─── Channel Mapping ────────────────────────────────────

const getChannelId = (type: string): string => {
  const channelMap: Record<string, string> = {
    placement_drive: 'placement',
    interview: 'interview',
    meeting: 'meeting',
    assignment: 'assignment',
    reminder: 'reminder',
    message: 'messages',
    payment: 'payment',
    security: 'security',
    system: 'default',
  };
  return channelMap[type] || 'default';
};

// ─── Send Push to Single User ───────────────────────────

/**
 * Send push notification to all devices registered by a user.
 * Automatically cleans up invalid tokens (DeviceNotRegistered).
 */
export const sendPushToUser = async (payload: PushPayload): Promise<void> => {
  try {
    // Get all device tokens for this user
    const deviceTokens = await prisma.deviceToken.findMany({
      where: { userId: payload.userId },
      select: { id: true, token: true },
    });

    if (deviceTokens.length === 0) {
      // No registered devices — notification stored in DB but not pushed
      return;
    }

    // Build Expo push messages
    const messages: ExpoPushMessage[] = deviceTokens.map(device => ({
      to: device.token,
      title: payload.title,
      body: payload.body,
      data: payload.data || {},
      priority: mapPriority(payload.priority || 'MEDIUM'),
      sound: payload.priority === 'LOW' ? null : 'default',
      channelId: payload.channelId || getChannelId(payload.data?.type || 'system'),
      _displayInForeground: true,
    }));

    // Send in batches of 100 (Expo limit)
    const batches = chunkArray(messages, 100);
    
    for (const batch of batches) {
      const response = await fetch(EXPO_PUSH_URL, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Accept-encoding': 'gzip, deflate',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(batch),
      });

      if (!response.ok) {
        console.error(`Push notification API error: ${response.status} ${response.statusText}`);
        continue;
      }

      const result = await response.json();
      const tickets: ExpoPushTicket[] = result.data || [];

      // Clean up invalid tokens
      const tokensToRemove: string[] = [];
      
      tickets.forEach((ticket, index) => {
        if (ticket.status === 'error') {
          console.error(`Push error for token: ${ticket.message}`);
          
          if (ticket.details?.error === 'DeviceNotRegistered') {
            // Token is no longer valid — mark for removal
            const deviceToken = deviceTokens[index];
            if (deviceToken) {
              tokensToRemove.push(deviceToken.id);
            }
          }
        }
      });

      // Remove invalid tokens from database
      if (tokensToRemove.length > 0) {
        await prisma.deviceToken.deleteMany({
          where: { id: { in: tokensToRemove } },
        });
        console.log(`Cleaned up ${tokensToRemove.length} invalid device token(s).`);
      }
    }
  } catch (error) {
    console.error('Push notification delivery failed:', error);
    // Don't throw — push failure shouldn't break notification creation
  }
};

// ─── Send Push to Multiple Users ────────────────────────

/**
 * Send push notification to multiple users efficiently.
 * Batches all tokens together for optimal API usage.
 */
export const sendPushToUsers = async (
  userIds: string[],
  title: string,
  body: string,
  data?: Record<string, any>,
  priority?: string,
): Promise<void> => {
  try {
    // Get all device tokens for all target users
    const deviceTokens = await prisma.deviceToken.findMany({
      where: { userId: { in: userIds } },
      select: { id: true, token: true, userId: true },
    });

    if (deviceTokens.length === 0) return;

    const messages: ExpoPushMessage[] = deviceTokens.map(device => ({
      to: device.token,
      title,
      body,
      data: data || {},
      priority: mapPriority(priority || 'MEDIUM'),
      sound: priority === 'LOW' ? null : 'default',
      channelId: getChannelId(data?.type || 'system'),
      _displayInForeground: true,
    }));

    // Send in batches of 100
    const batches = chunkArray(messages, 100);
    
    for (const batch of batches) {
      try {
        const response = await fetch(EXPO_PUSH_URL, {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Accept-encoding': 'gzip, deflate',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(batch),
        });

        if (!response.ok) {
          console.error(`Bulk push API error: ${response.status}`);
          continue;
        }

        const result = await response.json();
        const tickets: ExpoPushTicket[] = result.data || [];

        // Clean up invalid tokens
        const tokensToRemove: string[] = [];
        tickets.forEach((ticket, index) => {
          if (ticket.status === 'error' && ticket.details?.error === 'DeviceNotRegistered') {
            const deviceToken = deviceTokens[index];
            if (deviceToken) tokensToRemove.push(deviceToken.id);
          }
        });

        if (tokensToRemove.length > 0) {
          await prisma.deviceToken.deleteMany({
            where: { id: { in: tokensToRemove } },
          });
        }
      } catch (batchError) {
        console.error('Batch push send error:', batchError);
      }
    }
  } catch (error) {
    console.error('Bulk push notification delivery failed:', error);
  }
};

// ─── Utility ────────────────────────────────────────────

/**
 * Split an array into chunks of a given size.
 */
function chunkArray<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}
