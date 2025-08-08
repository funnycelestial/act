import { useState } from "react";
import { LiveCountdown } from "./LiveCountdown";

export const LiveBiddingPanel = () => {
  const [bidAmount, setBidAmount] = useState("");
  const [isHighestBidder, setIsHighestBidder] = useState(false);

  const handleBid = () => {
    if (bidAmount && parseFloat(bidAmount.replace(',', '')) > 1250) {
      setIsHighestBidder(true);
      setTimeout(() => setIsHighestBidder(false), 3000);
    }
  };

  return (
    <div className="relative h-64 border border-panel-border bg-background/50 p-4 animate-glow">
      <div className="flex h-full">
        {/* Product Image */}
        <div className="w-1/3 border border-panel-border bg-secondary/20 flex items-center justify-center relative">
          <div className="text-4xl">📱</div>
          <div className="absolute top-2 right-2 w-3 h-3 bg-live-pulse rounded-full animate-pulse-slow"></div>
        </div>
        
        {/* Auction Info */}
        <div className="w-2/3 pl-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-foreground font-bold">Current Bid: 1,250 Tokens</span>
              {isHighestBidder && (
                <span className="text-xs bg-terminal-green text-background px-2 py-1 rounded animate-pulse">
                  YOU'RE WINNING!
                </span>
              )}
            </div>
            <div className="text-xs text-muted-foreground mt-1">Starting bid: 500 tokens</div>
            <LiveCountdown targetTime="00:04:37" className="text-xs mt-1" />
          </div>
          
          {/* Live Bidding */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-live-pulse rounded-full animate-pulse-slow"></div>
              <span className="text-xs text-terminal-green">LIVE BIDDING:</span>
            </div>
            
            <div className="space-y-1 text-xs max-h-20 overflow-y-auto">
              <div className="flex justify-between p-1 rounded bg-terminal-green/10 animate-glow">
                <span>ANON_7X2</span>
                <span className="text-terminal-green">1,250 tokens</span>
              </div>
              <div className="flex justify-between p-1">
                <span>GHOST_99</span>
                <span>1,200 tokens</span>
              </div>
              <div className="flex justify-between p-1">
                <span>SHADOW_42</span>
                <span>1,150 tokens</span>
              </div>
            </div>
            
            <div className="flex gap-2 mt-2">
              <input 
                className="flex-1 bg-secondary/20 border border-panel-border px-2 py-1 text-xs focus:border-terminal-green focus:outline-none transition-colors" 
                placeholder="Enter bid amount..."
                value={bidAmount}
                onChange={(e) => setBidAmount(e.target.value)}
              />
              <button 
                onClick={handleBid}
                className="bg-terminal-green px-3 py-1 text-xs text-background hover:bg-terminal-green/80 transition-colors"
              >
                BID
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};