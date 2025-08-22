import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TokenBalance, TokenTransaction } from "@/lib/api";
import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api";

interface UserWalletProps {
  balance: TokenBalance;
  onBalanceUpdate: (balance: TokenBalance) => void;
}

export const UserWallet = ({ balance, onBalanceUpdate }: UserWalletProps) => {
  const [recentTransactions, setRecentTransactions] = useState<TokenTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadRecentTransactions();
  }, []);

  const loadRecentTransactions = async () => {
    try {
      const response = await apiClient.getWalletTransactions(undefined, 1, 3);
      setRecentTransactions(response.data.transactions);
    } catch (error) {
      console.error('Failed to load recent transactions:', error);
    }
  };

  const refreshBalance = async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.getWalletBalance();
      onBalanceUpdate(response.data.balance);
    } catch (error) {
      console.error('Failed to refresh balance:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'deposit': return '💰';
      case 'withdrawal': return '💸';
      case 'bid_lock': return '🔒';
      case 'bid_unlock': return '🔓';
      case 'transfer': return '↔️';
      default: return '📄';
    }
  };

  const getTransactionColor = (type: string, amount: number) => {
    if (amount > 0) return 'text-terminal-green';
    if (amount < 0) return 'text-terminal-red';
    return 'text-muted-foreground';
  };
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium">WIKICAT TOKENS ($WKC)</span>
        <Badge className="bg-terminal-green/20 text-terminal-green text-xs">VERIFIED</Badge>
      </div>
      
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs">Available Balance</span>
          <div className="flex items-center gap-2">
            <span className="text-xs text-terminal-green animate-pulse-slow font-bold">
              {balance.available.toLocaleString()} $WKC
            </span>
            <Button 
              size="sm" 
              variant="ghost" 
              onClick={refreshBalance}
              disabled={isLoading}
              className="h-4 w-4 p-0"
            >
              {isLoading ? '⟳' : '↻'}
            </Button>
          </div>
        </div>
        <Progress value={balance.total > 0 ? (balance.available / balance.total) * 100 : 0} className="h-1" />
        
        <div className="flex items-center justify-between">
          <span className="text-xs">Pending Bids</span>
          <span className="text-xs text-terminal-amber">{balance.locked.toLocaleString()} $WKC</span>
        </div>
        <Progress value={balance.total > 0 ? (balance.locked / balance.total) * 100 : 0} className="h-1" />
      </div>

      <div className="border-t border-panel-border pt-2 mt-3">
        <div className="text-xs text-muted-foreground mb-2">Recent Transactions</div>
        <div className="space-y-1">
          {recentTransactions.map((tx) => (
            <div key={tx._id} className="flex justify-between items-center text-xs">
              <div className="flex items-center gap-2">
                <span className="text-sm">{getTransactionIcon(tx.type)}</span>
                <span className="text-muted-foreground capitalize">{tx.type.replace('_', ' ')}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={getTransactionColor(tx.type, tx.amount)}>
                  {tx.amount > 0 ? '+' : ''}{tx.amount.toLocaleString()} $WKC
                </span>
                <span className="text-muted-foreground">
                  {new Date(tx.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
          {recentTransactions.length === 0 && (
            <div className="text-xs text-muted-foreground text-center py-2">
              No recent transactions
            </div>
          )}
        </div>
      </div>
    </div>
  );
};