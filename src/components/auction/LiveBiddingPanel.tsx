import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useWebSocket } from "@/contexts/WebSocketContext";
import { useAuth } from "@/contexts/AuthContext";
import { apiClient, Auction, Bid } from "@/lib/api";
import { toast } from "@/components/ui/use-toast";
import { LiveCountdown } from "./LiveCountdown";

interface LiveBiddingPanelProps {
  auction: Auction;
}

export const LiveBiddingPanel = ({ auction }: LiveBiddingPanelProps) => {
  const [bidAmount, setBidAmount] = useState("");
  const [isPlacingBid, setIsPlacingBid] = useState(false);
  const [recentBids, setRecentBids] = useState<Bid[]>([]);
  const { user } = useAuth();
  const { joinAuction, leaveAuction, on, off } = useWebSocket();
  
  const isReverse = auction.type === 'reverse';
  const isOwner = user?.id === auction.seller.userId;

  useState(() => {
    // Join auction room for real-time updates
    joinAuction(auction._id);
    loadRecentBids();
    
    // Set up WebSocket listeners
    const handleBidUpdate = (data: any) => {
      if (data.auctionId === auction.auctionId) {
        loadRecentBids();
        if (data.isNewHighest) {
          toast({
            title: "New Highest Bid",
            description: `${data.bidder} bid ${data.amount} $WKC`,
          });
        }
      }
    };

    on('bid_placed', handleBidUpdate);

    return () => {
      off('bid_placed', handleBidUpdate);
      leaveAuction(auction._id);
    };
  }, [auction._id]);

  const loadRecentBids = async () => {
    try {
      const response = await apiClient.getAuctionBids(auction._id, 1, 5);
      setRecentBids(response.data.bids);
    } catch (error) {
      console.error('Failed to load recent bids:', error);
    }
  };

  const handleBid = async () => {
    if (!bidAmount || isPlacingBid || isOwner) return;

    const amount = parseFloat(bidAmount.replace(/,/g, ''));
    const minBid = auction.pricing.currentBid + 1; // Minimum increment

    if (isReverse ? amount >= auction.pricing.currentBid : amount <= auction.pricing.currentBid) {
      toast({
        title: "Invalid Bid",
        description: isReverse 
          ? "Your quote must be lower than the current lowest quote"
          : "Your bid must be higher than the current bid",
        variant: "destructive",
      });
      return;
    }

    setIsPlacingBid(true);
    try {
      await apiClient.placeBid(auction._id, amount);
      setBidAmount("");
      toast({
        title: "Bid Placed",
        description: `Successfully placed ${isReverse ? 'quote' : 'bid'} of ${amount} $WKC`,
      });
    } catch (error) {
      console.error('Failed to place bid:', error);
      toast({
        title: "Bid Failed",
        description: error instanceof Error ? error.message : "Failed to place bid",
        variant: "destructive",
      });
    } finally {
      setIsPlacingBid(false);
    }
  };

  const currentBidData = isReverse 
    ? { 
        amount: auction.pricing.currentBid.toLocaleString(), 
        label: "Lowest Quote", 
        starter: `Starting budget: ${auction.pricing.startingBid.toLocaleString()} $WKC` 
      }
    : { 
        amount: auction.pricing.currentBid.toLocaleString(), 
        label: "Current Bid", 
        starter: `Starting bid: ${auction.pricing.startingBid.toLocaleString()} $WKC` 
      };

  return (
    <div className="relative h-64 border border-panel-border bg-background/50 p-4 animate-glow">
      <div className="flex h-full">
        {/* Product Image */}
        <div className="w-1/3 border border-panel-border bg-secondary/20 flex items-center justify-center relative">
          {auction.images && auction.images.length > 0 ? (
            <img 
              src={auction.images[0].url} 
              alt={auction.images[0].alt}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="text-4xl">{isReverse ? '💻' : '📱'}</div>
          )}
          <div className="absolute top-2 right-2 w-3 h-3 bg-live-pulse rounded-full animate-pulse-slow"></div>
          {isReverse && (
            <div className="absolute top-2 left-2 text-xs bg-terminal-amber/20 text-terminal-amber px-1 rounded">
              REVERSE
            </div>
          )}
        </div>
        
        {/* Auction Info */}
        <div className="w-2/3 pl-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-foreground font-bold">{currentBidData.label}: {currentBidData.amount} $WKC</span>
              {auction.bidding.highestBidder?.anonymousId === user?.anonymousId && (
                <Badge className="bg-terminal-green text-background animate-pulse">
                  {isReverse ? "LOWEST QUOTE!" : "YOU'RE WINNING!"}
                </Badge>
              )}
            </div>
            <div className="text-xs text-muted-foreground mt-1">{currentBidData.starter}</div>
            <LiveCountdown endTime={auction.timing.endTime} className="text-xs mt-1" />
          </div>
          
          {/* Live Bidding */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-live-pulse rounded-full animate-pulse-slow"></div>
              <span className="text-xs text-terminal-green">
                {isReverse ? "LIVE QUOTES:" : "LIVE BIDDING:"}
              </span>
            </div>
            
            <div className="space-y-1 text-xs max-h-20 overflow-y-auto">
              {recentBids.map((bid, index) => (
                <div 
                  key={bid._id}
                  className={`flex justify-between p-1 rounded ${index === 0 ? 'bg-terminal-green/10 animate-glow' : ''}`}
                >
                  <span>{bid.bidder.anonymousId}</span>
                  <span className={index === 0 ? 'text-terminal-green' : ''}>{bid.amount.toLocaleString()} $WKC</span>
                </div>
              ))}
            </div>
            
            {!isOwner && (
              <div className="flex gap-2 mt-2">
                <Input 
                  type="number"
                  min={isReverse ? 0 : auction.pricing.currentBid + 1}
                  max={isReverse ? auction.pricing.currentBid - 1 : undefined}
                  className="flex-1 bg-secondary/20 border border-panel-border px-2 py-1 text-xs focus:border-terminal-green focus:outline-none transition-colors" 
                  placeholder={isReverse ? "Enter quote amount..." : "Enter bid amount..."}
                  value={bidAmount}
                  onChange={(e) => setBidAmount(e.target.value)}
                  disabled={isPlacingBid}
                />
                <Button 
                  onClick={handleBid}
                  disabled={!bidAmount || isPlacingBid}
                  className="bg-terminal-green px-3 py-1 text-xs text-background hover:bg-terminal-green/80 transition-colors"
                >
                  {isPlacingBid ? "..." : (isReverse ? "QUOTE" : "BID")}
                </Button>
              </div>
            )}
            
            {isOwner && (
              <div className="text-xs text-terminal-amber p-2 bg-terminal-amber/10 rounded">
                You cannot bid on your own auction
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
                className="flex-1 bg-secondary/20 border border-panel-border px-2 py-1 text-xs focus:border-terminal-green focus:outline-none transition-colors" 
                placeholder={isReverse ? "Enter quote amount..." : "Enter bid amount..."}
                value={bidAmount}
                onChange={(e) => setBidAmount(e.target.value)}
              />
              <button 
                onClick={handleBid}
                className="bg-terminal-green px-3 py-1 text-xs text-background hover:bg-terminal-green/80 transition-colors"
              >
                {isReverse ? "QUOTE" : "BID"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};