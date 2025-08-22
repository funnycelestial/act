import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { useAuth } from '@/contexts/AuthContext';
import { useWebSocket } from '@/contexts/WebSocketContext';
import { apiClient, Auction, Bid } from '@/lib/api';
import { LiveCountdown } from '@/components/auction/LiveCountdown';
import { toast } from '@/components/ui/use-toast';

const AuctionDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { joinAuction, leaveAuction, on, off } = useWebSocket();
  
  const [auction, setAuction] = useState<Auction | null>(null);
  const [bids, setBids] = useState<Bid[]>([]);
  const [bidAmount, setBidAmount] = useState('');
  const [isPlacingBid, setIsPlacingBid] = useState(false);
  const [isWatching, setIsWatching] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadAuctionDetails();
      loadBids();
    }
  }, [id]);

  useEffect(() => {
    if (auction) {
      joinAuction(auction._id);
      
      const handleBidUpdate = (data: any) => {
        if (data.auctionId === auction.auctionId) {
          loadBids();
          loadAuctionDetails(); // Refresh auction data
        }
      };

      on('bid_placed', handleBidUpdate);

      return () => {
        off('bid_placed', handleBidUpdate);
        leaveAuction(auction._id);
      };
    }
  }, [auction]);

  const loadAuctionDetails = async () => {
    if (!id) return;
    
    try {
      const response = await apiClient.getAuction(id);
      setAuction(response.data.auction);
      setIsWatching(response.data.auction.isWatching || false);
    } catch (error) {
      console.error('Failed to load auction details:', error);
      toast({
        title: "Error",
        description: "Failed to load auction details",
        variant: "destructive",
      });
      navigate('/');
    } finally {
      setIsLoading(false);
    }
  };

  const loadBids = async () => {
    if (!id) return;
    
    try {
      const response = await apiClient.getAuctionBids(id);
      setBids(response.data.bids);
    } catch (error) {
      console.error('Failed to load bids:', error);
    }
  };

  const handlePlaceBid = async () => {
    if (!auction || !bidAmount || isPlacingBid) return;

    const amount = parseFloat(bidAmount);
    setIsPlacingBid(true);
    
    try {
      await apiClient.placeBid(auction._id, amount);
      setBidAmount('');
      toast({
        title: "Bid Placed",
        description: `Successfully placed bid of ${amount} $WKC`,
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

  const handleWatchToggle = async () => {
    if (!auction) return;
    
    try {
      if (isWatching) {
        await apiClient.unwatchAuction(auction._id);
        setIsWatching(false);
        toast({
          title: "Unwatched",
          description: "Removed from watchlist",
        });
      } else {
        await apiClient.watchAuction(auction._id);
        setIsWatching(true);
        toast({
          title: "Watching",
          description: "Added to watchlist",
        });
      }
    } catch (error) {
      console.error('Failed to toggle watch status:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="text-2xl font-bold text-terminal-green font-terminal animate-pulse">
            █ LOADING AUCTION █
          </div>
        </div>
      </div>
    );
  }

  if (!auction) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="text-xl text-terminal-red">Auction not found</div>
          <Button onClick={() => navigate('/')}>Return to Dashboard</Button>
        </div>
      </div>
    );
  }

  const isOwner = user?.id === auction.seller.userId;
  const isReverse = auction.type === 'reverse';

  return (
    <div className="min-h-screen bg-background p-4 font-terminal">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <Button 
          onClick={() => navigate('/')} 
          variant="outline"
          className="border-panel-border"
        >
          ← Back to Dashboard
        </Button>
        <div className="flex items-center gap-2">
          <Badge className={`${auction.status === 'active' ? 'bg-terminal-green/20 text-terminal-green' : 'bg-terminal-red/20 text-terminal-red'}`}>
            {auction.status.toUpperCase()}
          </Badge>
          {isReverse && (
            <Badge className="bg-terminal-amber/20 text-terminal-amber">
              REVERSE AUCTION
            </Badge>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Auction Header */}
          <Card className="border-panel-border bg-card/50 p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold text-foreground mb-2">{auction.title}</h1>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>Category: {auction.category}</span>
                  <span>Seller: {auction.seller.anonymousId}</span>
                  <span>Views: {auction.analytics.views}</span>
                </div>
              </div>
              <Button
                onClick={handleWatchToggle}
                variant={isWatching ? "default" : "outline"}
                className={isWatching ? "bg-terminal-amber text-background" : ""}
              >
                {isWatching ? '👁️ Watching' : '👁️ Watch'}
              </Button>
            </div>

            {/* Images */}
            {auction.images && auction.images.length > 0 && (
              <div className="mb-4">
                <img 
                  src={auction.images[0].url} 
                  alt={auction.images[0].alt}
                  className="w-full h-64 object-cover rounded border border-panel-border"
                />
              </div>
            )}

            <p className="text-muted-foreground">{auction.description}</p>
          </Card>

          {/* Bidding Interface */}
          <Card className="border-panel-border bg-card/50 p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-bold text-terminal-green mb-4">
                  {isReverse ? 'Submit Quote' : 'Place Bid'}
                </h3>
                
                <div className="space-y-4">
                  <div className="p-4 border border-panel-border bg-secondary/20 rounded">
                    <div className="text-sm font-medium text-foreground mb-2">
                      {isReverse ? 'Current Lowest Quote' : 'Current Highest Bid'}
                    </div>
                    <div className="text-2xl font-bold text-terminal-green">
                      {auction.pricing.currentBid.toLocaleString()} $WKC
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Starting {isReverse ? 'budget' : 'bid'}: {auction.pricing.startingBid.toLocaleString()} $WKC
                    </div>
                  </div>

                  <LiveCountdown endTime={auction.timing.endTime} className="text-sm" />

                  {!isOwner && auction.status === 'active' && (
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium text-foreground">
                          {isReverse ? 'Quote Amount' : 'Bid Amount'} ($WKC)
                        </label>
                        <Input
                          type="number"
                          min={isReverse ? 1 : auction.pricing.currentBid + 1}
                          max={isReverse ? auction.pricing.currentBid - 1 : undefined}
                          placeholder={`Enter ${isReverse ? 'quote' : 'bid'} amount`}
                          value={bidAmount}
                          onChange={(e) => setBidAmount(e.target.value)}
                          className="mt-1"
                        />
                        <div className="text-xs text-muted-foreground mt-1">
                          {isReverse 
                            ? `Must be less than ${auction.pricing.currentBid} $WKC`
                            : `Must be more than ${auction.pricing.currentBid} $WKC`
                          }
                        </div>
                      </div>
                      
                      <Button
                        onClick={handlePlaceBid}
                        disabled={!bidAmount || isPlacingBid}
                        className="w-full bg-terminal-green text-background hover:bg-terminal-green/80"
                      >
                        {isPlacingBid ? 'Placing...' : `Place ${isReverse ? 'Quote' : 'Bid'}`}
                      </Button>
                    </div>
                  )}

                  {isOwner && (
                    <div className="p-4 border border-terminal-amber bg-terminal-amber/10 rounded">
                      <div className="text-sm text-terminal-amber">
                        You are the seller of this auction
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-bold text-terminal-green mb-4">
                  {isReverse ? 'Quote History' : 'Bid History'}
                </h3>
                
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {bids.map((bid, index) => (
                    <div 
                      key={bid._id}
                      className={`p-3 border border-panel-border rounded ${
                        index === 0 ? 'bg-terminal-green/10 border-terminal-green/50' : 'bg-secondary/20'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">
                          {bid.bidder.anonymousId}
                        </span>
                        <span className={`text-sm font-bold ${
                          index === 0 ? 'text-terminal-green' : 'text-foreground'
                        }`}>
                          {bid.amount.toLocaleString()} $WKC
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {new Date(bid.timing.placedAt).toLocaleString()}
                      </div>
                    </div>
                  ))}
                  
                  {bids.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      No {isReverse ? 'quotes' : 'bids'} yet
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Auction Info */}
          <Card className="border-panel-border bg-card/50 p-4">
            <h3 className="text-lg font-bold text-terminal-green mb-4">Auction Details</h3>
            
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Auction ID:</span>
                <span className="text-foreground font-mono">{auction.auctionId}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-muted-foreground">Type:</span>
                <span className="text-foreground capitalize">{auction.type}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-muted-foreground">Category:</span>
                <span className="text-foreground capitalize">{auction.category}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-muted-foreground">Condition:</span>
                <span className="text-foreground capitalize">{auction.specifications.condition}</span>
              </div>
              
              {auction.specifications.brand && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Brand:</span>
                  <span className="text-foreground">{auction.specifications.brand}</span>
                </div>
              )}
              
              {auction.specifications.model && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Model:</span>
                  <span className="text-foreground">{auction.specifications.model}</span>
                </div>
              )}
              
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Bids:</span>
                <span className="text-terminal-green">{auction.bidding.totalBids}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-muted-foreground">Watchers:</span>
                <span className="text-terminal-amber">{auction.analytics.watchersCount}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-muted-foreground">Started:</span>
                <span className="text-foreground">
                  {new Date(auction.timing.startTime).toLocaleDateString()}
                </span>
              </div>
            </div>
          </Card>

          {/* Seller Info */}
          <Card className="border-panel-border bg-card/50 p-4">
            <h3 className="text-lg font-bold text-terminal-green mb-4">Seller Information</h3>
            
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 border border-panel-border bg-secondary/20 flex items-center justify-center rounded">
                  <span className="text-lg">🎭</span>
                </div>
                <div>
                  <div className="font-medium text-foreground">{auction.seller.anonymousId}</div>
                  <div className="text-xs text-muted-foreground">Anonymous Seller</div>
                </div>
              </div>
              
              {/* Note: In a real implementation, you'd fetch seller stats */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Reputation:</span>
                  <span className="text-terminal-green">★★★★☆</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Sales:</span>
                  <span className="text-foreground">--</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Success Rate:</span>
                  <span className="text-terminal-green">--%</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Shipping Info */}
          <Card className="border-panel-border bg-card/50 p-4">
            <h3 className="text-lg font-bold text-terminal-green mb-4">Shipping & Delivery</h3>
            
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Method:</span>
                <span className="text-foreground capitalize">{auction.shipping.method}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-muted-foreground">Cost:</span>
                <span className="text-foreground">
                  {auction.shipping.cost > 0 ? `${auction.shipping.cost} $WKC` : 'Free'}
                </span>
              </div>
              
              {auction.shipping.estimatedDelivery && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Delivery:</span>
                  <span className="text-foreground">
                    {auction.shipping.estimatedDelivery.min}-{auction.shipping.estimatedDelivery.max} days
                  </span>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AuctionDetails;