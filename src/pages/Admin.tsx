import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AdminDashboard } from '@/components/auction/AdminDashboard';
import { useAuth } from '@/contexts/AuthContext';

const Admin = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Check if user has admin privileges
  if (!user || !user.roles.includes('admin')) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="text-xl text-terminal-red">Access Denied</div>
          <p className="text-muted-foreground">You don't have admin privileges</p>
          <Button onClick={() => navigate('/')}>Return to Dashboard</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 font-terminal">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-terminal-green">Admin Dashboard</h1>
            <p className="text-sm text-muted-foreground">Platform administration and monitoring</p>
          </div>
          <div className="flex items-center gap-4">
            <Badge className="bg-terminal-amber/20 text-terminal-amber">
              ADMIN ACCESS
            </Badge>
            <Button 
              onClick={() => navigate('/')} 
              variant="outline"
              className="border-panel-border"
            >
              ← Back to Dashboard
            </Button>
          </div>
        </div>

        <AdminDashboard />
      </div>
    </div>
  );
};

export default Admin;