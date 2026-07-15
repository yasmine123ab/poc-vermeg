import { useEffect, useRef } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

export interface ExecutionUpdate {
  executionId: number;
  fluxId: number;
  fluxName: string;
  status: string;
  startedAt?: string;
  finishedAt?: string;
  durationMs?: number;
  outputFilePath?: string;
  errorMessage?: string;
  logMessage?: string;
  logLevel?: string;
  logStep?: string;
}

export const useWebSocket = (onUpdate: (update: ExecutionUpdate) => void) => {
  const clientRef = useRef<Client | null>(null);
  const onUpdateRef = useRef(onUpdate);

  useEffect(() => { onUpdateRef.current = onUpdate; }, [onUpdate]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    const client = new Client({
      webSocketFactory: () => new SockJS('http://localhost:8080/ws'),
      connectHeaders: { Authorization: `Bearer ${token}` },
      reconnectDelay: 5000,
      onConnect: () => {
        client.subscribe('/topic/executions', (message) => {
          try {
            const update: ExecutionUpdate = JSON.parse(message.body);
            onUpdateRef.current(update);
          } catch (e) {
            console.error('WebSocket parse error:', e);
          }
        });
      },
      onStompError: (frame) => {
        console.error('STOMP error:', frame);
      },
    });

    client.activate();
    clientRef.current = client;

    return () => { client.deactivate(); };
  }, []);
};
