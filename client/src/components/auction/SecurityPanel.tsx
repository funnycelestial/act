import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

interface SecurityEvent {
  id: string;
  type: 'login' | 'bid_placed' | 'token_purchase' | 'suspicious_activity' | 'identity_verification';
  description: string;
  timestamp: string;
  severity: 'low' | 'medium' | 'high';
  status: 'resolved' | 'monitoring' | 'action_required';
}

export const SecurityPanel = () => {
  const securityEvents: SecurityEvent[] = [
    {
      id: "SEC_001",
      type: "identity_verification",
      description: "Identity verification completed successfully",
      timestamp: "5 mins ago",
      severity: "low",
      status: "resolved"
    },
    {
      id: "SEC_002", 
      type: "suspicious_activity",
      description: "Multiple rapid bids detected - Auto-flagged",
      timestamp: "12 mins ago",
      severity: "medium",
      status: "monitoring"
    },
    {
      id: "SEC_003",
      type: "login",
      description: "New device login from different location",
      timestamp: "1 hour ago",
      severity: "medium", 
      status: "resolved"
    },
    {
      id: "SEC_004",
      type: "token_purchase",
      description: "Large token purchase - Verification required",
      timestamp: "2 hours ago",
      severity: "high",
      status: "action_required"
    }
  ];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'text-terminal-green';
      case 'medium': return 'text-terminal-amber';
      case 'high': return 'text-terminal-red';
      default: return 'text-muted-foreground';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'resolved': return 'bg-terminal-green/20 text-terminal-green';
      case 'monitoring': return 'bg-terminal-amber/20 text-terminal-amber';
      case 'action_required': return 'bg-terminal-red/20 text-terminal-red';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const securityStats = {
    identityVerification: "✓ VERIFIED",
    twoFactorAuth: "✓ ENABLED", 
    antiSpoofing: "✓ ACTIVE",
    rateLimit: "✓ PROTECTED",
    fraudDetection: "✓ MONITORING"
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-terminal-green">Security & Verification</h3>
        <Badge variant="outline" className="text-terminal-green border-terminal-green">
          ✓ SECURE
        </Badge>
      </div>

      {/* Security Status */}
      <Card className="border-panel-border bg-secondary/20 p-3">
        <h4 className="text-sm font-medium text-foreground mb-3">Security Status</h4>
        <div className="space-y-2 text-xs">
          {Object.entries(securityStats).map(([key, value]) => (
            <div key={key} className="flex justify-between">
              <span className="text-muted-foreground capitalize">
                {key.replace(/([A-Z])/g, ' $1').trim()}:
              </span>
              <span className="text-terminal-green">{value}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Anonymity Protection */}
      <Card className="border-panel-border bg-secondary/20 p-3">
        <h4 className="text-sm font-medium text-foreground mb-3">Anonymity Protection</h4>
        <div className="space-y-2 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-terminal-green rounded-full animate-pulse-slow"></div>
            <span className="text-terminal-green">Anonymous ID: USER #4A7X</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-terminal-green rounded-full animate-pulse-slow"></div>
            <span className="text-terminal-green">IP Masking: ACTIVE</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-terminal-green rounded-full animate-pulse-slow"></div>
            <span className="text-terminal-green">Identity Escrow: ENABLED</span>
          </div>
        </div>
      </Card>

      {/* Recent Security Events */}
      <Card className="border-panel-border bg-secondary/20 p-3">
        <h4 className="text-sm font-medium text-foreground mb-3">Security Events</h4>
        <div className="space-y-2 max-h-32 overflow-y-auto">
          {securityEvents.map((event) => (
            <div key={event.id} className="p-2 border border-panel-border bg-background/50 rounded text-xs">
              <div className="flex items-center justify-between mb-1">
                <Badge className={getStatusColor(event.status)}>
                  {event.status.replace('_', ' ').toUpperCase()}
                </Badge>
                <span className={getSeverityColor(event.severity)}>
                  {event.severity.toUpperCase()}
                </span>
              </div>
              <div className="text-foreground mb-1">{event.description}</div>
              <div className="text-muted-foreground">{event.timestamp}</div>
            </div>
          ))}
        </div>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-2">
        <button className="bg-secondary hover:bg-accent px-2 py-1 text-xs transition-colors">
          Security Settings
        </button>
        <button className="bg-terminal-amber/20 hover:bg-terminal-amber/30 px-2 py-1 text-xs text-terminal-amber transition-colors">
          Report Issue
        </button>
      </div>
    </div>
  );
};