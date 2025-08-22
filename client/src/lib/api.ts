const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';

export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message: string;
  errors?: Array<{ field: string; message: string }>;
  meta?: {
    page: number;
    limit: number;
    total: number;
  };
}

export interface User {
  id: string;
  anonymousId: string;
  walletAddress: string;
  email?: string;
  roles: string[];
  profile: {
    reputation: number;
    totalAuctions: number;
    wonAuctions: number;
    successRate: number;
    memberSince: string;
    isVerified: boolean;
    verificationLevel: string;
  };
  privacy?: {
    identityMasked: boolean;
    showActivity: boolean;
    allowDirectMessages: boolean;
  };
  preferences?: {
    notifications: {
      email: boolean;
      push: boolean;
      bidUpdates: boolean;
      auctionEnd: boolean;
      escrowUpdates: boolean;
    };
    language: string;
    timezone: string;
  };
  status: string;
  security: {
    twoFactorEnabled: boolean;
    lastLogin: string;
  };
}

export interface Auction {
  _id: string;
  auctionId: string;
  title: string;
  description: string;
  category: string;
  type: 'forward' | 'reverse';
  seller: {
    userId: string;
    anonymousId: string;
  };
  pricing: {
    startingBid: number;
    currentBid: number;
    reservePrice: number;
    buyNowPrice: number;
    currency: string;
  };
  timing: {
    startTime: string;
    endTime: string;
    duration: number;
  };
  status: string;
  images: Array<{ url: string; alt: string; isPrimary: boolean }>;
  specifications: {
    condition: string;
    brand?: string;
    model?: string;
  };
  bidding: {
    totalBids: number;
    uniqueBidders: number;
    highestBidder?: {
      anonymousId: string;
    };
  };
  analytics: {
    views: number;
    watchersCount: number;
  };
  shipping?: {
    method: string;
    cost: number;
  };
  isWatching?: boolean;
  timeRemaining?: number;
}

export interface Bid {
  _id: string;
  bidId: string;
  auction: {
    _id: string;
    auctionId: string;
    title: string;
    status: string;
    timing: { endTime: string };
    pricing: { currentBid: number };
  };
  bidder: {
    anonymousId: string;
  };
  amount: number;
  status: string;
  timing: {
    placedAt: string;
  };
  blockchain: {
    transactionHash?: string;
    isOnChain: boolean;
  };
}

export interface TokenBalance {
  available: number;
  locked: number;
  total: number;
  blockchain: number;
}

export interface TokenTransaction {
  _id: string;
  transactionId: string;
  type: string;
  amount: number;
  status: string;
  blockchain: {
    transactionHash?: string;
    confirmations: number;
    isConfirmed: boolean;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  _id: string;
  notificationId: string;
  type: string;
  priority: string;
  title: string;
  message: string;
  data?: any;
  channels: {
    inApp: {
      read: boolean;
      readAt?: string;
    };
  };
  createdAt: string;
}

class ApiClient {
  private baseURL: string;
  private token: string | null = null;

  constructor() {
    this.baseURL = API_BASE_URL;
    this.token = localStorage.getItem('auth_token');
  }

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('auth_token', token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('auth_token');
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      (headers as Record<string, string>)['Authorization'] = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Request failed');
      }

      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Authentication
  async register(walletAddress: string, signature: string, message: string, email?: string) {
    return this.request<{ user: User; token: string; refreshToken: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ walletAddress, signature, message, email }),
    });
  }

  async login(walletAddress: string, signature: string, message: string, twoFactorToken?: string) {
    return this.request<{ user: User; token: string; refreshToken: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ walletAddress, signature, message, twoFactorToken }),
    });
  }

  async logout() {
    return this.request('/auth/logout', { method: 'POST' });
  }

  async getProfile() {
    return this.request<{ user: User }>('/auth/profile');
  }

  async updateProfile(updates: Partial<User>) {
    return this.request<{ user: User }>('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  // Auctions
  async getAuctions(params: {
    type?: string;
    status?: string;
    category?: string;
    page?: number;
    limit?: number;
    sort?: string;
  } = {}) {
    const queryString = new URLSearchParams(params as any).toString();
    return this.request<{ auctions: Auction[]; pagination: any }>(`/auctions?${queryString}`);
  }

  async getAuction(id: string) {
    return this.request<{ auction: Auction }>(`/auctions/${id}`);
  }

  async createAuction(auctionData: any) {
    return this.request<{ auction: Auction }>('/auctions', {
      method: 'POST',
      body: JSON.stringify(auctionData),
    });
  }

  async watchAuction(id: string) {
    return this.request(`/auctions/${id}/watch`, { method: 'POST' });
  }

  async unwatchAuction(id: string) {
    return this.request(`/auctions/${id}/watch`, { method: 'DELETE' });
  }

  // Bidding
  async placeBid(auctionId: string, amount: number, isAutoBid?: boolean, maxAmount?: number) {
    return this.request<{ bid: Bid }>(`/auctions/${auctionId}/bids`, {
      method: 'POST',
      body: JSON.stringify({ amount, isAutoBid, maxAmount }),
    });
  }

  async getAuctionBids(auctionId: string, page = 1, limit = 50) {
    return this.request<{ bids: Bid[]; pagination: any }>(`/auctions/${auctionId}/bids?page=${page}&limit=${limit}`);
  }

  async getMyBids(status?: string, page = 1, limit = 20) {
    const params = new URLSearchParams({ page: page.toString(), limit: limit.toString() });
    if (status) params.append('status', status);
    return this.request<{ bids: Bid[]; pagination: any }>(`/bids/my-bids?${params}`);
  }

  async withdrawBid(bidId: string) {
    return this.request(`/bids/${bidId}`, { method: 'DELETE' });
  }

  // Wallet
  async getWalletBalance() {
    return this.request<{ balance: TokenBalance; pendingTransactions: TokenTransaction[] }>('/wallet/balance');
  }

  async getWalletTransactions(type?: string, page = 1, limit = 50) {
    const params = new URLSearchParams({ page: page.toString(), limit: limit.toString() });
    if (type) params.append('type', type);
    return this.request<{ transactions: TokenTransaction[]; pagination: any }>(`/wallet/transactions?${params}`);
  }

  async depositTokens(amount: number, paymentMethod: string, phoneNumber?: string) {
    return this.request('/wallet/deposit', {
      method: 'POST',
      body: JSON.stringify({ amount, paymentMethod, phoneNumber }),
    });
  }

  async withdrawTokens(amount: number, paymentMethod: string, phoneNumber?: string) {
    return this.request('/wallet/withdraw', {
      method: 'POST',
      body: JSON.stringify({ amount, paymentMethod, phoneNumber }),
    });
  }

  async transferTokens(recipientAddress: string, amount: number, note?: string) {
    return this.request('/wallet/transfer', {
      method: 'POST',
      body: JSON.stringify({ recipientAddress, amount, note }),
    });
  }

  // Notifications
  async getNotifications(page = 1, limit = 50) {
    return this.request<{ notifications: Notification[]; unreadCount: number; pagination: any }>(`/notifications?page=${page}&limit=${limit}`);
  }

  async markNotificationRead(notificationId: string) {
    return this.request(`/notifications/${notificationId}/read`, { method: 'PUT' });
  }

  async markAllNotificationsRead() {
    return this.request('/notifications/read-all', { method: 'PUT' });
  }

  // Security
  async getSecurityStatus() {
    return this.request('/security/status');
  }

  async reportSecurityIssue(type: string, description: string, severity?: string) {
    return this.request('/security/report-issue', {
      method: 'POST',
      body: JSON.stringify({ type, description, severity }),
    });
  }

  // Payment Methods
  async getPaymentMethods() {
    return this.request('/payments/methods');
  }

  async processPayment(amount: number, paymentMethod: string, type: 'deposit' | 'withdrawal', phoneNumber?: string) {
    return this.request('/payments/process', {
      method: 'POST',
      body: JSON.stringify({ amount, paymentMethod, type, phoneNumber }),
    });
  }

  async getPaymentHistory(type?: string, page = 1, limit = 20) {
    const params = new URLSearchParams({ page: page.toString(), limit: limit.toString() });
    if (type) params.append('type', type);
    return this.request(`/payments/history?${params}`);
  }

  // Escrow operations
  async getEscrowTransactions(status?: string, role?: string, page = 1, limit = 20) {
    const params = new URLSearchParams({ page: page.toString(), limit: limit.toString() });
    if (status) params.append('status', status);
    if (role) params.append('role', role);
    return this.request(`/escrow/transactions?${params}`);
  }

  async getEscrowDetails(escrowId: string) {
    return this.request(`/escrow/${escrowId}`);
  }

  async confirmDelivery(escrowId: string, rating?: number, feedback?: string) {
    return this.request(`/escrow/${escrowId}/confirm-delivery`, {
      method: 'POST',
      body: JSON.stringify({ rating, feedback }),
    });
  }

  async markDelivered(escrowId: string, trackingNumber?: string, carrier?: string) {
    return this.request(`/escrow/${escrowId}/mark-delivered`, {
      method: 'POST',
      body: JSON.stringify({ trackingNumber, carrier }),
    });
  }

  async initiateDispute(escrowId: string, reason: string, evidence?: any[]) {
    return this.request(`/escrow/${escrowId}/dispute`, {
      method: 'POST',
      body: JSON.stringify({ reason, evidence }),
    });
  }

  // Disputes
  async getDisputes(status?: string, page = 1, limit = 20) {
    const params = new URLSearchParams({ page: page.toString(), limit: limit.toString() });
    if (status) params.append('status', status);
    return this.request(`/disputes?${params}`);
  }

  async getDisputeDetails(disputeId: string) {
    return this.request(`/disputes/${disputeId}`);
  }

  async respondToDispute(disputeId: string, message: string, evidence?: any[]) {
    return this.request(`/disputes/${disputeId}/respond`, {
      method: 'POST',
      body: JSON.stringify({ message, evidence }),
    });
  }

  // Admin endpoints
  async getAdminDashboard() {
    return this.request('/admin/dashboard');
  }

  async getPlatformStatistics(period = '7d') {
    return this.request(`/admin/statistics?period=${period}`);
  }

  async getPendingAuctions(page = 1, limit = 20) {
    return this.request(`/admin/auctions/pending?page=${page}&limit=${limit}`);
  }

  async approveAuction(auctionId: string, notes?: string) {
    return this.request(`/admin/auctions/${auctionId}/approve`, {
      method: 'POST',
      body: JSON.stringify({ notes }),
    });
  }

  async rejectAuction(auctionId: string, reason: string) {
    return this.request(`/admin/auctions/${auctionId}/reject`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  }

  async getUsers(params: any = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/admin/users?${queryString}`);
  }

  async updateUserStatus(userId: string, status: string, reason?: string) {
    return this.request(`/admin/users/${userId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status, reason }),
    });
  }

  async getSystemHealth() {
    return this.request('/admin/system/health');
  }
}

export const apiClient = new ApiClient();