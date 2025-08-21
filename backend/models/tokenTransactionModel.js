const mongoose = require('mongoose');

const tokenTransactionSchema = new mongoose.Schema({
  transactionId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  type: {
    type: String,
    enum: [
      'deposit',
      'withdrawal',
      'bid_lock',
      'bid_unlock',
      'escrow_lock',
      'escrow_release',
      'fee_payment',
      'fee_burn',
      'transfer',
      'refund'
    ],
    required: true
  },
  user: {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    walletAddress: {
      type: String,
      required: true
    },
    anonymousId: {
      type: String,
      required: true
    }
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    default: 'WKC'
  },
  blockchain: {
    transactionHash: {
      type: String,
      required: true,
      unique: true
    },
    blockNumber: {
      type: Number,
      required: true
    },
    blockHash: String,
    gasUsed: Number,
    gasPrice: String,
    nonce: Number,
    confirmations: {
      type: Number,
      default: 0
    },
    isConfirmed: {
      type: Boolean,
      default: false
    }
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'failed', 'cancelled'],
    default: 'pending'
  },
  relatedTo: {
    type: {
      type: String,
      enum: ['auction', 'bid', 'escrow', 'dispute', 'withdrawal', 'deposit']
    },
    id: String,
    reference: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'relatedTo.type'
    }
  },
  fees: {
    platformFee: {
      type: Number,
      default: 0
    },
    gasFee: {
      type: Number,
      default: 0
    },
    burnAmount: {
      type: Number,
      default: 0
    },
    treasuryAmount: {
      type: Number,
      default: 0
    }
  },
  balances: {
    before: {
      available: Number,
      locked: Number,
      total: Number
    },
    after: {
      available: Number,
      locked: Number,
      total: Number
    }
  },
  metadata: {
    description: String,
    source: {
      type: String,
      enum: ['web', 'mobile', 'api', 'system'],
      default: 'web'
    },
    ipAddress: String,
    userAgent: String,
    initiatedBy: {
      type: String,
      enum: ['user', 'system', 'admin'],
      default: 'user'
    }
  },
  mobileMoneyIntegration: {
    provider: {
      type: String,
      enum: ['mtn_momo', 'vodafone_cash', 'airteltigo', 'telecel_cash']
    },
    phoneNumber: String,
    externalTransactionId: String,
    exchangeRate: Number,
    localAmount: Number,
    localCurrency: {
      type: String,
      default: 'GHS'
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
tokenTransactionSchema.index({ transactionId: 1 });
tokenTransactionSchema.index({ 'user.userId': 1 });
tokenTransactionSchema.index({ 'user.walletAddress': 1 });
tokenTransactionSchema.index({ 'blockchain.transactionHash': 1 });
tokenTransactionSchema.index({ type: 1 });
tokenTransactionSchema.index({ status: 1 });
tokenTransactionSchema.index({ createdAt: -1 });

// Compound indexes
tokenTransactionSchema.index({ 'user.userId': 1, type: 1 });
tokenTransactionSchema.index({ 'user.userId': 1, status: 1 });
tokenTransactionSchema.index({ type: 1, status: 1 });
tokenTransactionSchema.index({ 'relatedTo.type': 1, 'relatedTo.id': 1 });

// Virtual for transaction age
tokenTransactionSchema.virtual('age').get(function() {
  return Date.now() - this.createdAt;
});

// Virtual for is recent
tokenTransactionSchema.virtual('isRecent').get(function() {
  const oneHour = 60 * 60 * 1000;
  return this.age < oneHour;
});

// Virtual for net amount (amount minus fees)
tokenTransactionSchema.virtual('netAmount').get(function() {
  return this.amount - (this.fees.platformFee + this.fees.gasFee);
});

// Pre-save middleware to generate transaction ID
tokenTransactionSchema.pre('save', async function(next) {
  if (this.isNew && !this.transactionId) {
    this.transactionId = await this.generateTransactionId();
  }
  next();
});

// Method to generate transaction ID
tokenTransactionSchema.methods.generateTransactionId = async function() {
  const crypto = require('crypto');
  let transactionId;
  let isUnique = false;
  
  while (!isUnique) {
    const randomBytes = crypto.randomBytes(6);
    transactionId = `TXN_${randomBytes.toString('hex').toUpperCase()}`;
    
    const existingTransaction = await this.constructor.findOne({ transactionId });
    if (!existingTransaction) {
      isUnique = true;
    }
  }
  
  return transactionId;
};

// Method to confirm transaction
tokenTransactionSchema.methods.confirm = function(confirmations = 1) {
  this.blockchain.confirmations = confirmations;
  this.blockchain.isConfirmed = confirmations >= 3; // Require 3 confirmations
  this.status = this.blockchain.isConfirmed ? 'confirmed' : 'pending';
  
  return this.save();
};

// Method to mark as failed
tokenTransactionSchema.methods.markAsFailed = function(reason) {
  this.status = 'failed';
  this.metadata.description = reason;
  
  return this.save();
};

// Method to calculate platform fees
tokenTransactionSchema.methods.calculateFees = function() {
  const platformFeePercentage = parseFloat(process.env.PLATFORM_FEE_PERCENTAGE) || 10;
  const burnPercentage = parseFloat(process.env.FEE_BURN_PERCENTAGE) || 50;
  
  this.fees.platformFee = (this.amount * platformFeePercentage) / 100;
  this.fees.burnAmount = (this.fees.platformFee * burnPercentage) / 100;
  this.fees.treasuryAmount = this.fees.platformFee - this.fees.burnAmount;
  
  return this;
};

// Static method to find user transactions
tokenTransactionSchema.statics.findByUser = function(userId, type = null, limit = 50) {
  const query = { 'user.userId': userId };
  if (type) query.type = type;
  
  return this.find(query)
    .sort({ createdAt: -1 })
    .limit(limit);
};

// Static method to find pending transactions
tokenTransactionSchema.statics.findPending = function() {
  return this.find({ status: 'pending' })
    .sort({ createdAt: 1 });
};

// Static method to get user balance summary
tokenTransactionSchema.statics.getUserBalanceSummary = async function(userId) {
  const pipeline = [
    { $match: { 'user.userId': mongoose.Types.ObjectId(userId), status: 'confirmed' } },
    {
      $group: {
        _id: '$type',
        totalAmount: { $sum: '$amount' },
        count: { $sum: 1 }
      }
    }
  ];
  
  const results = await this.aggregate(pipeline);
  
  let available = 0;
  let locked = 0;
  
  results.forEach(result => {
    switch (result._id) {
      case 'deposit':
        available += result.totalAmount;
        break;
      case 'withdrawal':
        available -= result.totalAmount;
        break;
      case 'bid_lock':
        available -= result.totalAmount;
        locked += result.totalAmount;
        break;
      case 'bid_unlock':
        available += result.totalAmount;
        locked -= result.totalAmount;
        break;
      case 'escrow_lock':
        available -= result.totalAmount;
        locked += result.totalAmount;
        break;
      case 'escrow_release':
        locked -= result.totalAmount;
        break;
      case 'fee_payment':
        available -= result.totalAmount;
        break;
    }
  });
  
  return {
    available: Math.max(0, available),
    locked: Math.max(0, locked),
    total: Math.max(0, available + locked)
  };
};

// Static method to get platform statistics
tokenTransactionSchema.statics.getPlatformStats = async function(days = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  const pipeline = [
    { $match: { createdAt: { $gte: startDate }, status: 'confirmed' } },
    {
      $group: {
        _id: '$type',
        totalAmount: { $sum: '$amount' },
        totalFees: { $sum: '$fees.platformFee' },
        totalBurned: { $sum: '$fees.burnAmount' },
        count: { $sum: 1 }
      }
    }
  ];
  
  return this.aggregate(pipeline);
};

module.exports = mongoose.model('TokenTransaction', tokenTransactionSchema);