import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { apiClient } from '@/lib/api';
import { toast } from '@/components/ui/use-toast';

const CreateAuction = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    type: 'forward' as 'forward' | 'reverse',
    startingBid: '',
    reservePrice: '',
    buyNowPrice: '',
    duration: '86400000', // 24 hours in milliseconds
    condition: '',
    brand: '',
    model: '',
    shippingMethod: 'standard',
    shippingCost: '0',
  });

  const categories = [
    'electronics', 'fashion', 'home-garden', 'sports', 
    'automotive', 'books', 'art', 'collectibles', 'services', 'other'
  ];

  const conditions = ['new', 'like-new', 'good', 'fair', 'poor'];
  const shippingMethods = ['pickup', 'standard', 'express', 'digital'];

  const durationOptions = [
    { value: '3600000', label: '1 Hour' },
    { value: '21600000', label: '6 Hours' },
    { value: '43200000', label: '12 Hours' },
    { value: '86400000', label: '1 Day' },
    { value: '259200000', label: '3 Days' },
    { value: '604800000', label: '7 Days' },
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.description || !formData.category || !formData.startingBid || !formData.condition) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const auctionData = {
        ...formData,
        startingBid: parseFloat(formData.startingBid),
        reservePrice: formData.reservePrice ? parseFloat(formData.reservePrice) : 0,
        buyNowPrice: formData.buyNowPrice ? parseFloat(formData.buyNowPrice) : 0,
        duration: parseInt(formData.duration),
        shippingCost: parseFloat(formData.shippingCost),
      };

      const response = await apiClient.createAuction(auctionData);
      
      toast({
        title: "Auction Created",
        description: "Your auction has been submitted for approval",
      });
      
      navigate('/');
    } catch (error) {
      console.error('Failed to create auction:', error);
      toast({
        title: "Creation Failed",
        description: error instanceof Error ? error.message : "Failed to create auction",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 font-terminal">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-terminal-green">Create New Auction</h1>
            <p className="text-sm text-muted-foreground">List your item for anonymous bidding with $WKC</p>
          </div>
          <Button 
            onClick={() => navigate('/')} 
            variant="outline"
            className="border-panel-border"
          >
            ← Cancel
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Basic Information */}
            <Card className="border-panel-border bg-card/50 p-6">
              <h2 className="text-lg font-bold text-foreground mb-4">Basic Information</h2>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    placeholder="Enter auction title"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    maxLength={200}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe your item in detail"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    maxLength={2000}
                    rows={4}
                    required
                  />
                </div>

                <div>
                  <Label>Category *</Label>
                  <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Auction Type</Label>
                  <RadioGroup 
                    value={formData.type} 
                    onValueChange={(value) => handleInputChange('type', value)}
                    className="mt-2"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="forward" id="forward" />
                      <Label htmlFor="forward" className="text-sm">
                        Forward Auction (Bidders compete with higher bids)
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="reverse" id="reverse" />
                      <Label htmlFor="reverse" className="text-sm">
                        Reverse Auction (Service providers compete with lower quotes)
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>
            </Card>

            {/* Pricing & Timing */}
            <Card className="border-panel-border bg-card/50 p-6">
              <h2 className="text-lg font-bold text-foreground mb-4">Pricing & Timing</h2>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="startingBid">
                    {formData.type === 'reverse' ? 'Starting Budget ($WKC) *' : 'Starting Bid ($WKC) *'}
                  </Label>
                  <Input
                    id="startingBid"
                    type="number"
                    min="0.01"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.startingBid}
                    onChange={(e) => handleInputChange('startingBid', e.target.value)}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="reservePrice">Reserve Price ($WKC)</Label>
                  <Input
                    id="reservePrice"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00 (Optional)"
                    value={formData.reservePrice}
                    onChange={(e) => handleInputChange('reservePrice', e.target.value)}
                  />
                  <div className="text-xs text-muted-foreground mt-1">
                    Minimum price you'll accept
                  </div>
                </div>

                <div>
                  <Label htmlFor="buyNowPrice">Buy Now Price ($WKC)</Label>
                  <Input
                    id="buyNowPrice"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00 (Optional)"
                    value={formData.buyNowPrice}
                    onChange={(e) => handleInputChange('buyNowPrice', e.target.value)}
                  />
                  <div className="text-xs text-muted-foreground mt-1">
                    Price for instant purchase
                  </div>
                </div>

                <div>
                  <Label>Auction Duration</Label>
                  <Select value={formData.duration} onValueChange={(value) => handleInputChange('duration', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {durationOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </Card>

            {/* Item Details */}
            <Card className="border-panel-border bg-card/50 p-6">
              <h2 className="text-lg font-bold text-foreground mb-4">Item Details</h2>
              
              <div className="space-y-4">
                <div>
                  <Label>Condition *</Label>
                  <Select value={formData.condition} onValueChange={(value) => handleInputChange('condition', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select condition" />
                    </SelectTrigger>
                    <SelectContent>
                      {conditions.map((condition) => (
                        <SelectItem key={condition} value={condition}>
                          {condition.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="brand">Brand</Label>
                  <Input
                    id="brand"
                    placeholder="e.g., Apple, Samsung, Nike"
                    value={formData.brand}
                    onChange={(e) => handleInputChange('brand', e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="model">Model</Label>
                  <Input
                    id="model"
                    placeholder="e.g., iPhone 15 Pro, Galaxy S24"
                    value={formData.model}
                    onChange={(e) => handleInputChange('model', e.target.value)}
                  />
                </div>
              </div>
            </Card>

            {/* Shipping */}
            <Card className="border-panel-border bg-card/50 p-6">
              <h2 className="text-lg font-bold text-foreground mb-4">Shipping</h2>
              
              <div className="space-y-4">
                <div>
                  <Label>Shipping Method</Label>
                  <Select value={formData.shippingMethod} onValueChange={(value) => handleInputChange('shippingMethod', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {shippingMethods.map((method) => (
                        <SelectItem key={method} value={method}>
                          {method.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="shippingCost">Shipping Cost ($WKC)</Label>
                  <Input
                    id="shippingCost"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.shippingCost}
                    onChange={(e) => handleInputChange('shippingCost', e.target.value)}
                  />
                </div>
              </div>
            </Card>
          </div>

          {/* Submit */}
          <Card className="border-panel-border bg-card/50 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-foreground">Review & Submit</h3>
                <p className="text-sm text-muted-foreground">
                  Your auction will be reviewed before going live
                </p>
              </div>
              
              <div className="flex gap-3">
                <Button 
                  type="button"
                  onClick={() => navigate('/')}
                  variant="outline"
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-terminal-green text-background hover:bg-terminal-green/80"
                >
                  {isSubmitting ? 'Creating...' : 'Create Auction'}
                </Button>
              </div>
            </div>
          </Card>
        </form>
      </div>
    </div>
  );
};

export default CreateAuction;