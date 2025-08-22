import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface EscrowTransaction {
  id: string;
  auctionItem: string;
  amount: string;
  status: 'pending' | 'funded' | 'delivered' | 'disputed' | 'completed';
  buyer: string;
  seller: string;
  createdAt: string;
  deliveryDeadline: string;
}

export const EscrowPanel = () => {
  const escrowTransactions: EscrowTransaction[] = [
    {
      id: "ESC_001",
      auctionItem: "MacBook Pro M3",
      amount: "2,850",
      status: "funded",
      buyer: "BUYER_4A7X",
      seller: "SELLER_99Z",
      createdAt: "2024-01-15",
      deliveryDeadline: "2024-01-22"
    },
    {
      id: "ESC_002", 
      auctionItem: "Web Development Project",
      amount: "1,200",
      status: "pending",
      buyer: "CLIENT_88B",
      seller: "DEV_42X",
      createdAt: "2024-01-16",
      deliveryDeadline: "2024-02-15"
    },
    {
      id: "ESC_003",
      auctionItem: "iPhone 14 Pro",
      amount: "980",
      status: "delivered",
      buyer: "BUYER_4A7X",
      seller: "SELLER_33A",
      createdAt: "2024-01-10",
      deliveryDeadline: "2024-01-17"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-terminal-amber/20 text-terminal-amber';
      case 'funded': return 'bg-terminal-green/20 text-terminal-green';
      case 'delivered': return 'bg-blue-500/20 text-blue-400';
      case 'disputed': return 'bg-terminal-red/20 text-terminal-red';
      case 'completed': return 'bg-green-500/20 text-green-400';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusProgress = (status: string) => {
    switch (status) {
      case 'pending': return 25;
      case 'funded': return 50;
      case 'delivered': return 75;
      case 'completed': return 100;
      case 'disputed': return 40;
      default: return 0;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-terminal-green">Escrow Management</h3>
        <Badge variant="outline" className="text-terminal-green border-terminal-green">
          {escrowTransactions.length} Active
        </Badge>
      </div>

      <div className="space-y-3">
        {escrowTransactions.map((transaction) => (
          <div key={transaction.id} className="border border-panel-border bg-secondary/20 p-3 rounded">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-medium text-foreground">{transaction.auctionItem}</div>
              <Badge className={getStatusColor(transaction.status)}>
                {transaction.status.toUpperCase()}
              </Badge>
            </div>
            
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Escrow ID:</span>
                <span className="text-foreground">{transaction.id}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-muted-foreground">Amount:</span>
                <span className="text-terminal-green">{transaction.amount} tokens</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-muted-foreground">Buyer:</span>
                <span className="text-foreground">{transaction.buyer}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-muted-foreground">Seller:</span>
                <span className="text-foreground">{transaction.seller}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-muted-foreground">Delivery Deadline:</span>
                <span className="text-terminal-red">{transaction.deliveryDeadline}</span>
              </div>
              
              <div className="mt-2">
                <div className="flex justify-between mb-1">
                  <span className="text-muted-foreground">Progress:</span>
                  <span className="text-foreground">{getStatusProgress(transaction.status)}%</span>
                </div>
                <Progress value={getStatusProgress(transaction.status)} className="h-1" />
              </div>
              
              <div className="flex gap-2 mt-3">
                {transaction.status === 'delivered' && (
                  <button className="bg-terminal-green px-2 py-1 text-xs text-background hover:bg-terminal-green/80 transition-colors">
                    Confirm Delivery
                  </button>
                )}
                {transaction.status === 'funded' && (
                  <button className="bg-terminal-amber px-2 py-1 text-xs text-background hover:bg-terminal-amber/80 transition-colors">
                    Mark Delivered
                  </button>
                )}
                <button className="bg-secondary hover:bg-accent px-2 py-1 text-xs transition-colors">
                  View Details
                </button>
                <button className="bg-terminal-red/20 hover:bg-terminal-red/30 px-2 py-1 text-xs text-terminal-red transition-colors">
                  Dispute
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};