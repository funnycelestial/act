import React, { createContext, useContext, useEffect, useState } from 'react';
import { wsService, WebSocketEvents } from '@/lib/websocket';
import { useAuth } from './AuthContext';
import { toast } from '@/components/ui/use-toast';

interface WebSocketContextType {
  isConnected: boolean;
  joinAuction: (auctionId: string) => void;
  leaveAuction: (auctionId: string) => void;
  placeBid: (auctionId: string, amount: number) => void;
  watchAuction: (auctionId: string) => void;
  unwatchAuction: (auctionId: string) => void;
  on: <K extends keyof WebSocketEvents>(event: K, listener: WebSocketEvents[K]) => void;
  off: <K extends keyof WebSocketEvents>(event: K, listener: WebSocketEvents[K]) => void;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

export const useWebSocket = () => {
  }
  const context = useContext(WebSocketContext);
  if (context === undefined) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
};

export const WebSocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (isAuthenticated && user) {
      const token = localStorage.getItem('auth_token');
      if (token) {
        wsService.connect(token);
      }
    } else {
      wsService.disconnect();
    }

    // Set up connection status listeners
    const handleConnected = () => {
      setIsConnected(true);
      toast({
        title: "Connected",
        description: "Real-time updates enabled",
      });
    };

    const handleDisconnected = () => {
      setIsConnected(false);
    };

    const handleError = (error: { message: string }) => {
      setIsConnected(false);
      toast({
        title: "Connection Error",
        description: error.message,
        variant: "destructive",
      });
    };

    const handleNewNotification = (notification: any) => {
      toast({
        title: notification.title,
        description: notification.message,
      });
    };

    wsService.on('connected', handleConnected);
    wsService.on('disconnect', handleDisconnected);
    wsService.on('error', handleError);
    wsService.on('new_notification', handleNewNotification);

    return () => {
      wsService.off('connected', handleConnected);
      wsService.off('disconnect', handleDisconnected);
      wsService.off('error', handleError);
      wsService.off('new_notification', handleNewNotification);
    };
  }, [isAuthenticated, user]);

  const value: WebSocketContextType = {
    isConnected,
    joinAuction: (auctionId: string) => wsService.joinAuction(auctionId),
    leaveAuction: (auctionId: string) => wsService.leaveAuction(auctionId),
    placeBid: (auctionId: string, amount: number) => wsService.placeBid(auctionId, amount),
    watchAuction: (auctionId: string) => wsService.watchAuction(auctionId),
    unwatchAuction: (auctionId: string) => wsService.unwatchAuction(auctionId),
    on: (event, listener) => wsService.on(event, listener),
    off: (event, listener) => wsService.off(event, listener),
  };

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
};