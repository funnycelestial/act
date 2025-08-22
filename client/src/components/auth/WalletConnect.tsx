import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { authService } from '@/lib/auth';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/use-toast';

interface WalletConnectProps {
  onSuccess?: () => void;
}

export const WalletConnect: React.FC<WalletConnectProps> = ({ onSuccess }) => {
  const { login, register } = useAuth();
  const [isConnecting, setIsConnecting] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [email, setEmail] = useState('');
  const [twoFactorToken, setTwoFactorToken] = useState('');
  const [showTwoFactor, setShowTwoFactor] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [step, setStep] = useState<'connect' | 'sign' | 'complete'>('connect');

  const availableWallets = authService.getAvailableWallets();

  const handleWalletConnect = async (providerName: string) => {
    setIsConnecting(true);
    try {
      const address = await authService.connectWallet(providerName);
      setWalletAddress(address);
      setStep('sign');
      
      toast({
        title: "Wallet Connected",
        description: `Connected to ${address.slice(0, 6)}...${address.slice(-4)}`,
      });
    } catch (error) {
      console.error('Wallet connection failed:', error);
      toast({
        title: "Connection Failed",
        description: error instanceof Error ? error.message : 'Failed to connect wallet',
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const handleSignAndAuth = async () => {
    if (!walletAddress) return;

    setIsConnecting(true);
    try {
      const message = authService.generateSignMessage(walletAddress);
      const signature = await authService.signMessage(message, walletAddress, 'metamask');

      if (isRegistering) {
        await register(walletAddress, signature, message, email || undefined);
        toast({
          title: "Registration Successful",
          description: "Welcome to the Anonymous Auction Platform!",
        });
      } else {
        try {
          await login(walletAddress, signature, message, twoFactorToken || undefined);
          toast({
            title: "Login Successful",
            description: "Welcome back to the platform!",
          });
        } catch (error: any) {
          if (error.message.includes('Two-factor authentication token required')) {
            setShowTwoFactor(true);
            return;
          }
          if (error.message.includes('User not found')) {
            setIsRegistering(true);
            return;
          }
          throw error;
        }
      }

      setStep('complete');
      onSuccess?.();
    } catch (error) {
      console.error('Authentication failed:', error);
      toast({
        title: "Authentication Failed",
        description: error instanceof Error ? error.message : 'Authentication failed',
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const handleTwoFactorSubmit = async () => {
    if (!twoFactorToken) {
      toast({
        title: "2FA Required",
        description: "Please enter your 2FA token",
        variant: "destructive",
      });
      return;
    }

    await handleSignAndAuth();
  };

  if (availableWallets.length === 0) {
    return (
      <Card className="border-panel-border bg-card/50">
        <CardHeader>
          <CardTitle className="text-terminal-red">No Wallet Detected</CardTitle>
          <CardDescription>
            Please install a Web3 wallet to continue
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              To use the Anonymous Auction Platform, you need a Web3 wallet:
            </p>
            <Button 
              onClick={() => window.open('https://metamask.io/download/', '_blank')}
              className="w-full"
            >
              Install MetaMask
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-panel-border bg-card/50">
      <CardHeader>
        <CardTitle className="text-terminal-green">
          {step === 'connect' && 'Connect Wallet'}
          {step === 'sign' && (isRegistering ? 'Create Account' : 'Sign In')}
          {step === 'complete' && 'Authentication Complete'}
        </CardTitle>
        <CardDescription>
          {step === 'connect' && 'Connect your Web3 wallet to access the platform'}
          {step === 'sign' && 'Sign the message to authenticate your wallet'}
          {step === 'complete' && 'Successfully authenticated!'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {step === 'connect' && (
          <div className="space-y-3">
            {availableWallets.map((wallet) => (
              <Button
                key={wallet.name}
                onClick={() => handleWalletConnect('metamask')}
                disabled={isConnecting}
                className="w-full justify-start gap-3"
                variant="outline"
              >
                <span className="text-lg">{wallet.icon}</span>
                <div className="text-left">
                  <div className="font-medium">{wallet.name}</div>
                  <div className="text-xs text-muted-foreground">
                    Connect with {wallet.name}
                  </div>
                </div>
                <Badge className="ml-auto bg-terminal-green/20 text-terminal-green">
                  Available
                </Badge>
              </Button>
            ))}
          </div>
        )}

        {step === 'sign' && (
          <div className="space-y-4">
            <div className="p-3 border border-panel-border bg-secondary/20 rounded">
              <div className="text-sm font-medium text-foreground mb-1">Connected Wallet</div>
              <div className="text-xs text-terminal-green font-mono">
                {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
              </div>
            </div>

            {isRegistering && (
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm">Email (Optional)</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-background border-panel-border"
                />
                <p className="text-xs text-muted-foreground">
                  Email is optional but recommended for account recovery and notifications
                </p>
              </div>
            )}

            {showTwoFactor && (
              <div className="space-y-2">
                <Label htmlFor="twoFactor" className="text-sm">Two-Factor Authentication</Label>
                <Input
                  id="twoFactor"
                  type="text"
                  placeholder="Enter 6-digit code"
                  value={twoFactorToken}
                  onChange={(e) => setTwoFactorToken(e.target.value)}
                  className="bg-background border-panel-border"
                  maxLength={6}
                />
              </div>
            )}

            <div className="space-y-2">
              {showTwoFactor ? (
                <Button
                  onClick={handleTwoFactorSubmit}
                  disabled={isConnecting || !twoFactorToken}
                  className="w-full"
                >
                  {isConnecting ? 'Verifying...' : 'Verify 2FA'}
                </Button>
              ) : (
                <Button
                  onClick={handleSignAndAuth}
                  disabled={isConnecting}
                  className="w-full"
                >
                  {isConnecting ? 'Signing...' : (isRegistering ? 'Sign & Register' : 'Sign & Login')}
                </Button>
              )}
              
              <Button
                onClick={() => setStep('connect')}
                variant="outline"
                className="w-full"
                disabled={isConnecting}
              >
                Back to Wallet Selection
              </Button>
            </div>

            <div className="text-xs text-muted-foreground space-y-1">
              <p>• Your wallet signature proves ownership without revealing private keys</p>
              <p>• No gas fees required for authentication</p>
              <p>• Your identity remains anonymous on the platform</p>
            </div>
          </div>
        )}

        {step === 'complete' && (
          <div className="text-center space-y-3">
            <div className="text-4xl">✅</div>
            <p className="text-sm text-terminal-green">
              Authentication successful! Redirecting to dashboard...
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};