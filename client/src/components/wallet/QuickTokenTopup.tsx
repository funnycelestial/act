import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { apiClient } from '@/lib/api';
import { toast } from '@/components/ui/use-toast';

export const QuickTokenTopup = () => {
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const paymentMethods = [
    { id: 'mtn_momo', name: 'MTN Mobile Money', fee: '1.5%', status: 'active' },
    { id: 'vodafone_cash', name: 'Vodafone Cash', fee: '1.8%', status: 'active' },
    { id: 'airteltigo', name: 'AirtelTigo Money', fee: '2.0%', status: 'offline' },
    { id: 'telecel_cash', name: 'Telecel Cash', fee: '1.7%', status: 'active' },
  ];

  const handleTopup = async () => {
    if (!amount || !paymentMethod || !phoneNumber) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const topupAmount = parseFloat(amount);
    if (topupAmount < 10) {
      toast({
        title: "Minimum Amount",
        description: "Minimum top-up amount is 10 $WKC",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    try {
      await apiClient.depositTokens(topupAmount, paymentMethod, phoneNumber);
      
      toast({
        title: "Top-up Initiated",
        description: `Depositing ${topupAmount} $WKC via ${paymentMethods.find(m => m.id === paymentMethod)?.name}`,
      });
      
      // Reset form
      setAmount('');
      setPhoneNumber('');
    } catch (error) {
      console.error('Top-up failed:', error);
      toast({
        title: "Top-up Failed",
        description: error instanceof Error ? error.message : "Failed to initiate top-up",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card className="border-panel-border bg-secondary/20 p-3">
      <h4 className="text-sm font-medium text-foreground mb-3">Quick $WKC Top-up</h4>
      
      <div className="space-y-3">
        <div>
          <Label htmlFor="amount" className="text-xs">Amount ($WKC)</Label>
          <Input
            id="amount"
            type="number"
            min="10"
            max="10000"
            placeholder="Enter amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="text-xs"
          />
          <div className="text-xs text-muted-foreground mt-1">
            Min: 10 $WKC • Max: 10,000 $WKC
          </div>
        </div>

        <div>
          <Label htmlFor="payment-method" className="text-xs">Payment Method</Label>
          <Select value={paymentMethod} onValueChange={setPaymentMethod}>
            <SelectTrigger className="text-xs">
              <SelectValue placeholder="Select payment method" />
            </SelectTrigger>
            <SelectContent>
              {paymentMethods.map((method) => (
                <SelectItem 
                  key={method.id} 
                  value={method.id}
                  disabled={method.status !== 'active'}
                >
                  <div className="flex items-center justify-between w-full">
                    <span>{method.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">{method.fee}</span>
                      <Badge 
                        className={`text-xs ${
                          method.status === 'active' 
                            ? 'bg-terminal-green/20 text-terminal-green' 
                            : 'bg-terminal-red/20 text-terminal-red'
                        }`}
                      >
                        {method.status.toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {paymentMethod && paymentMethod !== 'visa_card' && (
          <div>
            <Label htmlFor="phone" className="text-xs">Phone Number</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="0XX XXX XXXX"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="text-xs"
            />
          </div>
        )}

        <div className="p-2 border border-terminal-green/30 bg-terminal-green/10 rounded text-xs">
          <div className="flex justify-between">
            <span>Exchange Rate:</span>
            <span className="text-terminal-green">1 $WKC = 1.00 GH₵</span>
          </div>
          {amount && (
            <div className="flex justify-between mt-1">
              <span>You'll receive:</span>
              <span className="text-terminal-green">{amount} $WKC</span>
            </div>
          )}
        </div>

        <Button
          onClick={handleTopup}
          disabled={!amount || !paymentMethod || (!phoneNumber && paymentMethod !== 'visa_card') || isProcessing}
          className="w-full bg-terminal-green text-background hover:bg-terminal-green/80"
        >
          {isProcessing ? 'Processing...' : `Top-up ${amount || '0'} $WKC`}
        </Button>
      </div>
    </Card>
  );
};