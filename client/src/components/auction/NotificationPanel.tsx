import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useWebSocket } from "@/contexts/WebSocketContext";
import { apiClient, Notification } from "@/lib/api";
import { useState, useEffect } from "react";

export const NotificationPanel = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const { on, off } = useWebSocket();

  useEffect(() => {
    if (user) {
      loadNotifications();
    }

    // Set up real-time notification listener
    const handleNewNotification = (notification: any) => {
      setNotifications(prev => [notification, ...prev.slice(0, 9)]);
      setUnreadCount(prev => prev + 1);
    };

    const handleNotificationRead = (data: { notificationId: string }) => {
      setNotifications(prev => 
        prev.map(n => 
          n.notificationId === data.notificationId 
            ? { ...n, channels: { ...n.channels, inApp: { ...n.channels.inApp, read: true } } }
            : n
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    };

    on('new_notification', handleNewNotification);
    on('notification_read', handleNotificationRead);

    return () => {
      off('new_notification', handleNewNotification);
      off('notification_read', handleNotificationRead);
    };
  }, [user]);

  const loadNotifications = async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.getNotifications(1, 10);
      setNotifications(response.data.notifications);
      setUnreadCount(response.data.unreadCount);
    } catch (error) {
      console.error('Failed to load notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'bid_placed':
      case 'bid_outbid': return '💰';
      case 'auction_end': return '⏰';
      case 'auction_won':
      case 'auction_lost': return '🏆';
      case 'escrow_funded':
      case 'escrow_released': return '🔒';
      case 'dispute_filed':
      case 'dispute_resolved': return '⚠️';
      case 'payment_received':
      case 'payment_failed': return '💳';
      case 'delivery_confirmed': return '📦';
      case 'security_alert': return '🛡️';
      default: return '📢';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-terminal-red';
      case 'medium': return 'text-terminal-amber';
      case 'low': return 'text-muted-foreground';
      default: return 'text-muted-foreground';
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      await apiClient.markNotificationRead(notificationId);
      // The WebSocket listener will handle the UI update
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await apiClient.markAllNotificationsRead();
      setNotifications(prev => 
        prev.map(n => ({ 
          ...n, 
          channels: { ...n.channels, inApp: { ...n.channels.inApp, read: true } }
        }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const now = new Date();
    const notificationTime = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - notificationTime.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-terminal-green">Notifications</h4>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <Badge variant="destructive" className="bg-terminal-red/20 text-terminal-red">
              {unreadCount}
            </Badge>
          )}
          {unreadCount > 0 && (
            <Button 
              size="sm" 
              variant="ghost" 
              onClick={markAllAsRead}
              className="text-xs h-6 px-2"
            >
              Mark All Read
            </Button>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-4">
          <div className="text-xs text-muted-foreground">Loading notifications...</div>
        </div>
      ) : (
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {notifications.slice(0, 8).map((notification) => (
          <div 
            key={notification._id}
            className={`p-2 rounded border transition-all cursor-pointer ${
              notification.channels.inApp.read 
                ? 'border-panel-border/50 bg-secondary/10' 
                : 'border-panel-border bg-secondary/20 hover:bg-secondary/30'
            }`}
            onClick={() => markAsRead(notification.notificationId)}
          >
            <div className="flex items-start gap-2">
              <span className="text-sm">{getNotificationIcon(notification.type)}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-medium ${notification.channels.inApp.read ? 'text-muted-foreground' : 'text-foreground'}`}>
                    {notification.title}
                  </span>
                  <span className={`text-xs ${getPriorityColor(notification.priority)}`}>
                    {notification.priority === 'high' && '🔴'}
                  </span>
                </div>
                <p className={`text-xs mt-1 ${notification.channels.inApp.read ? 'text-muted-foreground' : 'text-foreground'}`}>
                  {notification.message}
                </p>
                <span className="text-xs text-muted-foreground">
                  {formatTimestamp(notification.createdAt)}
                </span>
              </div>
              {!notification.channels.inApp.read && (
                <div className="w-2 h-2 bg-terminal-green rounded-full animate-pulse-slow"></div>
              )}
            </div>
          </div>
        ))}
        {notifications.length === 0 && (
          <div className="text-center py-4">
            <div className="text-xs text-muted-foreground">No notifications</div>
          </div>
        )}
      </div>
      )}

      <Button 
        variant="outline" 
        size="sm" 
        className="w-full text-xs"
        onClick={() => window.location.href = '/notifications'}
      >
        View All Notifications
      </Button>
    </div>
  );
};