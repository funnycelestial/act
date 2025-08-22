import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { useState, useEffect } from "react";
import { apiClient } from "@/lib/api";
import { toast } from "@/components/ui/use-toast";

export const AdminDashboard = () => {
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [pendingAuctions, setPendingAuctions] = useState<any[]>([]);
  const [systemHealth, setSystemHealth] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    try {
      setIsLoading(true);
      const [dashboardResponse, pendingResponse, healthResponse] = await Promise.all([
        apiClient.getAdminDashboard(),
        apiClient.getPendingAuctions(),
        apiClient.getSystemHealth()
      ]);
      
      setDashboardData(dashboardResponse.data);
      setPendingAuctions(pendingResponse.data.auctions);
      setSystemHealth(healthResponse.data);
    } catch (error) {
      console.error('Failed to load admin data:', error);
      toast({
        title: "Error",
        description: "Failed to load admin dashboard",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleApproveAuction = async (auctionId: string) => {
    try {
      await apiClient.approveAuction(auctionId);
      toast({
        title: "Auction Approved",
        description: "Auction has been approved and is now live",
      });
      loadAdminData();
    } catch (error) {
      console.error('Failed to approve auction:', error);
      toast({
        title: "Approval Failed",
        description: error instanceof Error ? error.message : "Failed to approve auction",
        variant: "destructive",
      });
    }
  };

  const handleRejectAuction = async (auctionId: string, reason: string) => {
    try {
      await apiClient.rejectAuction(auctionId, reason);
      toast({
        title: "Auction Rejected",
        description: "Auction has been rejected",
      });
      loadAdminData();
    } catch (error) {
      console.error('Failed to reject auction:', error);
      toast({
        title: "Rejection Failed",
        description: error instanceof Error ? error.message : "Failed to reject auction",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="text-muted-foreground">Loading admin dashboard...</div>
      </div>
    );
  }

  return (
    <Tabs defaultValue="overview" className="space-y-4">
      <TabsList className="grid w-full grid-cols-5">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="auctions">Auctions</TabsTrigger>
        <TabsTrigger value="users">Users</TabsTrigger>
        <TabsTrigger value="system">System</TabsTrigger>
        <TabsTrigger value="reports">Reports</TabsTrigger>
      </TabsList>

      <TabsContent value="overview" className="space-y-4">
      {/* System Overview */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="border-panel-border bg-secondary/20 p-3">
          <h4 className="text-sm font-medium text-foreground mb-3">System Health</h4>
          <div className="space-y-2 text-xs">
            {systemHealth && Object.entries(systemHealth.services).map(([service, status]) => (
              <div key={service} className="flex justify-between">
                <span className="text-muted-foreground capitalize">{service.replace(/([A-Z])/g, ' $1')}:</span>
                <span className={status === 'healthy' || status === 'connected' || status === 'active' || status === 'operational' || status === 'available' ? 'text-terminal-green' : 'text-terminal-red'}>
                  {(status as string).toUpperCase()}
                </span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="border-panel-border bg-secondary/20 p-3">
          <h4 className="text-sm font-medium text-foreground mb-3">Platform Stats</h4>
          <div className="space-y-2 text-xs">
            {dashboardData && (
              <>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Users:</span>
                  <span className="text-foreground">{dashboardData.overview.totalUsers.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Active (24h):</span>
                  <span className="text-terminal-green">{dashboardData.overview.activeUsers24h.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Auctions:</span>
                  <span className="text-foreground">{dashboardData.overview.totalAuctions.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Active Auctions:</span>
                  <span className="text-terminal-green">{dashboardData.overview.activeAuctions.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Platform Revenue:</span>
                  <span className="text-terminal-green">{dashboardData.tokenEconomy.platformRevenue.toLocaleString()} $WKC</span>
                </div>
              </>
            )}
          </div>
        </Card>
      </div>

      {/* Token Management */}
      <Card className="border-panel-border bg-secondary/20 p-3">
        <h4 className="text-sm font-medium text-foreground mb-3">$WKC Token Economy</h4>
        <div className="space-y-3">
          {dashboardData && (
            <div className="grid grid-cols-3 gap-4 text-xs">
              <div>
                <span className="text-muted-foreground">Total Tokens Issued:</span>
                <div className="text-lg font-bold text-terminal-green">
                  {(dashboardData.tokenEconomy.totalTokensIssued / 1000000).toFixed(1)}M $WKC
                </div>
              </div>
              <div>
                <span className="text-muted-foreground">Tokens Burned:</span>
                <div className="text-lg font-bold text-terminal-amber">
                  {(dashboardData.tokenEconomy.totalTokensBurned / 1000000).toFixed(1)}M $WKC
                </div>
              </div>
              <div>
                <span className="text-muted-foreground">Fees Collected:</span>
                <div className="text-lg font-bold text-terminal-red">
                  {(dashboardData.tokenEconomy.totalFeesCollected / 1000).toFixed(1)}K $WKC
                </div>
              </div>
            </div>
          )}
          
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span>Burn Rate</span>
              <span>{dashboardData?.tokenEconomy.burnRate || 0}%</span>
            </div>
            <Progress value={parseFloat(dashboardData?.tokenEconomy.burnRate || 0)} className="h-2" />
          </div>
        </div>
      </Card>
      </TabsContent>

      <TabsContent value="auctions" className="space-y-4">
      {/* Auction Management */}
      <Card className="border-panel-border bg-secondary/20 p-3">
        <h4 className="text-sm font-medium text-foreground mb-3">Auction Management</h4>
        <div className="space-y-3">
              <h5 className="text-xs text-terminal-green mb-2">Pending Approvals</h5>
              <div className="space-y-1">
                {pendingAuctions.map((auction) => (
                  <div key={auction._id} className="flex justify-between items-center text-xs p-2 border border-panel-border/50 rounded">
                    <div>
                      <div className="text-foreground">{auction.title}</div>
                      <div className="text-muted-foreground">by {auction.seller.anonymousId}</div>
                      <div className="text-terminal-green">{auction.pricing.startingBid} $WKC</div>
                    </div>
                    <div className="flex gap-1">
                      <Button 
                        size="sm"
                        className="bg-terminal-green px-2 py-1 text-xs text-background hover:bg-terminal-green/80"
                        onClick={() => handleApproveAuction(auction._id)}
                      >
                        ✓
                      </Button>
                      <Button 
                        size="sm"
                        className="bg-terminal-red px-2 py-1 text-xs text-background hover:bg-terminal-red/80"
                        onClick={() => handleRejectAuction(auction._id, 'Does not meet platform guidelines')}
                      >
                        ✗
                      </Button>
                    </div>
                  </div>
                ))}
                {pendingAuctions.length === 0 && (
                  <div className="text-center py-4 text-xs text-muted-foreground">
                    No pending approvals
                  </div>
                )}
              </div>
        </div>
      </Card>
      </TabsContent>

      <TabsContent value="users" className="space-y-4">
        <Card className="border-panel-border bg-secondary/20 p-3">
          <h4 className="text-sm font-medium text-foreground mb-3">User Management</h4>
          <div className="space-y-3">
              <h5 className="text-xs text-terminal-green mb-2">Flagged Activities</h5>
              <div className="space-y-1">
                {[
                  { type: "Suspicious Bidding", user: "USER_999", severity: "high", timestamp: "5m ago" },
                  { type: "Multiple Accounts", user: "USER_888", severity: "medium", timestamp: "1h ago" },
                  { type: "Payment Issue", user: "USER_777", severity: "low", timestamp: "2h ago" }
                ].map((flag, i) => (
                  <div key={i} className="flex justify-between items-center text-xs p-2 border border-panel-border/50 rounded">
                    <div>
                      <div className="text-foreground">{flag.type}</div>
                      <div className="text-muted-foreground">{flag.user}</div>
                      <div className="text-muted-foreground">{flag.timestamp}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={`text-xs ${
                        flag.severity === 'high' ? 'bg-terminal-red/20 text-terminal-red' :
                        flag.severity === 'medium' ? 'bg-terminal-amber/20 text-terminal-amber' :
                        'bg-terminal-green/20 text-terminal-green'
                      }`}>
                        {flag.severity.toUpperCase()}
                      </Badge>
                      <Button size="sm" variant="outline" className="text-xs px-2 py-1">
                        Review
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
        </div>
      </Card>
      </TabsContent>

      <TabsContent value="system" className="space-y-4">
        {systemHealth && (
          <Card className="border-panel-border bg-secondary/20 p-3">
            <h4 className="text-sm font-medium text-foreground mb-3">System Status</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Overall Health:</span>
                <Badge className={systemHealth.overallHealth === 'healthy' ? 'bg-terminal-green/20 text-terminal-green' : 'bg-terminal-red/20 text-terminal-red'}>
                  {systemHealth.overallHealth.toUpperCase()}
                </Badge>
              </div>
              
              <div className="text-xs space-y-1">
                <div className="flex justify-between">
                  <span>Uptime:</span>
                  <span className="text-terminal-green">{Math.floor(systemHealth.uptime / 3600)}h {Math.floor((systemHealth.uptime % 3600) / 60)}m</span>
                </div>
                <div className="flex justify-between">
                  <span>Last Check:</span>
                  <span>{new Date(systemHealth.timestamp).toLocaleTimeString()}</span>
                </div>
              </div>
            </div>
          </Card>
        )}
      <TabsContent value="reports" className="space-y-4">
        <Card className="border-panel-border bg-secondary/20 p-3">
          <h4 className="text-sm font-medium text-foreground mb-3">Platform Reports</h4>
          <div className="text-center py-8 text-muted-foreground">
            Reports functionality coming soon
          </div>
        </Card>
      </TabsContent>
      </TabsContent>
      {/* Quick Actions */}
      <div className="grid grid-cols-4 gap-2">
        <Button className="bg-terminal-green px-3 py-2 text-xs text-background hover:bg-terminal-green/80">
          Refresh Data
        </Button>
        <Button className="bg-terminal-amber px-3 py-2 text-xs text-background hover:bg-terminal-amber/80">
          Freeze Account
        </Button>
        <Button className="bg-terminal-red px-3 py-2 text-xs text-background hover:bg-terminal-red/80">
          Emergency Stop
        </Button>
        <Button className="bg-secondary hover:bg-accent px-3 py-2 text-xs">
          Export Data
        </Button>
      </div>
    </Tabs>
  );
};