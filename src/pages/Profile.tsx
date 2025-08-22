import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/lib/api';
import { toast } from '@/components/ui/use-toast';

const Profile = () => {
  const navigate = useNavigate();
  const { user, refreshProfile } = useAuth();
  const [isUpdating, setIsUpdating] = useState(false);
  const [profileData, setProfileData] = useState({
    email: '',
    privacy: {
      identityMasked: true,
      showActivity: false,
      allowDirectMessages: false,
    },
    preferences: {
      notifications: {
        email: true,
        push: true,
        bidUpdates: true,
        auctionEnd: true,
        escrowUpdates: true,
      },
      language: 'en',
      timezone: 'UTC',
    },
  });

  useEffect(() => {
    if (user) {
      setProfileData({
        email: user.email || '',
        privacy: user.privacy || profileData.privacy,
        preferences: user.preferences || profileData.preferences,
      });
    }
  }, [user]);

  const handleUpdateProfile = async () => {
    setIsUpdating(true);
    try {
      await apiClient.updateProfile(profileData);
      await refreshProfile();
      
      toast({
        title: "Profile Updated",
        description: "Your profile settings have been saved",
      });
    } catch (error) {
      console.error('Failed to update profile:', error);
      toast({
        title: "Update Failed",
        description: error instanceof Error ? error.message : "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="text-xl text-terminal-red">User not found</div>
          <Button onClick={() => navigate('/')}>Return to Dashboard</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 font-terminal">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-terminal-green">Profile Settings</h1>
            <p className="text-sm text-muted-foreground">Manage your account and privacy settings</p>
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
          {/* Profile Overview */}
          <div className="lg:col-span-1">
            <Card className="border-panel-border bg-card/50 p-6">
              <div className="text-center mb-6">
                <div className="w-20 h-20 border border-panel-border bg-secondary/20 flex items-center justify-center rounded-full mx-auto mb-4">
                  <span className="text-3xl">🎭</span>
                </div>
                <h2 className="text-lg font-bold text-foreground">{user.anonymousId}</h2>
                <p className="text-sm text-muted-foreground">Anonymous Bidder</p>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status:</span>
                  <Badge className={user.profile.isVerified ? 'bg-terminal-green/20 text-terminal-green' : 'bg-terminal-amber/20 text-terminal-amber'}>
                    {user.profile.isVerified ? 'VERIFIED' : 'UNVERIFIED'}
                  </Badge>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Reputation:</span>
                  <span className="text-terminal-green">
                    {'★'.repeat(Math.floor(user.profile.reputation))}{'☆'.repeat(5 - Math.floor(user.profile.reputation))} ({user.profile.reputation})
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Member Since:</span>
                  <span className="text-foreground">{new Date(user.profile.memberSince).toLocaleDateString()}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Auctions:</span>
                  <span className="text-foreground">{user.profile.totalAuctions}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Success Rate:</span>
                  <span className="text-terminal-green">{user.profile.successRate}%</span>
                </div>
              </div>
            </Card>
          </div>

          {/* Settings */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="account">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="account">Account</TabsTrigger>
                <TabsTrigger value="privacy">Privacy</TabsTrigger>
                <TabsTrigger value="notifications">Notifications</TabsTrigger>
                <TabsTrigger value="security">Security</TabsTrigger>
              </TabsList>

              <TabsContent value="account" className="mt-6">
                <Card className="border-panel-border bg-card/50 p-6">
                  <h3 className="text-lg font-bold text-foreground mb-4">Account Information</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="wallet">Wallet Address</Label>
                      <Input
                        id="wallet"
                        value={user.walletAddress}
                        disabled
                        className="font-mono text-xs"
                      />
                      <div className="text-xs text-muted-foreground mt-1">
                        Your wallet address cannot be changed
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="your@email.com"
                        value={profileData.email}
                        onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                      />
                      <div className="text-xs text-muted-foreground mt-1">
                        Used for important notifications and account recovery
                      </div>
                    </div>

                    <div>
                      <Label>Language</Label>
                      <select 
                        className="w-full mt-1 bg-background border border-panel-border px-3 py-2 rounded-md text-sm"
                        value={profileData.preferences.language}
                        onChange={(e) => setProfileData(prev => ({
                          ...prev,
                          preferences: { ...prev.preferences, language: e.target.value }
                        }))}
                      >
                        <option value="en">English</option>
                        <option value="es">Español</option>
                        <option value="fr">Français</option>
                        <option value="de">Deutsch</option>
                      </select>
                    </div>
                  </div>
                </Card>
              </TabsContent>

              <TabsContent value="privacy" className="mt-6">
                <Card className="border-panel-border bg-card/50 p-6">
                  <h3 className="text-lg font-bold text-foreground mb-4">Privacy Settings</h3>
                  
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Identity Masking</Label>
                        <div className="text-xs text-muted-foreground">
                          Hide your identity from other users
                        </div>
                      </div>
                      <Switch
                        checked={profileData.privacy.identityMasked}
                        onCheckedChange={(checked) => setProfileData(prev => ({
                          ...prev,
                          privacy: { ...prev.privacy, identityMasked: checked }
                        }))}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Show Activity</Label>
                        <div className="text-xs text-muted-foreground">
                          Allow others to see your bidding activity
                        </div>
                      </div>
                      <Switch
                        checked={profileData.privacy.showActivity}
                        onCheckedChange={(checked) => setProfileData(prev => ({
                          ...prev,
                          privacy: { ...prev.privacy, showActivity: checked }
                        }))}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Direct Messages</Label>
                        <div className="text-xs text-muted-foreground">
                          Allow other users to send you messages
                        </div>
                      </div>
                      <Switch
                        checked={profileData.privacy.allowDirectMessages}
                        onCheckedChange={(checked) => setProfileData(prev => ({
                          ...prev,
                          privacy: { ...prev.privacy, allowDirectMessages: checked }
                        }))}
                      />
                    </div>
                  </div>
                </Card>
              </TabsContent>

              <TabsContent value="notifications" className="mt-6">
                <Card className="border-panel-border bg-card/50 p-6">
                  <h3 className="text-lg font-bold text-foreground mb-4">Notification Preferences</h3>
                  
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Email Notifications</Label>
                        <div className="text-xs text-muted-foreground">
                          Receive notifications via email
                        </div>
                      </div>
                      <Switch
                        checked={profileData.preferences.notifications.email}
                        onCheckedChange={(checked) => setProfileData(prev => ({
                          ...prev,
                          preferences: {
                            ...prev.preferences,
                            notifications: { ...prev.preferences.notifications, email: checked }
                          }
                        }))}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Bid Updates</Label>
                        <div className="text-xs text-muted-foreground">
                          Get notified when you're outbid
                        </div>
                      </div>
                      <Switch
                        checked={profileData.preferences.notifications.bidUpdates}
                        onCheckedChange={(checked) => setProfileData(prev => ({
                          ...prev,
                          preferences: {
                            ...prev.preferences,
                            notifications: { ...prev.preferences.notifications, bidUpdates: checked }
                          }
                        }))}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Auction End Alerts</Label>
                        <div className="text-xs text-muted-foreground">
                          Get notified when auctions you're watching end
                        </div>
                      </div>
                      <Switch
                        checked={profileData.preferences.notifications.auctionEnd}
                        onCheckedChange={(checked) => setProfileData(prev => ({
                          ...prev,
                          preferences: {
                            ...prev.preferences,
                            notifications: { ...prev.preferences.notifications, auctionEnd: checked }
                          }
                        }))}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Escrow Updates</Label>
                        <div className="text-xs text-muted-foreground">
                          Get notified about escrow status changes
                        </div>
                      </div>
                      <Switch
                        checked={profileData.preferences.notifications.escrowUpdates}
                        onCheckedChange={(checked) => setProfileData(prev => ({
                          ...prev,
                          preferences: {
                            ...prev.preferences,
                            notifications: { ...prev.preferences.notifications, escrowUpdates: checked }
                          }
                        }))}
                      />
                    </div>
                  </div>
                </Card>
              </TabsContent>

              <TabsContent value="security" className="mt-6">
                <Card className="border-panel-border bg-card/50 p-6">
                  <h3 className="text-lg font-bold text-foreground mb-4">Security Settings</h3>
                  
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Two-Factor Authentication</Label>
                        <div className="text-xs text-muted-foreground">
                          Add extra security to your account
                        </div>
                      </div>
                      <Badge className={user.security.twoFactorEnabled ? 'bg-terminal-green/20 text-terminal-green' : 'bg-terminal-red/20 text-terminal-red'}>
                        {user.security.twoFactorEnabled ? 'ENABLED' : 'DISABLED'}
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Identity Verification</Label>
                        <div className="text-xs text-muted-foreground">
                          Verify your identity for higher limits
                        </div>
                      </div>
                      <Badge className={user.profile.isVerified ? 'bg-terminal-green/20 text-terminal-green' : 'bg-terminal-amber/20 text-terminal-amber'}>
                        {user.profile.isVerified ? 'VERIFIED' : 'PENDING'}
                      </Badge>
                    </div>

                    <div className="space-y-2">
                      <Label>Last Login</Label>
                      <div className="text-sm text-foreground">
                        {user.security.lastLogin ? new Date(user.security.lastLogin).toLocaleString() : 'Never'}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Button 
                        variant="outline"
                        className="w-full"
                        onClick={() => {/* Handle 2FA setup */}}
                      >
                        {user.security.twoFactorEnabled ? 'Disable 2FA' : 'Enable 2FA'}
                      </Button>
                      
                      {!user.profile.isVerified && (
                        <Button 
                          variant="outline"
                          className="w-full border-terminal-amber text-terminal-amber"
                          onClick={() => {/* Handle identity verification */}}
                        >
                          Start Identity Verification
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              </TabsContent>
            </Tabs>

            {/* Save Button */}
            <div className="mt-6 flex justify-end">
              <Button
                onClick={handleUpdateProfile}
                disabled={isUpdating}
                className="bg-terminal-green text-background hover:bg-terminal-green/80"
              >
                {isUpdating ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;