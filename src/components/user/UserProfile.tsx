import React, { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { User } from '@/lib/api';
import { apiClient } from '@/lib/api';
import { UserWallet } from "../auction/UserWallet";

interface UserProfileProps {
  user: User | null;
}

export const UserProfile: React.FC<UserProfileProps> = ({ user }) => {
  const [walletBalance, setWalletBalance] = useState({
    available: 0,
    locked: 0,
    total: 0
  });

  useEffect(() => {
    if (user) {
      loadWalletBalance();
    }
  }, [user]);

  const loadWalletBalance = async () => {
    try {
      const response = await apiClient.getWalletBalance();
      setWalletBalance(response.data.balance);
    } catch (error) {
      console.error('Failed to load wallet balance:', error);
    }
  };

  if (!user) return null;

  return (
    <Card className="border-panel-border bg-card/50 p-4 mb-4">
      <div className="mb-4 border-b border-panel-border pb-2">
        <h3 className="text-terminal-green">Anonymous Profile</h3>
        <p className="text-xs text-muted-foreground">Secure bidder credentials and $WKC wallet</p>
      </div>
      
      <div className="mb-4">
        <div className="mb-2 h-16 w-16 border border-panel-border bg-secondary/20 flex items-center justify-center">
          <span className="text-foreground text-xl">🎭</span>
        </div>
        <div className="space-y-1 text-sm">
          <div className="text-foreground">BIDDER #{user.anonymousId}</div>
          <div>» STATUS     : {user.profile.isVerified ? 'VERIFIED' : 'UNVERIFIED'}</div>
          <div>» $WKC TOKENS : {walletBalance.total.toLocaleString()}</div>
          <div>» REPUTATION : {'★'.repeat(Math.floor(user.profile.reputation))}{'☆'.repeat(5 - Math.floor(user.profile.reputation))} ({user.profile.reputation})</div>
          <div>» MEMBER SINCE: {new Date(user.profile.memberSince).toLocaleDateString()}</div>
          <div>» AUCTIONS WON: {user.profile.wonAuctions}</div>
          <div>» SUCCESS RATE: {user.profile.successRate}%</div>
        </div>
      </div>

      <div className="mb-4">
        <h4 className="mb-2 text-terminal-green">Bidding Stats</h4>
        <div className="grid grid-cols-3 gap-2 text-center">
          <div>
            <div className="text-xl font-bold">{user.profile.totalAuctions}</div>
            <div className="text-xs text-muted-foreground">Total Bids</div>
          </div>
          <div>
            <div className="text-xl font-bold text-terminal-green">{user.profile.wonAuctions}</div>
            <div className="text-xs text-muted-foreground">Won</div>
          </div>
          <div>
            <div className="text-xl font-bold text-terminal-amber">5</div>
            <div className="text-xs text-muted-foreground">Active</div>
          </div>
        </div>
        
        <div className="mt-4">
          <UserWallet balance={walletBalance} onBalanceUpdate={setWalletBalance} />
        </div>
      </div>

      <div>
        <h4 className="mb-2 text-terminal-green">Quick $WKC Top-Up</h4>
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
          <Button 
            onClick={() => window.location.href = '/wallet'}
            className="w-full mt-2 bg-primary px-2 py-1 text-xs text-primary-foreground hover:bg-primary/80 transition-colors"
          >
            Add $WKC Tokens → GH₵ to $WKC
          </Button>
        </div>
      </div>
    </Card>
  );
};