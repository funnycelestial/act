import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";

interface Dispute {
  id: string;
  escrowId: string;
  auctionItem: string;
  amount: string;
  status: 'open' | 'investigating' | 'resolved' | 'closed';
  initiator: string;
  respondent: string;
  reason: string;
  createdAt: string;
  adminAssigned?: string;
}

export const DisputePanel = () => {
  const [newDispute, setNewDispute] = useState("");
  
  const disputes: Dispute[] = [
    {
      id: "DIS_001",
      escrowId: "ESC_001",
      auctionItem: "MacBook Pro M3",
      amount: "2,850",
      status: "investigating",
      initiator: "BUYER_4A7X",
      respondent: "SELLER_99Z",
      reason: "Item not as described - different model received",
      createdAt: "2024-01-18",
      adminAssigned: "ADMIN_001"
    },
    {
      id: "DIS_002",
      escrowId: "ESC_004",
      auctionItem: "Logo Design Project",
      amount: "350",
      status: "open",
      initiator: "CLIENT_88B",
      respondent: "DESIGNER_77",
      reason: "Delivery deadline missed by 5 days",
      createdAt: "2024-01-19"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-terminal-red/20 text-terminal-red';
      case 'investigating': return 'bg-terminal-amber/20 text-terminal-amber';
      case 'resolved': return 'bg-terminal-green/20 text-terminal-green';
      case 'closed': return 'bg-muted text-muted-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-terminal-green">Dispute Management</h3>
        <Badge variant="outline" className="text-terminal-red border-terminal-red">
          {disputes.filter(d => d.status !== 'closed').length} Active
        </Badge>
      </div>

      {/* File New Dispute */}
      <div className="border border-panel-border bg-secondary/20 p-3 rounded">
        <h4 className="text-sm font-medium text-foreground mb-2">File New Dispute</h4>
        <div className="space-y-2">
          <select className="w-full bg-background border border-panel-border px-2 py-1 text-xs focus:border-terminal-green focus:outline-none">
            <option>Select Escrow Transaction</option>
            <option>ESC_001 - MacBook Pro M3</option>
            <option>ESC_002 - Web Development</option>
            <option>ESC_003 - iPhone 14 Pro</option>
          </select>
          
          <Textarea 
            placeholder="Describe the issue in detail..."
            value={newDispute}
            onChange={(e) => setNewDispute(e.target.value)}
            className="text-xs min-h-[60px]"
          />
          
          <button className="bg-terminal-red px-3 py-1 text-xs text-background hover:bg-terminal-red/80 transition-colors">
            File Dispute
          </button>
        </div>
      </div>

      {/* Active Disputes */}
      <div className="space-y-3">
        {disputes.map((dispute) => (
          <div key={dispute.id} className="border border-panel-border bg-secondary/20 p-3 rounded">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-medium text-foreground">{dispute.auctionItem}</div>
              <Badge className={getStatusColor(dispute.status)}>
                {dispute.status.toUpperCase()}
              </Badge>
            </div>
            
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Dispute ID:</span>
                <span className="text-foreground">{dispute.id}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-muted-foreground">Escrow:</span>
                <span className="text-foreground">{dispute.escrowId}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-muted-foreground">Amount:</span>
                <span className="text-terminal-green">{dispute.amount} tokens</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-muted-foreground">Initiator:</span>
                <span className="text-foreground">{dispute.initiator}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-muted-foreground">Respondent:</span>
                <span className="text-foreground">{dispute.respondent}</span>
              </div>
              
              {dispute.adminAssigned && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Admin:</span>
                  <span className="text-terminal-amber">{dispute.adminAssigned}</span>
                </div>
              )}
              
              <div className="mt-2">
                <span className="text-muted-foreground">Reason:</span>
                <p className="text-foreground mt-1 p-2 bg-background/50 rounded text-xs">
                  {dispute.reason}
                </p>
              </div>
              
              <div className="flex gap-2 mt-3">
                <button className="bg-secondary hover:bg-accent px-2 py-1 text-xs transition-colors">
                  View Details
                </button>
                <button className="bg-terminal-amber px-2 py-1 text-xs text-background hover:bg-terminal-amber/80 transition-colors">
                  Add Response
                </button>
                {dispute.status === 'open' && (
                  <button className="bg-terminal-green px-2 py-1 text-xs text-background hover:bg-terminal-green/80 transition-colors">
                    Resolve
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};