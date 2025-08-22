import React, { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { apiClient } from '@/lib/api';

interface MarketStats {
  activeAuctions: number;
  totalBidders: number;
  tokensInPlay: number;
  avgBidValue: number;
  successRate: number;
}

export const MarketOverview = () => {
  const [stats, setStats] = useState<MarketStats>({
    activeAuctions: 0,
    totalBidders: 0,
    tokensInPlay: 0,
    avgBidValue: 0,
    successRate: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadMarketStats();
    
    // Refresh stats every 30 seconds
    const interval = setInterval(loadMarketStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadMarketStats = async () => {
    try {
      // In a real implementation, you'd have a dedicated endpoint for market stats
      // For now, we'll simulate with auction data
      const auctionsResponse = await apiClient.getAuctions({ status: 'active', limit: 100 });
      const auctions = auctionsResponse.data.auctions;
      
      const activeAuctions = auctions.length;
      const totalBidders = new Set(auctions.flatMap(a => a.bidding.uniqueBidders)).size;
      const tokensInPlay = auctions.reduce((sum, a) => sum + a.pricing.currentBid, 0);
      const avgBidValue = tokensInPlay / Math.max(activeAuctions, 1);
      const successRate = 73; // This would come from backend analytics
      
      setStats({
        activeAuctions,
        totalBidders,
        tokensInPlay,
        avgBidValue,
        successRate
      });
    } catch (error) {
      console.error('Failed to load market stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="border-panel-border bg-card/50 p-4 mb-4">
      <div className="mb-4 flex items-center justify-between border-b border-panel-border pb-2">
        <h3 className="text-terminal-green">Market Overview</h3>
        <Badge variant="outline" className="text-terminal-green border-terminal-green">
          LIVE
        </Badge>
      </div>
      
      {isLoading ? (
        <div className="text-center py-4">
          <div className="text-xs text-muted-foreground">Loading market data...</div>
        </div>
      ) : (
        <div className="space-y-3 text-xs">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Active Auctions:</span>
            <span className="text-terminal-green">{stats.activeAuctions}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Total Bidders:</span>
            <span className="text-terminal-green">{stats.totalBidders.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">$WKC in Play:</span>
            <span className="text-terminal-amber">{stats.tokensInPlay.toLocaleString()} $WKC</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Avg. Bid Value:</span>
            <span className="text-foreground">{Math.round(stats.avgBidValue).toLocaleString()} $WKC</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Success Rate:</span>
            <span className="text-terminal-green">{stats.successRate}%</span>
          </div>
        </div>
      )}
    </Card>
  );
};