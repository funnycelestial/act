import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PaymentGateway } from '@/components/auction/PaymentGateway';
import { apiClient, TokenBalance, TokenTransaction } from '@/lib/api';
import { toast } from '@/components/ui/use-toast';

const Wallet = () => {
  const navigate = useNavigate();
  const [balance, setBalance] = useState<TokenBalance>({
    available: 0,
    locked: 0,
    total: 0,
    blockchain: 0
  });
  const [transactions, setTransactions] = useState<TokenTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadWalletData();
  }, []);

  const loadWalletData = async () => {
    try {
      setIsLoading(true);
      const [balanceResponse, transactionsResponse] = await Promise.all([
        apiClient.getWalletBalance(),
        apiClient.getWalletTransactions()
      ]);
      
      setBalance(balanceResponse.data.balance);
      setTransactions(transactionsResponse.data.transactions);
    } catch (error) {
      console.error('Failed to load wallet data:', error);
      toast({
        title: "Error",
        description: "Failed to load wallet data",
        variant: "destructive",
      });
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
      case 'escrow_lock': return '🏦';
      case 'escrow_release': return '✅';
      case 'fee_payment': return '💳';
      case 'transfer': return '↔️';
      case 'refund': return '🔄';
      default: return '📄';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'text-terminal-green';
      case 'pending': return 'text-terminal-amber';
      case 'failed': return 'text-terminal-red';
      case 'cancelled': return 'text-muted-foreground';
      default: return 'text-muted-foreground';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="text-2xl font-bold text-terminal-green font-terminal animate-pulse">
            █ LOADING WALLET █
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 font-terminal">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-terminal-green">$WKC Wallet</h1>
            <p className="text-sm text-muted-foreground">Manage your WikiCat cryptocurrency</p>
          </div>
          <Button 
            onClick={() => navigate('/')} 
            variant="outline"
            className="border-panel-border"
          >
            ← Back to Dashboard
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Balance Overview */}
          <div className="lg:col-span-1">
            <Card className="border-panel-border bg-card/50 p-6 mb-6">
              <h2 className="text-lg font-bold text-terminal-green mb-4">Balance Overview</h2>
              
              <div className="space-y-4">
                <div className="text-center p-4 border border-terminal-green/30 bg-terminal-green/10 rounded">
                  <div className="text-3xl font-bold text-terminal-green">
                    {balance.total.toLocaleString()}
                  </div>
                  <div className="text-sm text-muted-foreground">Total $WKC</div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 border border-panel-border bg-secondary/20 rounded">
                    <div className="text-xl font-bold text-foreground">
                      {balance.available.toLocaleString()}
                    </div>
                    <div className="text-xs text-muted-foreground">Available</div>
                  </div>
                  
                  <div className="text-center p-3 border border-panel-border bg-secondary/20 rounded">
                    <div className="text-xl font-bold text-terminal-amber">
                      {balance.locked.toLocaleString()}
                    </div>
                    <div className="text-xs text-muted-foreground">Locked in Bids</div>
                  </div>
                </div>

                <div className="text-xs text-muted-foreground space-y-1">
                  <div className="flex justify-between">
                    <span>Blockchain Balance:</span>
                    <span>{balance.blockchain.toLocaleString()} $WKC</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Exchange Rate:</span>
                    <span>1 $WKC = 1.00 GH₵</span>
                  </div>
                </div>
              </div>
            </Card>

            {/* Quick Actions */}
            <Card className="border-panel-border bg-card/50 p-4">
              <h3 className="text-sm font-bold text-terminal-green mb-3">Quick Actions</h3>
              <div className="space-y-2">
                <Button 
                  className="w-full bg-terminal-green text-background hover:bg-terminal-green/80"
                  onClick={() => {/* Handle deposit */}}
                >
                  + Deposit $WKC
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => {/* Handle withdrawal */}}
                >
                  Withdraw $WKC
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => {/* Handle transfer */}}
                >
                  Transfer $WKC
                </Button>
              </div>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="transactions">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="transactions">Transaction History</TabsTrigger>
                <TabsTrigger value="deposit">Deposit</TabsTrigger>
                <TabsTrigger value="withdraw">Withdraw</TabsTrigger>
              </TabsList>

              <TabsContent value="transactions" className="mt-6">
                <Card className="border-panel-border bg-card/50 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-foreground">Transaction History</h3>
                    <Button 
                      onClick={loadWalletData}
                      variant="outline"
                      size="sm"
                    >
                      Refresh
                    </Button>
                  </div>

                  <div className="space-y-3">
                    {transactions.map((tx) => (
                      <div key={tx._id} className="flex items-center justify-between p-3 border border-panel-border bg-secondary/20 rounded">
                        <div className="flex items-center gap-3">
                          <span className="text-lg">{getTransactionIcon(tx.type)}</span>
                          <div>
                            <div className="text-sm font-medium text-foreground capitalize">
                              {tx.type.replace('_', ' ')}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {new Date(tx.createdAt).toLocaleString()}
                            </div>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <div className={`text-sm font-bold ${
                            tx.amount > 0 ? 'text-terminal-green' : 'text-terminal-red'
                          }`}>
                            {tx.amount > 0 ? '+' : ''}{tx.amount.toLocaleString()} $WKC
                          </div>
                          <div className={`text-xs ${getStatusColor(tx.status)}`}>
                            {tx.status.toUpperCase()}
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {transactions.length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        No transactions yet
                      </div>
                    )}
                  </div>
                </Card>
              </TabsContent>

              <TabsContent value="deposit" className="mt-6">
                <PaymentGateway type="deposit" onSuccess={loadWalletData} />
              </TabsContent>

              <TabsContent value="withdraw" className="mt-6">
                <PaymentGateway type="withdrawal" onSuccess={loadWalletData} />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Wallet;