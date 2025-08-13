import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LiveBiddingPanel } from "./auction/LiveBiddingPanel";
import { LiveActivityFeed } from "./auction/LiveActivityFeed";
import { TokenBalance } from "./auction/TokenBalance";
import { AuctionCard } from "./auction/AuctionCard";
import { EscrowPanel } from "./auction/EscrowPanel";
import { DisputePanel } from "./auction/DisputePanel";
import { NotificationPanel } from "./auction/NotificationPanel";
import { PaymentGateway } from "./auction/PaymentGateway";
import { SecurityPanel } from "./auction/SecurityPanel";
import { AdminDashboard } from "./auction/AdminDashboard";
import { UserWallet } from "./auction/UserWallet";
import { AuctionAnalytics } from "./auction/AuctionAnalytics";

const AuctionDashboard = () => {
  return (
    <div className="min-h-screen bg-background p-4 font-terminal text-foreground">
      {/* Header */}
      <div className="mb-6 border border-panel-border bg-card/50 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-xl font-bold text-foreground">█ ANONYMOUS AUCTION MARKETPLACE █</div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-live-pulse rounded-full animate-pulse-slow"></div>
              <span className="text-xs text-terminal-green animate-pulse-slow">LIVE</span>
            </div>
          </div>
          <div className="flex gap-4 text-sm">
            <span className="text-terminal-amber hover:text-terminal-amber/80 cursor-pointer transition-colors">Live Auctions</span>
            <span className="text-muted-foreground hover:text-foreground cursor-pointer transition-colors">Ending Soon</span>
            <span className="text-muted-foreground hover:text-foreground cursor-pointer transition-colors">My Bids</span>
            <span className="text-muted-foreground hover:text-foreground cursor-pointer transition-colors">Won Items</span>
            <span className="text-muted-foreground hover:text-foreground cursor-pointer transition-colors">Watchlist</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-4">
        {/* Left Panel - User Profile & Wallet */}
        <div className="col-span-3">
          <Card className="border-panel-border bg-card/50 p-4 mb-4">
            <div className="mb-4 border-b border-panel-border pb-2">
              <h3 className="text-terminal-green">Anonymous Profile</h3>
              <p className="text-xs text-muted-foreground">Secure bidder credentials and token wallet</p>
            </div>
            
            <div className="mb-4">
              <div className="mb-2 h-16 w-16 border border-panel-border bg-secondary/20 flex items-center justify-center">
                <span className="text-foreground text-xl">🎭</span>
              </div>
              <div className="space-y-1 text-sm">
                <div className="text-foreground">BIDDER #GH4A7X</div>
                <div>» STATUS     : VERIFIED</div>
                <div>» TOKENS     : 2,450 GHT</div>
                <div>» REPUTATION : ★★★★☆ (4.2)</div>
                <div>» MEMBER SINCE: 15/01/2024</div>
                <div>» AUCTIONS WON: 34</div>
                <div>» SUCCESS RATE: 68%</div>
              </div>
            </div>

            <div className="mb-4">
              <h4 className="mb-2 text-terminal-green">Bidding Stats</h4>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div>
                  <div className="text-xl font-bold">127</div>
                  <div className="text-xs text-muted-foreground">Total Bids</div>
                </div>
                <div>
                  <div className="text-xl font-bold text-terminal-green">34</div>
                  <div className="text-xs text-muted-foreground">Won</div>
                </div>
                <div>
                  <div className="text-xl font-bold text-terminal-amber">5</div>
                  <div className="text-xs text-muted-foreground">Active</div>
                </div>
              </div>
              
              <div className="mt-4">
                <UserWallet />
              </div>
            </div>

            <div>
              <h4 className="mb-2 text-terminal-green">Quick Token Top-Up</h4>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span>MTN MoMo</span>
                  <span className="text-terminal-green">●</span>
                </div>
                <div className="flex justify-between">
                  <span>Vodafone Cash</span>
                  <span className="text-terminal-green">●</span>
                </div>
                <div className="flex justify-between">
                  <span>AirtelTigo</span>
                  <span className="text-muted-foreground">○</span>
                </div>
                <div className="flex justify-between">
                  <span>Telecel Cash</span>
                  <span className="text-terminal-green">●</span>
                </div>
                <button className="w-full mt-2 bg-primary px-2 py-1 text-xs text-primary-foreground hover:bg-primary/80 transition-colors">
                  Add Tokens → GH₵ to GHT
                </button>
              </div>
            </div>
          </Card>
          
          {/* Notifications Panel */}
          <Card className="border-panel-border bg-card/50 p-4 mb-4">
            <NotificationPanel />
          </Card>
          
          {/* Security Panel */}
          <Card className="border-panel-border bg-card/50 p-4">
            <SecurityPanel />
          </Card>
        </div>

        {/* Center Panel - Main Auction Interface */}
        <div className="col-span-6">
          <Card className="border-panel-border bg-card/50 p-4">
            <Tabs defaultValue="live-auction" className="w-full">
              <TabsList className="grid w-full grid-cols-7">
                <TabsTrigger value="live-auction">Live Auction</TabsTrigger>
                <TabsTrigger value="marketplace">Marketplace</TabsTrigger>
                <TabsTrigger value="my-bids">My Bids</TabsTrigger>
                <TabsTrigger value="wallet">Wallet</TabsTrigger>
                <TabsTrigger value="analytics">Analytics</TabsTrigger>
                <TabsTrigger value="admin">Admin</TabsTrigger>
                <TabsTrigger value="help">Help</TabsTrigger>
              </TabsList>
              
              <TabsContent value="live-auction" className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-terminal-green">Featured Live Auction - iPhone 15 Pro Max 256GB</h3>
                    <Badge className="bg-terminal-red/20 text-terminal-red">ENDING SOON</Badge>
                  </div>
                  <LiveBiddingPanel auctionType="forward" />
                </div>
                
                {/* Real-time Leaderboard */}
                <div className="border-t border-panel-border pt-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-terminal-green">Live Leaderboard</h4>
                    <span className="text-xs text-muted-foreground">Updates every 2s</span>
                  </div>
                  <div className="space-y-2">
                    {[
                      { rank: 1, bidder: "GHOST_7X2", amount: "1,250", time: "2s ago", trend: "↑" },
                      { rank: 2, bidder: "SHADOW_99", amount: "1,200", time: "45s ago", trend: "↓" },
                      { rank: 3, bidder: "CIPHER_42", amount: "1,150", time: "1m ago", trend: "→" },
                      { rank: 4, bidder: "VOID_1A", amount: "1,100", time: "2m ago", trend: "↓" },
                      { rank: 5, bidder: "ANON_88", amount: "1,050", time: "3m ago", trend: "→" }
                    ].map((bid, i) => (
                      <div key={i} className="flex justify-between items-center text-xs border border-panel-border bg-secondary/20 p-2">
                        <div className="flex gap-3 items-center">
                          <span className={`text-terminal-amber ${bid.rank === 1 ? 'animate-pulse' : ''}`}>#{bid.rank}</span>
                          <span className="text-foreground">{bid.bidder}</span>
                          <span className={`text-xs ${bid.trend === '↑' ? 'text-terminal-green' : bid.trend === '↓' ? 'text-terminal-red' : 'text-muted-foreground'}`}>
                            {bid.trend}
                          </span>
                        </div>
                        <div className="flex gap-3">
                          <span className="text-terminal-green">{bid.amount} GHT</span>
                          <span className="text-muted-foreground">{bid.time}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Live Activity Feed */}
                <div className="border-t border-panel-border pt-4">
                  <LiveActivityFeed />
                </div>
              </TabsContent>
              
              <TabsContent value="marketplace" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <h4 className="text-terminal-green">Electronics & Tech</h4>
                    {[
                      { item: "MacBook Pro M3", currentBid: "2,850", timeLeft: "5m 12s", watchers: 23 },
                      { item: "Samsung Galaxy S24", currentBid: "980", timeLeft: "12m 45s", watchers: 15 },
                      { item: "iPad Pro 12.9\"", currentBid: "1,450", timeLeft: "8m 33s", watchers: 31 }
                    ].map((auction, i) => (
                      <div key={i} className="border border-panel-border bg-secondary/20 p-3 rounded">
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-sm font-medium">{auction.item}</span>
                          <span className="text-xs text-muted-foreground">{auction.watchers} watching</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-terminal-green">Current: {auction.currentBid} GHT</span>
                          <span className="text-terminal-red">{auction.timeLeft}</span>
                        </div>
                        <button className="w-full mt-2 bg-primary px-2 py-1 text-xs text-primary-foreground hover:bg-primary/80 transition-colors">
                          Place Bid
                        </button>
                      </div>
                    ))}
                  </div>
                  
                  <div className="space-y-3">
                    <h4 className="text-terminal-green">Fashion & Lifestyle</h4>
                    {[
                      { item: "Nike Air Jordan 1", currentBid: "450", timeLeft: "23m 17s", watchers: 8 },
                      { item: "Rolex Submariner", currentBid: "8,500", timeLeft: "1h 15m", watchers: 45 },
                      { item: "Louis Vuitton Bag", currentBid: "1,200", timeLeft: "2h 33m", watchers: 12 }
                    ].map((auction, i) => (
                      <div key={i} className="border border-panel-border bg-secondary/20 p-3 rounded">
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-sm font-medium">{auction.item}</span>
                          <span className="text-xs text-muted-foreground">{auction.watchers} watching</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-terminal-green">Current: {auction.currentBid} GHT</span>
                          <span className="text-terminal-red">{auction.timeLeft}</span>
                        </div>
                        <button className="w-full mt-2 bg-primary px-2 py-1 text-xs text-primary-foreground hover:bg-primary/80 transition-colors">
                          Place Bid
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="my-bids">
                <div className="space-y-4">
                  <h3 className="text-terminal-green">My Active Bids</h3>
                  <div className="space-y-3">
                    {[
                      { item: "iPhone 15 Pro Max", myBid: "1,200", currentBid: "1,250", status: "outbid", timeLeft: "4m 37s" },
                      { item: "MacBook Pro M3", myBid: "2,850", currentBid: "2,850", status: "winning", timeLeft: "5m 12s" },
                      { item: "Nike Air Jordan 1", myBid: "450", currentBid: "450", status: "winning", timeLeft: "23m 17s" }
                    ].map((bid, i) => (
                      <div key={i} className={`border p-3 rounded ${bid.status === 'winning' ? 'border-terminal-green bg-terminal-green/10' : 'border-terminal-red bg-terminal-red/10'}`}>
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-sm font-medium">{bid.item}</span>
                          <Badge className={bid.status === 'winning' ? 'bg-terminal-green/20 text-terminal-green' : 'bg-terminal-red/20 text-terminal-red'}>
                            {bid.status.toUpperCase()}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-xs">
                          <div>
                            <span className="text-muted-foreground">My Bid:</span>
                            <div className="text-foreground">{bid.myBid} GHT</div>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Current:</span>
                            <div className="text-foreground">{bid.currentBid} GHT</div>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Time Left:</span>
                            <div className="text-terminal-red">{bid.timeLeft}</div>
                          </div>
                        </div>
                        <div className="flex gap-2 mt-2">
                          <button className="flex-1 bg-primary px-2 py-1 text-xs text-primary-foreground hover:bg-primary/80 transition-colors">
                            Increase Bid
                          </button>
                          <button className="flex-1 bg-secondary px-2 py-1 text-xs hover:bg-accent transition-colors">
                            Watch Only
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="wallet">
                <PaymentGateway />
              </TabsContent>
              
              <TabsContent value="analytics">
                <AuctionAnalytics />
              </TabsContent>
              
              <TabsContent value="admin">
                <AdminDashboard />
              </TabsContent>
              
              <TabsContent value="help">
                <div className="space-y-4">
                  <h3 className="text-terminal-green">How It Works</h3>
                  <div className="space-y-3 text-sm">
                    <div className="border border-panel-border bg-secondary/20 p-3 rounded">
                      <h4 className="text-terminal-amber mb-2">1. Purchase Tokens</h4>
                      <p className="text-muted-foreground">Buy Ghana Tokens (GHT) using mobile money. 1 GHT = 1 GH₵</p>
                    </div>
                    <div className="border border-panel-border bg-secondary/20 p-3 rounded">
                      <h4 className="text-terminal-amber mb-2">2. Browse Auctions</h4>
                      <p className="text-muted-foreground">Find items you want to bid on. All auctions are live and transparent.</p>
                    </div>
                    <div className="border border-panel-border bg-secondary/20 p-3 rounded">
                      <h4 className="text-terminal-amber mb-2">3. Place Anonymous Bids</h4>
                      <p className="text-muted-foreground">Your identity is protected with anonymous bidder IDs.</p>
                    </div>
                    <div className="border border-panel-border bg-secondary/20 p-3 rounded">
                      <h4 className="text-terminal-amber mb-2">4. Win & Pay</h4>
                      <p className="text-muted-foreground">If you win, tokens are automatically deducted and item ships to you.</p>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </Card>
        </div>

        {/* Right Panel - Active Auctions & Market Info */}
        <div className="col-span-3">
          <Card className="border-panel-border bg-card/50 p-4 mb-4">
            <div className="mb-4 flex items-center justify-between border-b border-panel-border pb-2">
              <h3 className="text-terminal-green">Market Overview</h3>
              <Badge variant="outline" className="text-terminal-green border-terminal-green">
                LIVE
              </Badge>
            </div>
            
            <div className="space-y-3 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Active Auctions:</span>
                <span className="text-terminal-green">47</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Bidders:</span>
                <span className="text-terminal-green">1,234</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tokens in Play:</span>
                <span className="text-terminal-amber">45,678 GHT</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Avg. Bid Value:</span>
                <span className="text-foreground">892 GHT</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Success Rate:</span>
                <span className="text-terminal-green">73%</span>
              </div>
            </div>
          </Card>

          <Card className="border-panel-border bg-card/50 p-4">
            <div className="mb-4 flex items-center justify-between border-b border-panel-border pb-2">
              <h3 className="text-terminal-green">Ending Soon</h3>
              <Badge variant="destructive" className="bg-terminal-red/20 text-terminal-red">URGENT</Badge>
            </div>
            <p className="mb-4 text-xs text-muted-foreground">
              Don't miss these auctions ending in the next hour
            </p>

            <div className="space-y-3">
              {[
                { item: "iPhone 15 Pro Max", currentBid: "1,250", timeLeft: "4m 37s", category: "Electronics", isHot: true, watchers: 45 },
                { item: "MacBook Pro M3", currentBid: "2,850", timeLeft: "5m 12s", category: "Electronics", isHot: true, watchers: 23 },
                { item: "Nike Air Jordan 1", currentBid: "450", timeLeft: "8m 33s", category: "Fashion", watchers: 8 },
                { item: "Samsung Galaxy S24", currentBid: "980", timeLeft: "12m 45s", category: "Electronics", watchers: 15 },
                { item: "Canon EOS R5", currentBid: "3,400", timeLeft: "31m 02s", category: "Photography", watchers: 12 },
                { item: "Rolex Submariner", currentBid: "8,500", timeLeft: "45m 18s", category: "Luxury", watchers: 67 },
                { item: "iPad Pro 12.9\"", currentBid: "1,450", timeLeft: "58m 44s", category: "Electronics", watchers: 31 }
              ].map((auction, i) => (
                <AuctionCard
                  key={i}
                  item={auction.item}
                  currentBid={auction.currentBid}
                  timeLeft={auction.timeLeft}
                  category={auction.category}
                  isHot={auction.isHot}
                  auctionType="forward"
                  watchers={auction.watchers}
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