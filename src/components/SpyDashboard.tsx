import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LiveBiddingPanel } from "./auction/LiveBiddingPanel";
import { LiveActivityFeed } from "./auction/LiveActivityFeed";
import { TokenBalance } from "./auction/TokenBalance";
import { AuctionCard } from "./auction/AuctionCard";

const AuctionDashboard = () => {
  return (
    <div className="min-h-screen bg-background p-4 font-terminal text-foreground">
      {/* Header */}
      <div className="mb-6 border border-panel-border bg-card/50 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-xl font-bold text-foreground">█ ANONYMOUS AUCTION TERMINAL █</div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-live-pulse rounded-full animate-pulse-slow"></div>
              <span className="text-xs text-terminal-green animate-pulse-slow">LIVE</span>
            </div>
          </div>
          <div className="flex gap-4 text-sm">
            <span className="text-terminal-amber hover:text-terminal-amber/80 cursor-pointer transition-colors">Live Auctions</span>
            <span className="text-muted-foreground hover:text-foreground cursor-pointer transition-colors">Ending Soon</span>
            <span className="text-muted-foreground hover:text-foreground cursor-pointer transition-colors">My Bids</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-4">
        {/* Left Panel - User Profile & Tokens */}
        <div className="col-span-3">
          <Card className="border-panel-border bg-card/50 p-4">
            <div className="mb-4 border-b border-panel-border pb-2">
              <h3 className="text-terminal-green">User Profile</h3>
              <p className="text-xs text-muted-foreground">Anonymous bidder credentials and wallet</p>
            </div>
            
            <div className="mb-4">
              <div className="mb-2 h-16 w-16 border border-panel-border bg-secondary/20 flex items-center justify-center">
                <span className="text-foreground text-xl">👤</span>
              </div>
              <div className="space-y-1 text-sm">
                <div className="text-foreground">BIDDER #4A7X</div>
                <div>» TOKENS     : 2,450</div>
                <div>» REPUTATION : ★★★★☆</div>
                <div>» ACTIVE SINCE: 15/01/2024</div>
              </div>
            </div>

            <div className="mb-4">
              <h4 className="mb-2 text-terminal-green">Bidding Stats</h4>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div>
                  <div className="text-2xl font-bold">127</div>
                  <div className="text-xs text-muted-foreground">Total Bids</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-terminal-green">34</div>
                  <div className="text-xs text-muted-foreground">Won</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-terminal-red">93</div>
                  <div className="text-xs text-muted-foreground">Lost</div>
                </div>
              </div>
              
              <div className="mt-4">
                <TokenBalance />
              </div>
            </div>

            <div>
              <h4 className="mb-2 text-terminal-green">Quick Top-Up</h4>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span>MTN MoMo</span>
                  <span className="text-terminal-green">Active</span>
                </div>
                <div className="flex justify-between">
                  <span>Vodafone</span>
                  <span className="text-terminal-green">Active</span>
                </div>
                <div className="flex justify-between">
                  <span>AirtelTigo</span>
                  <span className="text-muted-foreground">Offline</span>
                </div>
                <button className="w-full mt-2 bg-primary px-2 py-1 text-xs text-primary-foreground">
                  Add Tokens →
                </button>
              </div>
            </div>
          </Card>
        </div>

        {/* Center Panel - Live Auction */}
        <div className="col-span-6">
          <Card className="border-panel-border bg-card/50 p-4">
            <div className="mb-4">
              <h3 className="mb-2 text-terminal-green">Featured Auction - iPhone 15 Pro Max</h3>
              <LiveBiddingPanel />
            </div>
            
            {/* Live Activity Feed */}
            <div className="mt-6 border-t border-panel-border pt-4">
              <LiveActivityFeed />
            </div>

            {/* Leaderboard */}
            <div className="mt-6 border-t border-panel-border pt-4">
              <h4 className="mb-2 text-terminal-green">Current Leaderboard</h4>
              <div className="space-y-2">
                {[
                  { rank: 1, bidder: "ANON_7X2", amount: "1,250", time: "2s ago" },
                  { rank: 2, bidder: "GHOST_99", amount: "1,200", time: "45s ago" },
                  { rank: 3, bidder: "SHADOW_42", amount: "1,150", time: "1m ago" },
                  { rank: 4, bidder: "CIPHER_1A", amount: "1,100", time: "2m ago" },
                  { rank: 5, bidder: "VOID_88", amount: "1,050", time: "3m ago" }
                ].map((bid, i) => (
                  <div key={i} className="flex justify-between items-center text-xs border border-panel-border bg-secondary/20 p-2">
                    <div className="flex gap-3">
                      <span className="text-terminal-amber">#{bid.rank}</span>
                      <span className="text-foreground">{bid.bidder}</span>
                    </div>
                    <div className="flex gap-3">
                      <span className="text-terminal-green">{bid.amount} tokens</span>
                      <span className="text-muted-foreground">{bid.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>

        {/* Right Panel - Active Auctions */}
        <div className="col-span-3">
          <Card className="border-panel-border bg-card/50 p-4">
            <div className="mb-4 flex items-center justify-between border-b border-panel-border pb-2">
              <h3 className="text-terminal-green">Active Auctions</h3>
              <Badge variant="destructive" className="bg-terminal-red/20 text-terminal-red">47</Badge>
            </div>
            <p className="mb-4 text-xs text-muted-foreground">
              Live auctions ending soon
            </p>

            <div className="space-y-3">
              {[
                { item: "MacBook Pro M3", currentBid: "2,850", timeLeft: "5m 12s", category: "Electronics", isHot: true },
                { item: "Rolex Submariner", currentBid: "8,900", timeLeft: "12m 45s", category: "Luxury" },
                { item: "Nike Air Jordan 1", currentBid: "450", timeLeft: "8m 33s", category: "Fashion", isHot: true },
                { item: "PS5 Console", currentBid: "1,200", timeLeft: "23m 17s", category: "Gaming" },
                { item: "Canon EOS R5", currentBid: "3,400", timeLeft: "31m 02s", category: "Photography" },
                { item: "Tesla Model Y", currentBid: "45,000", timeLeft: "1h 15m", category: "Automotive" },
                { item: "iPhone 14 Pro", currentBid: "980", timeLeft: "2h 33m", category: "Electronics" }
              ].map((auction, i) => (
                <AuctionCard
                  key={i}
                  item={auction.item}
                  currentBid={auction.currentBid}
                  timeLeft={auction.timeLeft}
                  category={auction.category}
                  isHot={auction.isHot}
                />
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AuctionDashboard;