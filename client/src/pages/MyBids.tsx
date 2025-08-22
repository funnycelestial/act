import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { apiClient, Bid } from '@/lib/api';
import { toast } from '@/components/ui/use-toast';

const MyBids = () => {
  const navigate = useNavigate();
  const [bids, setBids] = useState<Bid[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    loadBids();
  }, [activeTab]);

  const loadBids = async () => {
    try {
      setIsLoading(true);
      const status = activeTab === 'all' ? undefined : activeTab;
      const response = await apiClient.getMyBids(status);
      setBids(response.data.bids);
    } catch (error) {
      console.error('Failed to load bids:', error);
      toast({
        title: "Error",
        description: "Failed to load your bids",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleWithdrawBid = async (bidId: string) => {
    try {
      await apiClient.withdrawBid(bidId);
      toast({
        title: "Bid Withdrawn",
        description: "Your bid has been withdrawn and tokens refunded",
      });
      loadBids(); // Refresh the list
    } catch (error) {
      console.error('Failed to withdraw bid:', error);
      toast({
        title: "Withdrawal Failed",
        description: error instanceof Error ? error.message : "Failed to withdraw bid",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'winning': return 'bg-terminal-green/20 text-terminal-green';
      case 'won': return 'bg-terminal-green/20 text-terminal-green';
      case 'outbid': return 'bg-terminal-red/20 text-terminal-red';
      case 'lost': return 'bg-terminal-red/20 text-terminal-red';
      case 'active': return 'bg-terminal-amber/20 text-terminal-amber';
      case 'pending': return 'bg-muted text-muted-foreground';
      case 'cancelled': return 'bg-muted text-muted-foreground';
      case 'refunded': return 'bg-blue-500/20 text-blue-400';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const canWithdraw = (bid: Bid) => {
    return bid.status === 'active' || bid.status === 'outbid';
  };

  const filteredBids = bids.filter(bid => {
    if (activeTab === 'all') return true;
    return bid.status === activeTab;
  });

  return (
    <div className="min-h-screen bg-background p-4 font-terminal">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-terminal-green">My Bids</h1>
            <p className="text-sm text-muted-foreground">Track all your auction bids and quotes</p>
          </div>
          <Button 
            onClick={() => navigate('/')} 
            variant="outline"
            className="border-panel-border"
          >
            ← Back to Dashboard
          </Button>
        </div>

        <Card className="border-panel-border bg-card/50 p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="active">Active</TabsTrigger>
              <TabsTrigger value="winning">Winning</TabsTrigger>
              <TabsTrigger value="won">Won</TabsTrigger>
              <TabsTrigger value="outbid">Outbid</TabsTrigger>
              <TabsTrigger value="lost">Lost</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="mt-6">
              {isLoading ? (
                <div className="text-center py-8">
                  <div className="text-muted-foreground">Loading your bids...</div>
                </div>
              ) : filteredBids.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-muted-foreground">No bids found</div>
                  <Button 
                    onClick={() => navigate('/')}
                    className="mt-4 bg-terminal-green text-background hover:bg-terminal-green/80"
                  >
                    Start Bidding
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredBids.map((bid) => (
                    <Card key={bid._id} className="border-panel-border bg-secondary/20 p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="text-lg font-medium text-foreground">
                            {bid.auction.auctionRef.title}
                          </h3>
                          <div className="text-sm text-muted-foreground">
                            Bid ID: {bid.bidId}
                          </div>
                        </div>
                        <Badge className={getStatusColor(bid.status)}>
                          {bid.status.toUpperCase()}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">My Bid:</span>
                          <div className="text-foreground font-medium">
                            {bid.amount.toLocaleString()} $WKC
                          </div>
                        </div>
                        
                        <div>
                          <span className="text-muted-foreground">Current Bid:</span>
                          <div className="text-foreground font-medium">
                            {bid.auction.auctionRef.pricing.currentBid.toLocaleString()} $WKC
                          </div>
                        </div>
                        
                        <div>
                          <span className="text-muted-foreground">Placed:</span>
                          <div className="text-foreground">
                            {new Date(bid.timing.placedAt).toLocaleDateString()}
                          </div>
                        </div>
                        
                        <div>
                          <span className="text-muted-foreground">Auction Ends:</span>
                          <div className="text-terminal-red">
                            {new Date(bid.auction.auctionRef.timing.endTime).toLocaleDateString()}
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2 mt-4">
                        <Button
                          onClick={() => navigate(`/auction/${bid.auction.auctionRef._id}`)}
                          variant="outline"
                          size="sm"
                        >
                          View Auction
                        </Button>
                        
                        {canWithdraw(bid) && (
                          <Button
                            onClick={() => handleWithdrawBid(bid.bidId)}
                            variant="outline"
                            size="sm"
                            className="border-terminal-red text-terminal-red hover:bg-terminal-red/10"
                          >
                            Withdraw Bid
                          </Button>
                        )}
                        
                        {bid.blockchain.transactionHash && (
                          <Button
                            onClick={() => window.open(`https://etherscan.io/tx/${bid.blockchain.transactionHash}`, '_blank')}
                            variant="outline"
                            size="sm"
                            className="text-xs"
                          >
                            View on Blockchain
                          </Button>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
};

export default MyBids;