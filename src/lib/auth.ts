import { apiClient } from './api';

export interface User {
  id: string;
  anonymousId: string;
  walletAddress: string;
  email?: string;
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
  roles: string[];
  security: {
    twoFactorEnabled: boolean;
    lastLogin: string;
  };
}

declare global {
  interface Window {
    ethereum?: any;
  }
}

export interface WalletProvider {
  name: string;
  icon: string;
  connect: () => Promise<string>;
  signMessage: (message: string, address: string) => Promise<string>;
  isInstalled: () => boolean;
}

class AuthService {
  private user: User | null = null;
  private listeners: ((user: User | null) => void)[] = [];

  constructor() {
    this.loadUserFromStorage();
  }

  private loadUserFromStorage() {
    const userData = localStorage.getItem('user_data');
    if (userData) {
      try {
        this.user = JSON.parse(userData);
      } catch (error) {
        console.error('Error parsing user data from storage:', error);
        localStorage.removeItem('user_data');
      }
    }
  }

  private saveUserToStorage(user: User) {
    localStorage.setItem('user_data', JSON.stringify(user));
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener(this.user));
  }

  onAuthChange(listener: (user: User | null) => void) {
    this.listeners.push(listener);
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  getCurrentUser(): User | null {
    return this.user;
  }

  isAuthenticated(): boolean {
    return !!this.user && !!localStorage.getItem('auth_token');
  }

  async connectWallet(providerName: string): Promise<string> {
    const provider = this.getWalletProvider(providerName);
    if (!provider.isInstalled()) {
      throw new Error(`${provider.name} is not installed`);
    }

    return await provider.connect();
  }

  async signMessage(message: string, walletAddress: string, providerName: string): Promise<string> {
    const provider = this.getWalletProvider(providerName);
    return await provider.signMessage(message, walletAddress);
  }

  async register(walletAddress: string, signature: string, message: string, email?: string) {
    try {
      const response = await apiClient.register(walletAddress, signature, message, email);
      
      this.user = response.data.user;
      apiClient.setToken(response.data.token);
      this.saveUserToStorage(this.user);
      this.notifyListeners();

      return response;
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  }

  async login(walletAddress: string, signature: string, message: string, twoFactorToken?: string) {
    try {
      const response = await apiClient.login(walletAddress, signature, message, twoFactorToken);
      
      this.user = response.data.user;
      apiClient.setToken(response.data.token);
      this.saveUserToStorage(this.user);
      this.notifyListeners();

      return response;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  }

  async logout() {
    try {
      await apiClient.logout();
    } catch (error) {
      console.error('Logout API call failed:', error);
    } finally {
      this.user = null;
      apiClient.clearToken();
      localStorage.removeItem('user_data');
      this.notifyListeners();
    }
  }

  async refreshProfile() {
    if (!this.isAuthenticated()) return;

    try {
      const response = await apiClient.getProfile();
      this.user = response.data.user;
      this.saveUserToStorage(this.user);
      this.notifyListeners();
    } catch (error) {
      console.error('Failed to refresh profile:', error);
      // If token is invalid, logout
      if (error instanceof Error && error.message.includes('401')) {
        this.logout();
      }
    }
  }

  private getWalletProvider(name: string): WalletProvider {
    switch (name) {
      case 'metamask':
        return {
          name: 'MetaMask',
          icon: '🦊',
          isInstalled: () => !!window.ethereum?.isMetaMask,
          connect: async () => {
            if (!window.ethereum) {
              throw new Error('MetaMask not found');
            }
            
            const accounts = await window.ethereum.request({
              method: 'eth_requestAccounts'
            });
            
            if (!accounts || accounts.length === 0) {
              throw new Error('No accounts found');
            }
            
            return accounts[0];
          },
          signMessage: async (message: string, address: string) => {
            if (!window.ethereum) {
              throw new Error('MetaMask not found');
            }
            
            return await window.ethereum.request({
              method: 'personal_sign',
              params: [message, address]
            });
          }
        };
      
      default:
        throw new Error(`Unsupported wallet provider: ${name}`);
    }
  }

  getAvailableWallets(): WalletProvider[] {
    return [
      this.getWalletProvider('metamask')
    ].filter(provider => provider.isInstalled());
  }

  generateSignMessage(walletAddress: string): string {
    const timestamp = Date.now();
    return `Welcome to Anonymous Auction Platform!\n\nSign this message to authenticate your wallet.\n\nWallet: ${walletAddress}\nTimestamp: ${timestamp}\n\nThis request will not trigger a blockchain transaction or cost any gas fees.`;
  }
}

export const authService = new AuthService();