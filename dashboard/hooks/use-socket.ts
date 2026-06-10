import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

let globalSocket: Socket | null = null;

export function useSocket(
  userId: string | null,
  onTelemetry: (data: any) => void,
  onStatus: (data: any) => void,
) {
  const onTelemetryRef = useRef(onTelemetry);
  const onStatusRef = useRef(onStatus);

  useEffect(() => { onTelemetryRef.current = onTelemetry; });
  useEffect(() => { onStatusRef.current = onStatus; });

  useEffect(() => {
    if (!userId) return;

    // Reuse existing connection if already connected
    if (globalSocket?.connected) {
      globalSocket.emit('join:dashboard', userId);
      return;
    }

    globalSocket = io(process.env.NEXT_PUBLIC_WS_URL!, {
      transports: ['websocket'],
      reconnectionAttempts: 5,
    });

    globalSocket.on('connect', () => {
      console.log('✅ WebSocket connected:', globalSocket?.id);
      globalSocket?.emit('join:dashboard', userId);
    });

    globalSocket.on('joined', (data) => {
      console.log('🏠 Joined room:', data);
    });

    globalSocket.on('telemetry', (data) => {
      console.log('📡 Telemetry received:', data);
      onTelemetryRef.current(data);
    });

    globalSocket.on('device:status', (data) => {
      onStatusRef.current(data);
    });

    globalSocket.on('connect_error', (err) => {
      console.error('❌ Socket error:', err.message);
    });

    // Don't disconnect on cleanup — keep alive
    return () => {};
  }, [userId]);
}