import { useEffect, useRef } from 'react';
import { wsService, WebSocketEvents } from '@/lib/websocket';

export const useWebSocket = () => {
  const listenersRef = useRef<Map<string, Function>>(new Map());

  const on = <K extends keyof WebSocketEvents>(
    event: K,
    listener: WebSocketEvents[K]
  ) => {
    wsService.on(event, listener);
    listenersRef.current.set(event as string, listener);
  };

  const off = <K extends keyof WebSocketEvents>(
    event: K,
    listener: WebSocketEvents[K]
  ) => {
    wsService.off(event, listener);
    listenersRef.current.delete(event as string);
  };

  useEffect(() => {
    return () => {
      // Cleanup all listeners when component unmounts
      listenersRef.current.forEach((listener, event) => {
        wsService.off(event as keyof WebSocketEvents, listener as any);
      });
      listenersRef.current.clear();
    };
  }, []);

  return { on, off };
};
