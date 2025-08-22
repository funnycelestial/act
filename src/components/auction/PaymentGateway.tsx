import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useEffect } from "react";
import { apiClient } from "@/lib/api";
import { toast } from "@/components/ui/use-toast";

interface PaymentGatewayProps {
  type?: 'deposit' | 'withdrawal';
  onSuccess?: () => void;
}

export const PaymentGateway = ({ type = 'deposit', onSuccess }: PaymentGatewayProps) => {
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);
  const [amount, setAmount] = useState('');
  const [selectedMethod, setSelectedMethod] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadPaymentData();
  }, []);

  const loadPaymentData = async () => {
    try {
      setIsLoading(true);
      const [methodsResponse, historyResponse] = await Promise.all([
        apiClient.getPaymentMethods(),
        apiClient.getPaymentHistory(type)
      ]);
      
      setPaymentMethods(methodsResponse.data.paymentMethods);
      setRecentTransactions(historyResponse.data.transactions);
    } catch (error) {
      console.error('Failed to load payment data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePayment = async () => {
    if (!amount || !selectedMethod) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const paymentAmount = parseFloat(amount);
    if (paymentAmount < 10) {
      toast({
        title: "Minimum Amount",
        description: `Minimum ${type} amount is 10 $WKC`,
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    try {
      await apiClient.processPayment(paymentAmount, selectedMethod, type, phoneNumber);
      
      toast({
        title: `${type === 'deposit' ? 'Deposit' : 'Withdrawal'} Initiated`,
        description: `Processing ${paymentAmount} $WKC via ${paymentMethods.find(m => m.id === selectedMethod)?.name}`,
      });
      
      // Reset form
      setAmount('');
      setPhoneNumber('');
      
      // Refresh data
      loadPaymentData();
      onSuccess?.();
    } catch (error) {
      console.error(`${type} failed:`, error);
      toast({
        title: `${type === 'deposit' ? 'Deposit' : 'Withdrawal'} Failed`,
        description: error instanceof Error ? error.message : `Failed to process ${type}`,
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

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

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="text-muted-foreground">Loading payment methods...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-terminal-green">
          {type === 'deposit' ? 'Deposit $WKC' : 'Withdraw $WKC'}
        </h3>
        <Badge variant="outline" className="text-terminal-green border-terminal-green">
          {paymentMethods.filter(m => m.status === 'active').length} Methods
        </Badge>
      </div>

      {/* Payment Form */}
      <Card className="border-panel-border bg-secondary/20 p-4">
        <h4 className="text-sm font-medium text-foreground mb-3">
          {type === 'deposit' ? 'Add $WKC to Wallet' : 'Cash Out $WKC'}
        </h4>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="amount">Amount ($WKC)</Label>
            <Input
              id="amount"
              type="number"
              min="10"
              max={type === 'deposit' ? "50000" : undefined}
              placeholder="Enter amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>

          <div>
            <Label>Payment Method</Label>
            <Select value={selectedMethod} onValueChange={setSelectedMethod}>
              <SelectTrigger>
                <SelectValue placeholder="Select payment method" />
              </SelectTrigger>
              <SelectContent>
                {paymentMethods.filter(m => m.status === 'active').map((method) => (
                  <SelectItem key={method.id} value={method.id}>
                    <div className="flex items-center justify-between w-full">
                      <span>{method.name}</span>
                      <span className="text-xs text-muted-foreground ml-2">
                        {method.fees.percentage}% fee
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedMethod && selectedMethod !== 'visa_mastercard' && (
            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="0XX XXX XXXX"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
              />
            </div>
          )}

          <Button
            onClick={handlePayment}
            disabled={!amount || !selectedMethod || isProcessing}
            className="w-full bg-terminal-green text-background hover:bg-terminal-green/80"
          >
            {isProcessing ? 'Processing...' : `${type === 'deposit' ? 'Deposit' : 'Withdraw'} ${amount || '0'} $WKC`}
          </Button>
        </div>
      </Card>

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
                <span className="text-muted-foreground">{method.fees.percentage}%</span>
                <span className="text-muted-foreground">{method.processingTime}</span>
                <span className={getStatusColor(method.status)}>
                  {method.status.toUpperCase()}
                </span>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-4 p-3 border border-terminal-green/30 bg-terminal-green/10 rounded">
          <h5 className="text-sm text-terminal-green mb-2">$WKC Exchange Rate</h5>
          <div className="text-xs space-y-1">
            <div className="flex justify-between">
              <span>1 WikiCat Token ($WKC)</span>
              <span className="text-terminal-green">= 1.00 GH₵</span>
            </div>
            <div className="flex justify-between">
              <span>Minimum Purchase</span>
              <span>10 $WKC (GH₵ 10)</span>
            </div>
            <div className="flex justify-between">
              <span>Maximum Purchase</span>
              <span>50,000 $WKC (GH₵ 50,000)</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Recent Transactions */}
      <Card className="border-panel-border bg-secondary/20 p-3">
        <h4 className="text-sm font-medium text-foreground mb-3">Recent Transactions</h4>
        <div className="space-y-2">
          {recentTransactions.map((txn) => (
            <div key={txn._id} className="flex items-center justify-between p-2 border border-panel-border bg-background/50 rounded text-xs">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className={`${txn.type === 'deposit' ? 'text-terminal-green' : 'text-terminal-amber'}`}>
                    {txn.type.toUpperCase()}
                  </span>
                  <span className="text-muted-foreground">
                    {new Date(txn.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-foreground">{Math.abs(txn.amount).toLocaleString()} $WKC</div>
                <div className={getStatusColor(txn.status)}>
                  {txn.status.toUpperCase()}
                </div>
              </div>
            </div>
          ))}
          {recentTransactions.length === 0 && (
            <div className="text-center py-4 text-xs text-muted-foreground">
              No recent transactions
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};