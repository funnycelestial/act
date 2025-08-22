import { useState, useEffect } from "react";
import { useWebSocket } from "@/contexts/WebSocketContext";

interface Activity {
  id: string;
  type: 'bid' | 'join' | 'watch';
  bidder: string;
  amount?: string;
  time: string;
  auctionId?: string;
}

export const LiveActivityFeed = () => {
  const { on, off } = useWebSocket();
  const [activities, setActivities] = useState<Activity[]>([
    { id: '1', type: 'bid', bidder: 'ANON_7X2', amount: '1,250', time: 'just now', auctionId: 'AUC_001' },
    { id: '2', type: 'join', bidder: 'VOID_88', time: '5s ago', auctionId: 'AUC_002' },
    { id: '3', type: 'bid', bidder: 'GHOST_99', amount: '1,200', time: '45s ago', auctionId: 'AUC_001' },
  ]);

  useEffect(() => {
    // Listen for real-time bid updates
    const handleBidPlaced = (data: any) => {
      const newActivity: Activity = {
        id: Date.now().toString(),
        type: 'bid',
        bidder: data.bidder,
        amount: data.amount.toLocaleString(),
        time: 'just now',
        auctionId: data.auctionId
      };
      
      setActivities(prev => [newActivity, ...prev.slice(0, 9)]);
    };

    const handleUserJoined = (data: any) => {
      const newActivity: Activity = {
        id: Date.now().toString(),
        type: 'join',
        bidder: data.anonymousId,
        time: 'just now'
      };
      
      setActivities(prev => [newActivity, ...prev.slice(0, 9)]);
    };

    const handleAuctionWatched = (data: any) => {
      const newActivity: Activity = {
        id: Date.now().toString(),
        type: 'watch',
        bidder: 'Anonymous User',
        time: 'just now',
        auctionId: data.auctionId
      };
      
      setActivities(prev => [newActivity, ...prev.slice(0, 9)]);
    };

    on('bid_placed', handleBidPlaced);
    on('user_joined_auction', handleUserJoined);
    on('auction_watched', handleAuctionWatched);

    return () => {
      off('bid_placed', handleBidPlaced);
      off('user_joined_auction', handleUserJoined);
      off('auction_watched', handleAuctionWatched);
    };
  }, [on, off]);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'bid': return '💰';
      case 'join': return '🎯';
      case 'watch': return '👁️';
      default: return '•';
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'bid': return 'text-terminal-green';
      case 'join': return 'text-terminal-amber';
      default: return 'text-muted-foreground';
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 bg-live-pulse rounded-full animate-pulse-slow"></div>
        <span className="text-xs text-terminal-green">LIVE ACTIVITY</span>
      </div>
      
      <div className="space-y-1 max-h-32 overflow-y-auto">
        {activities.map((activity, index) => (
          <div 
            key={activity.id} 
            className={`animate-slide-up text-xs flex items-center gap-2 p-2 rounded border border-panel-border/50 bg-secondary/20 ${index === 0 ? 'animate-glow' : ''}`}
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <span className="text-lg">{getActivityIcon(activity.type)}</span>
            <div className="flex-1">
              <span className={getActivityColor(activity.type)}>{activity.bidder}</span>
              {activity.amount && (
                <span className="text-terminal-green ml-2">{activity.amount} $WKC</span>
              )}
            </div>
            <span className="text-muted-foreground">{activity.time}</span>
          </div>
        ))}
        {activities.length === 0 && (
          <div className="text-center py-4 text-xs text-muted-foreground">
            No recent activity
          </div>
        )}
      </div>
    </div>
  );
};