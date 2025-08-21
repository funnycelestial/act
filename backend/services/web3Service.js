const { ethers } = require('ethers');
const logger = require('../utils/logger');

class Web3Service {
  constructor() {
    this.provider = null;
    this.wallet = null;
    this.contracts = {};
    this.initialize();
  }

  async initialize() {
    try {
      // Initialize provider
      this.provider = new ethers.JsonRpcProvider(process.env.BLOCKCHAIN_RPC_URL);
      
      // Initialize wallet
      if (process.env.PRIVATE_KEY) {
        this.wallet = new ethers.Wallet(process.env.PRIVATE_KEY, this.provider);
        logger.info('Web3 wallet initialized');
      }

      // Initialize contracts
      await this.initializeContracts();
      
      logger.info('Web3Service initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize Web3Service:', error);
      throw error;
    }
  }

  async initializeContracts() {
    try {
      // WKC Token Contract ABI (simplified)
      const wkcTokenABI = [
        "function balanceOf(address owner) view returns (uint256)",
        "function transfer(address to, uint256 amount) returns (bool)",
        "function transferFrom(address from, address to, uint256 amount) returns (bool)",
        "function approve(address spender, uint256 amount) returns (bool)",
        "function allowance(address owner, address spender) view returns (uint256)",
        "function totalSupply() view returns (uint256)",
        "function decimals() view returns (uint8)",
        "function symbol() view returns (string)",
        "function name() view returns (string)",
        "event Transfer(address indexed from, address indexed to, uint256 value)",
        "event Approval(address indexed owner, address indexed spender, uint256 value)"
      ];

      // Auction Contract ABI (simplified)
      const auctionContractABI = [
        "function createAuction(string memory title, uint256 startingBid, uint256 duration, uint256 reservePrice) returns (uint256)",
        "function placeBid(uint256 auctionId, uint256 bidAmount) payable",
        "function endAuction(uint256 auctionId)",
        "function getAuction(uint256 auctionId) view returns (tuple(address seller, uint256 startingBid, uint256 currentBid, uint256 endTime, bool active))",
        "function withdrawBid(uint256 auctionId)",
        "event AuctionCreated(uint256 indexed auctionId, address indexed seller, uint256 startingBid)",
        "event BidPlaced(uint256 indexed auctionId, address indexed bidder, uint256 amount)",
        "event AuctionEnded(uint256 indexed auctionId, address indexed winner, uint256 winningBid)"
      ];

      // Escrow Contract ABI (simplified)
      const escrowContractABI = [
        "function createEscrow(uint256 auctionId, address buyer, address seller, uint256 amount) returns (uint256)",
        "function fundEscrow(uint256 escrowId) payable",
        "function confirmDelivery(uint256 escrowId)",
        "function releaseEscrow(uint256 escrowId)",
        "function disputeEscrow(uint256 escrowId, string memory reason)",
        "function resolveDispute(uint256 escrowId, bool releaseToBuyer)",
        "function getEscrow(uint256 escrowId) view returns (tuple(address buyer, address seller, uint256 amount, uint8 status))",
        "event EscrowCreated(uint256 indexed escrowId, address indexed buyer, address indexed seller, uint256 amount)",
        "event EscrowFunded(uint256 indexed escrowId)",
        "event DeliveryConfirmed(uint256 indexed escrowId)",
        "event EscrowReleased(uint256 indexed escrowId, address indexed recipient)",
        "event DisputeCreated(uint256 indexed escrowId, string reason)"
      ];

      // Initialize contract instances
      if (process.env.WKC_CONTRACT_ADDRESS) {
        this.contracts.wkcToken = new ethers.Contract(
          process.env.WKC_CONTRACT_ADDRESS,
          wkcTokenABI,
          this.wallet || this.provider
        );
      }

      if (process.env.AUCTION_CONTRACT_ADDRESS) {
        this.contracts.auction = new ethers.Contract(
          process.env.AUCTION_CONTRACT_ADDRESS,
          auctionContractABI,
          this.wallet || this.provider
        );
      }

      if (process.env.ESCROW_CONTRACT_ADDRESS) {
        this.contracts.escrow = new ethers.Contract(
          process.env.ESCROW_CONTRACT_ADDRESS,
          escrowContractABI,
          this.wallet || this.provider
        );
      }

      logger.info('Smart contracts initialized');
    } catch (error) {
      logger.error('Failed to initialize contracts:', error);
      throw error;
    }
  }

  // Token operations
  async getTokenBalance(walletAddress) {
    try {
      const balance = await this.contracts.wkcToken.balanceOf(walletAddress);
      const decimals = await this.contracts.wkcToken.decimals();
      return ethers.formatUnits(balance, decimals);
    } catch (error) {
      logger.error('Error getting token balance:', error);
      throw error;
    }
  }

  async transferTokens(toAddress, amount) {
    try {
      const decimals = await this.contracts.wkcToken.decimals();
      const amountInWei = ethers.parseUnits(amount.toString(), decimals);
      
      const tx = await this.contracts.wkcToken.transfer(toAddress, amountInWei, {
        gasLimit: process.env.GAS_LIMIT || 100000,
        gasPrice: process.env.GAS_PRICE || ethers.parseUnits('20', 'gwei')
      });
      
      const receipt = await tx.wait();
      return {
        transactionHash: receipt.hash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString()
      };
    } catch (error) {
      logger.error('Error transferring tokens:', error);
      throw error;
    }
  }

  async approveTokenSpending(spenderAddress, amount) {
    try {
      const decimals = await this.contracts.wkcToken.decimals();
      const amountInWei = ethers.parseUnits(amount.toString(), decimals);
      
      const tx = await this.contracts.wkcToken.approve(spenderAddress, amountInWei, {
        gasLimit: process.env.GAS_LIMIT || 100000,
        gasPrice: process.env.GAS_PRICE || ethers.parseUnits('20', 'gwei')
      });
      
      const receipt = await tx.wait();
      return {
        transactionHash: receipt.hash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString()
      };
    } catch (error) {
      logger.error('Error approving token spending:', error);
      throw error;
    }
  }

  // Auction operations
  async createAuctionOnChain(title, startingBid, duration, reservePrice = 0) {
    try {
      const decimals = await this.contracts.wkcToken.decimals();
      const startingBidInWei = ethers.parseUnits(startingBid.toString(), decimals);
      const reservePriceInWei = ethers.parseUnits(reservePrice.toString(), decimals);
      
      const tx = await this.contracts.auction.createAuction(
        title,
        startingBidInWei,
        duration,
        reservePriceInWei,
        {
          gasLimit: process.env.GAS_LIMIT || 200000,
          gasPrice: process.env.GAS_PRICE || ethers.parseUnits('20', 'gwei')
        }
      );
      
      const receipt = await tx.wait();
      
      // Extract auction ID from events
      const auctionCreatedEvent = receipt.logs.find(
        log => log.topics[0] === ethers.id('AuctionCreated(uint256,address,uint256)')
      );
      
      let auctionId = null;
      if (auctionCreatedEvent) {
        const decodedEvent = this.contracts.auction.interface.parseLog(auctionCreatedEvent);
        auctionId = decodedEvent.args.auctionId.toString();
      }
      
      return {
        transactionHash: receipt.hash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString(),
        auctionId
      };
    } catch (error) {
      logger.error('Error creating auction on chain:', error);
      throw error;
    }
  }

  async placeBidOnChain(auctionId, bidAmount) {
    try {
      const decimals = await this.contracts.wkcToken.decimals();
      const bidAmountInWei = ethers.parseUnits(bidAmount.toString(), decimals);
      
      const tx = await this.contracts.auction.placeBid(auctionId, bidAmountInWei, {
        gasLimit: process.env.GAS_LIMIT || 150000,
        gasPrice: process.env.GAS_PRICE || ethers.parseUnits('20', 'gwei')
      });
      
      const receipt = await tx.wait();
      return {
        transactionHash: receipt.hash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString()
      };
    } catch (error) {
      logger.error('Error placing bid on chain:', error);
      throw error;
    }
  }

  async endAuctionOnChain(auctionId) {
    try {
      const tx = await this.contracts.auction.endAuction(auctionId, {
        gasLimit: process.env.GAS_LIMIT || 150000,
        gasPrice: process.env.GAS_PRICE || ethers.parseUnits('20', 'gwei')
      });
      
      const receipt = await tx.wait();
      return {
        transactionHash: receipt.hash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString()
      };
    } catch (error) {
      logger.error('Error ending auction on chain:', error);
      throw error;
    }
  }

  // Escrow operations
  async createEscrowOnChain(auctionId, buyerAddress, sellerAddress, amount) {
    try {
      const decimals = await this.contracts.wkcToken.decimals();
      const amountInWei = ethers.parseUnits(amount.toString(), decimals);
      
      const tx = await this.contracts.escrow.createEscrow(
        auctionId,
        buyerAddress,
        sellerAddress,
        amountInWei,
        {
          gasLimit: process.env.GAS_LIMIT || 200000,
          gasPrice: process.env.GAS_PRICE || ethers.parseUnits('20', 'gwei')
        }
      );
      
      const receipt = await tx.wait();
      
      // Extract escrow ID from events
      const escrowCreatedEvent = receipt.logs.find(
        log => log.topics[0] === ethers.id('EscrowCreated(uint256,address,address,uint256)')
      );
      
      let escrowId = null;
      if (escrowCreatedEvent) {
        const decodedEvent = this.contracts.escrow.interface.parseLog(escrowCreatedEvent);
        escrowId = decodedEvent.args.escrowId.toString();
      }
      
      return {
        transactionHash: receipt.hash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString(),
        escrowId
      };
    } catch (error) {
      logger.error('Error creating escrow on chain:', error);
      throw error;
    }
  }

  async releaseEscrowOnChain(escrowId) {
    try {
      const tx = await this.contracts.escrow.releaseEscrow(escrowId, {
        gasLimit: process.env.GAS_LIMIT || 150000,
        gasPrice: process.env.GAS_PRICE || ethers.parseUnits('20', 'gwei')
      });
      
      const receipt = await tx.wait();
      return {
        transactionHash: receipt.hash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString()
      };
    } catch (error) {
      logger.error('Error releasing escrow on chain:', error);
      throw error;
    }
  }

  // Utility functions
  async getTransactionReceipt(transactionHash) {
    try {
      return await this.provider.getTransactionReceipt(transactionHash);
    } catch (error) {
      logger.error('Error getting transaction receipt:', error);
      throw error;
    }
  }

  async getCurrentBlockNumber() {
    try {
      return await this.provider.getBlockNumber();
    } catch (error) {
      logger.error('Error getting current block number:', error);
      throw error;
    }
  }

  async estimateGas(contract, method, params) {
    try {
      return await contract[method].estimateGas(...params);
    } catch (error) {
      logger.error('Error estimating gas:', error);
      throw error;
    }
  }

  // Event listeners
  setupEventListeners() {
    try {
      // Listen for auction events
      if (this.contracts.auction) {
        this.contracts.auction.on('AuctionCreated', (auctionId, seller, startingBid, event) => {
          logger.info(`Auction created: ${auctionId} by ${seller}`);
          this.handleAuctionCreated(auctionId, seller, startingBid, event);
        });

        this.contracts.auction.on('BidPlaced', (auctionId, bidder, amount, event) => {
          logger.info(`Bid placed: ${amount} on auction ${auctionId} by ${bidder}`);
          this.handleBidPlaced(auctionId, bidder, amount, event);
        });

        this.contracts.auction.on('AuctionEnded', (auctionId, winner, winningBid, event) => {
          logger.info(`Auction ended: ${auctionId} won by ${winner} with bid ${winningBid}`);
          this.handleAuctionEnded(auctionId, winner, winningBid, event);
        });
      }

      // Listen for escrow events
      if (this.contracts.escrow) {
        this.contracts.escrow.on('EscrowCreated', (escrowId, buyer, seller, amount, event) => {
          logger.info(`Escrow created: ${escrowId} for ${amount} tokens`);
          this.handleEscrowCreated(escrowId, buyer, seller, amount, event);
        });

        this.contracts.escrow.on('EscrowReleased', (escrowId, recipient, event) => {
          logger.info(`Escrow released: ${escrowId} to ${recipient}`);
          this.handleEscrowReleased(escrowId, recipient, event);
        });
      }

      logger.info('Event listeners set up successfully');
    } catch (error) {
      logger.error('Error setting up event listeners:', error);
    }
  }

  // Event handlers (to be implemented based on business logic)
  async handleAuctionCreated(auctionId, seller, startingBid, event) {
    // Implementation depends on your business logic
    // Update database, send notifications, etc.
  }

  async handleBidPlaced(auctionId, bidder, amount, event) {
    // Implementation depends on your business logic
    // Update auction, notify other bidders, etc.
  }

  async handleAuctionEnded(auctionId, winner, winningBid, event) {
    // Implementation depends on your business logic
    // Create escrow, notify participants, etc.
  }

  async handleEscrowCreated(escrowId, buyer, seller, amount, event) {
    // Implementation depends on your business logic
    // Update database, notify parties, etc.
  }

  async handleEscrowReleased(escrowId, recipient, event) {
    // Implementation depends on your business logic
    // Update records, notify parties, etc.
  }
}

module.exports = new Web3Service();