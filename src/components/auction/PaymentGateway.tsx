import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

interface PaymentMethod {
  id: string;
  name: string;
  type: 'mobile_money' | 'bank_card' | 'crypto';
  status: 'active' | 'offline' | 'maintenance';
  fees: string;
  processingTime: string;
}

export const PaymentGateway = () => {
  const paymentMethods: PaymentMethod[] = [
    {
      id: "mtn_momo",
      name: "MTN Mobile Money",
      type: "mobile_money",
      status: "active",
      fees: "1.5%",
      processingTime: "Instant"
    },
    {
      id: "vodafone_cash",
      name: "Vodafone Cash",
      type: "mobile_money", 
      status: "active",
      fees: "1.8%",
      processingTime: "Instant"
    },
    {
      id: "airteltigo",
      name: "AirtelTigo Money",
      type: "mobile_money",
      status: "offline",
      fees: "2.0%",
      processingTime: "1-5 mins"
    },
    {
      id: "visa_card",
      name: "Visa/Mastercard",
      type: "bank_card",
      status: "active",
      fees: "2.9%",
      processingTime: "2-3 mins"
    }
  ];

  const recentTransactions = [
    {
      id: "TXN_001",
      type: "deposit",
      method: "MTN MoMo",
      amount: "500",
      tokens: "500",
      status: "completed",
      timestamp: "2 mins ago"
    },
    {
      id: "TXN_002", 
      type: "withdrawal",
      method: "Vodafone Cash",
      amount: "200",
      tokens: "200",
      status: "pending",
      timestamp: "15 mins ago"
    },
    {
      id: "TXN_003",
      type: "deposit",
      method: "Visa Card",
      amount: "1,000", 
      tokens: "1,000",
      status: "completed",
      timestamp: "1 hour ago"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-terminal-green';
      case 'completed': return 'text-terminal-green';
      case 'pending': return 'text-terminal-amber';
      case 'offline': return 'text-terminal-red';
      case 'maintenance': return 'text-muted-foreground';
      case 'failed': return 'text-terminal-red';
      default: return 'text-muted-foreground';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-terminal-green">Payment Gateway</h3>
        <Badge variant="outline" className="text-terminal-green border-terminal-green">
          4 Methods
        </Badge>
      </div>

      {/* Payment Methods */}
      <Card className="border-panel-border bg-secondary/20 p-3">
        <h4 className="text-sm font-medium text-foreground mb-3">Available Payment Methods</h4>
        <div className="space-y-2">
          {paymentMethods.map((method) => (
            <div key={method.id} className="flex items-center justify-between p-2 border border-panel-border bg-background/50 rounded text-xs">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${
                  method.status === 'active' ? 'bg-terminal-green' : 
                  method.status === 'offline' ? 'bg-terminal-red' : 
                  'bg-terminal-amber'
                } animate-pulse-slow`}></div>
                <span className="text-foreground">{method.name}</span>
              </div>
              <div className="flex gap-3 text-xs">
                <span className="text-muted-foreground">{method.fees}</span>
                <span className="text-muted-foreground">{method.processingTime}</span>
                <span className={getStatusColor(method.status)}>
                  {method.status.toUpperCase()}
                </span>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-4 p-3 border border-terminal-green/30 bg-terminal-green/10 rounded">
          <h5 className="text-sm text-terminal-green mb-2">Token Exchange Rate</h5>
          <div className="text-xs space-y-1">
            <div className="flex justify-between">
              <span>1 Ghana Token (GHT)</span>
              <span className="text-terminal-green">= 1.00 GH₵</span>
            </div>
            <div className="flex justify-between">
              <span>Minimum Purchase</span>
              <span>10 GHT (GH₵ 10)</span>
            </div>
            <div className="flex justify-between">
              <span>Maximum Purchase</span>
              <span>10,000 GHT (GH₵ 10,000)</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-2">
        <button className="bg-terminal-green px-3 py-2 text-xs text-background hover:bg-terminal-green/80 transition-colors">
          + Buy Tokens (GH₵ → GHT)
        </button>
        <button className="bg-secondary hover:bg-accent px-3 py-2 text-xs transition-colors">
          Cash Out (GHT → GH₵)
        </button>
      </div>

      {/* Recent Transactions */}
      <Card className="border-panel-border bg-secondary/20 p-3">
        <h4 className="text-sm font-medium text-foreground mb-3">Recent Transactions</h4>
        <div className="space-y-2">
          {recentTransactions.map((txn) => (
            <div key={txn.id} className="flex items-center justify-between p-2 border border-panel-border bg-background/50 rounded text-xs">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className={`${txn.type === 'deposit' ? 'text-terminal-green' : 'text-terminal-amber'}`}>
                    {txn.type.toUpperCase()}
                  </span>
                  <span className="text-muted-foreground">via {txn.method}</span>
                </div>
                <div className="text-muted-foreground">{txn.timestamp}</div>
              </div>
              <div className="text-right">
                <div className="text-foreground">{txn.tokens} tokens</div>
                <div className={getStatusColor(txn.status)}>
                  {txn.status.toUpperCase()}
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};