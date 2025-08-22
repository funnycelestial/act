import React, { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useAuth } from '@/contexts/AuthContext';
import { useWebSocket } from '@/contexts/WebSocketContext';
import { apiClient, Auction } from '@/lib/api';
import { LiveBiddingPanel } from "../auction/LiveBiddingPanel";
import { LiveActivityFeed } from "../auction/LiveActivityFeed";
import { AuctionCard } from "../auction/AuctionCard";
import { NotificationPanel } from "../auction/NotificationPanel";
import { SecurityPanel } from "../auction/SecurityPanel";
import { UserProfile } from "../user/UserProfile";
import { QuickTokenTopup } from "../wallet/QuickTokenTopup";
import { MarketOverview } from "../market/MarketOverview";
import { useNavigate } from 'react-router-dom';
import { toast } from '@/components/ui/use-toast';

export const MainDashboard = () => {
  const { user, logout } = useAuth();
  const { isConnected } = useWebSocket();
  const navigate = useNavigate();
  const [featuredAuction, setFeaturedAuction] = useState<Auction | null>(null);
  const [endingSoonAuctions, setEndingSoonAuctions] = useState<Auction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      
      // Load featured auctions
      const featuredResponse = await apiClient.getAuctions({
        status: 'active',
        sort: 'most_bids',
        limit: 1
      });
      
      if (featuredResponse.data.auctions.length > 0) {
        setFeaturedAuction(featuredResponse.data.auctions[0]);
      }

      // Load ending soon auctions
      const endingSoonResponse = await apiClient.getAuctions({
        status: 'active',
        sort: 'ending_soon',
        limit: 10
      });
      
      setEndingSoonAuctions(endingSoonResponse.data.auctions);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="text-2xl font-bold text-terminal-green font-terminal animate-pulse">
            █ LOADING DASHBOARD █
          </div>
          <div className="text-sm text-muted-foreground">
            Fetching live auction data...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 font-terminal text-foreground">
      {/* Header */}
      <div className="mb-6 border border-panel-border bg-card/50 p-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="text-lg lg:text-xl font-bold text-foreground">█ ANONYMOUS AUCTION MARKETPLACE █</div>
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full animate-pulse-slow ${isConnected ? 'bg-live-pulse' : 'bg-terminal-red'}`}></div>
              <span className={`text-xs animate-pulse-slow ${isConnected ? 'text-terminal-green' : 'text-terminal-red'}`}>
                {isConnected ? 'LIVE' : 'OFFLINE'}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden lg:flex gap-4 text-sm">
              <button 
                onClick={() => navigate('/')}
                className="text-terminal-amber hover:text-terminal-amber/80 cursor-pointer transition-colors"
              >
                Live Auctions
              </button>
              <button 
                onClick={() => navigate('/my-bids')}
                className="text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
              >
                My Bids
              </button>
              <button 
                onClick={() => navigate('/wallet')}
                className="text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
              >
                Wallet
              </button>
              <button 
                onClick={() => navigate('/create-auction')}
                className="text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
              >
                Create Auction
              </button>
            </div>
            <Button 
              onClick={handleLogout}
              variant="outline" 
              size="sm"
              className="border-terminal-red text-terminal-red hover:bg-terminal-red/10"
            >
              Logout
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Panel - User Profile & Wallet */}
        <div className="lg:col-span-3">
          <UserProfile user={user} />
          <Card className="border-panel-border bg-card/50 p-4 mb-4">
            <NotificationPanel />
          </Card>
          <Card className="border-panel-border bg-card/50 p-4">
            <SecurityPanel />
          </Card>
        </div>

        {/* Center Panel - Main Auction Interface */}
        <div className="lg:col-span-6">
          <Card className="border-panel-border bg-card/50 p-4">
            <Tabs defaultValue="live-auction" className="w-full">
              <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-1">
                <TabsTrigger value="live-auction" className="text-xs sm:text-sm">Live</TabsTrigger>
                <TabsTrigger value="marketplace" className="text-xs sm:text-sm">Market</TabsTrigger>
                <TabsTrigger value="my-bids" className="text-xs sm:text-sm">My Bids</TabsTrigger>
                <TabsTrigger value="wallet" className="text-xs sm:text-sm">Wallet</TabsTrigger>
                <TabsTrigger value="create" className="text-xs sm:text-sm hidden sm:block">Create</TabsTrigger>
                <TabsTrigger value="help" className="text-xs sm:text-sm hidden lg:block">Help</TabsTrigger>
              </TabsList>
              
              <TabsContent value="live-auction" className="space-y-4">
                {featuredAuction ? (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-terminal-green">Featured Live Auction - {featuredAuction.title}</h3>
                      <Badge className="bg-terminal-red/20 text-terminal-red">ENDING SOON</Badge>
                    </div>
                    <LiveBiddingPanel auction={featuredAuction} />
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="text-muted-foreground">No featured auctions available</div>
                  </div>
                )}
                
                <div className="border-t border-panel-border pt-4">
                  <LiveActivityFeed />
                </div>
              </TabsContent>
              
              <TabsContent value="marketplace" className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-terminal-green">Browse Marketplace</h3>
                  <Button 
                    onClick={() => navigate('/create-auction')}
                    size="sm"
                    className="bg-terminal-green text-background hover:bg-terminal-green/80"
                  >
                    + Create Auction
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {endingSoonAuctions.slice(0, 6).map((auction) => (
                    <AuctionCard
                      key={auction._id}
                      auction={auction}
                      onClick={() => navigate(`/auction/${auction._id}`)}
                    />
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="my-bids">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-terminal-green">My Active Bids</h3>
                    <Button 
                      onClick={() => navigate('/my-bids')}
                      variant="outline"
                      size="sm"
                    >
                      View All
                    </Button>
                  </div>
                  <div className="text-center py-8">
                    <div className="text-muted-foreground">Loading your bids...</div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="wallet">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-terminal-green">Quick Wallet Actions</h3>
                    <Button 
                      onClick={() => navigate('/wallet')}
                      variant="outline"
                      size="sm"
                    >
                      Full Wallet
                    </Button>
                  </div>
                  <QuickTokenTopup />
                </div>
              </TabsContent>
              
              <TabsContent value="create">
                <div className="space-y-4">
                  <h3 className="text-terminal-green">Create New Auction</h3>
                  <div className="text-center py-8">
                    <Button 
                      onClick={() => navigate('/create-auction')}
                      className="bg-terminal-green text-background hover:bg-terminal-green/80"
                    >
                      Start Creating Auction
                    </Button>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="help">
                <div className="space-y-4">
                  <h3 className="text-terminal-green">How It Works</h3>
                  <div className="space-y-3 text-sm">
                    <div className="border border-panel-border bg-secondary/20 p-3 rounded">
                      <h4 className="text-terminal-amber mb-2">1. Purchase $WKC Tokens</h4>
                      <p className="text-muted-foreground">Buy WikiCat tokens using mobile money. 1 $WKC = 1 GH₵</p>
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
                      <h4 className="text-terminal-amber mb-2">4. Win & Pay with $WKC</h4>
                      <p className="text-muted-foreground">If you win, $WKC tokens are automatically deducted and item ships to you.</p>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </Card>
        </div>

        {/* Right Panel - Market Info & Ending Soon */}
        <div className="lg:col-span-3">
          <MarketOverview />
          
          <Card className="border-panel-border bg-card/50 p-4">
            <div className="mb-4 flex items-center justify-between border-b border-panel-border pb-2">
              <h3 className="text-terminal-green">Ending Soon</h3>
              <Badge variant="destructive" className="bg-terminal-red/20 text-terminal-red">URGENT</Badge>
            </div>
            <p className="mb-4 text-xs text-muted-foreground">
              Don't miss these auctions ending in the next hour
            </p>

            <div className="space-y-3">
              {endingSoonAuctions.map((auction) => (
                <AuctionCard
                  key={auction._id}
                  auction={auction}
                  compact
                  onClick={() => navigate(`/auction/${auction._id}`)}
                />
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};