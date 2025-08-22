import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Auction } from "@/lib/api";
import { LiveCountdown } from "./LiveCountdown";

interface AuctionCardProps {
  auction: Auction;
  compact?: boolean;
  onClick?: () => void;
}

export const AuctionCard = ({ auction, compact = false, onClick }: AuctionCardProps) => {
  const isReverse = auction.type === 'reverse';
  const timeRemaining = new Date(auction.timing.endTime).getTime() - new Date().getTime();
  const isUrgent = timeRemaining < 10 * 60 * 1000; // Less than 10 minutes
  const isHot = auction.bidding.totalBids > 10 || auction.analytics.views > 100;
  
  return (
    <div 
      className={`border border-panel-border bg-secondary/20 p-2 transition-all hover:bg-secondary/30 hover:border-terminal-green/50 cursor-pointer ${isHot ? 'animate-glow' : ''}`}
      onClick={onClick}
    >
      <div className="text-xs">
        <div className="flex items-center gap-2">
          <div className="text-foreground font-medium truncate">{auction.title}</div>
          {isHot && <div className="w-2 h-2 bg-auction-active rounded-full animate-pulse-slow"></div>}
          {isReverse && <div className="text-xs bg-terminal-amber/20 text-terminal-amber px-1 rounded">REV</div>}
        </div>
        
        {!compact && (
          <div className="mt-1 flex justify-between items-center">
            <span className="text-muted-foreground capitalize">{auction.category}</span>
            <span className="text-xs text-muted-foreground">{auction.analytics.watchersCount} watching</span>
          </div>
        )}
        
        <div className="mt-1 flex justify-between items-center">
          <span className="text-terminal-green">
            {isReverse ? 'Lowest: ' : 'Current: '}{auction.pricing.currentBid.toLocaleString()} $WKC
          </span>
          <span className={`text-xs ${isUrgent ? 'text-warning-flash animate-pulse' : 'text-terminal-red'}`}>
            <LiveCountdown endTime={auction.timing.endTime} />
          </span>
        </div>
        
        {!compact && (
          <div className="mt-2 flex gap-2">
            <Button 
              size="sm" 
              variant="outline"
              className="flex-1 text-xs"
              onClick={(e) => {
                e.stopPropagation();
                // Handle watch functionality
              }}
            >
              Watch
            </Button>
            <Button 
              size="sm"
              className="flex-1 bg-primary hover:bg-primary/80 text-xs text-primary-foreground"
              onClick={(e) => {
                e.stopPropagation();
                onClick?.();
              }}
            >
              {isReverse ? 'Submit Quote →' : 'Place Bid →'}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};