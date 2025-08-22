import React from 'react';
import { WalletConnect } from './WalletConnect';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';

export const LoginPage: React.FC = () => {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-2xl font-bold text-terminal-green mb-2 font-terminal">
            █ ANONYMOUS AUCTION █
          </div>
          <div className="text-sm text-muted-foreground">
            Secure • Anonymous • Decentralized
          </div>
          <div className="text-xs text-terminal-amber mt-2">
            Powered by $WKC • WikiCat Cryptocurrency
          </div>
        </div>

        {/* Wallet Connection */}
        <WalletConnect />

        {/* Platform Features */}
        <div className="mt-8 space-y-3">
          <div className="text-center text-xs text-muted-foreground mb-4">
            Platform Features
          </div>
          
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="border border-panel-border bg-secondary/20 p-3 rounded">
              <div className="text-terminal-green mb-1">🔒 Anonymous</div>
              <div className="text-muted-foreground">Identity protection with pseudonymous bidding</div>
            </div>
            
            <div className="border border-panel-border bg-secondary/20 p-3 rounded">
              <div className="text-terminal-green mb-1">⚡ Real-time</div>
              <div className="text-muted-foreground">Live bidding with instant updates</div>
            </div>
            
            <div className="border border-panel-border bg-secondary/20 p-3 rounded">
              <div className="text-terminal-green mb-1">🛡️ Secure</div>
              <div className="text-muted-foreground">Smart contract escrow protection</div>
            </div>
            
            <div className="border border-panel-border bg-secondary/20 p-3 rounded">
              <div className="text-terminal-green mb-1">💎 $WKC</div>
              <div className="text-muted-foreground">WikiCat cryptocurrency integration</div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-xs text-muted-foreground">
          <p>By connecting your wallet, you agree to our Terms of Service</p>
          <p className="mt-1">All transactions use $WKC (WikiCat) cryptocurrency</p>
        </div>
      </div>
    </div>
  );
};