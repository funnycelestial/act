# Anonymous Auction System - API Documentation

## Overview
This document maps every frontend action to its corresponding backend endpoint for the Anonymous Auction System. All endpoints should implement proper authentication, authorization, and anonymity features.

## Authentication Endpoints

### User Authentication
- **POST** `/auth/register` - User registration
- **POST** `/auth/login` - User login
- **POST** `/auth/logout` - User logout
- **POST** `/auth/refresh` - Refresh access token
- **GET** `/auth/profile` - Get user profile
- **PUT** `/auth/profile` - Update user profile

## Auction Management Endpoints

### Auction CRUD Operations
- **GET** `/auctions` - Get all auctions (with filters)
  - Query params: `type`, `status`, `category`, `page`, `limit`
- **GET** `/auctions/{id}` - Get specific auction details
- **POST** `/auctions` - Create new auction
- **PUT** `/auctions/{id}` - Update auction (owner only)
- **DELETE** `/auctions/{id}` - Delete auction (owner only)
- **POST** `/auctions/{id}/close` - Close auction manually

### Auction Filtering & Search
- **GET** `/auctions/search` - Search auctions
  - Query params: `q`, `category`, `price_min`, `price_max`, `type`
- **GET** `/auctions/categories` - Get available categories
- **GET** `/auctions/featured` - Get featured auctions

## Bidding System Endpoints

### Bid Management
- **GET** `/auctions/{id}/bids` - Get all bids for auction (anonymized)
- **POST** `/auctions/{id}/bids` - Place new bid
- **GET** `/bids/my-bids` - Get user's bid history
- **DELETE** `/bids/{id}` - Withdraw bid (if allowed)
- **GET** `/bids/{id}/status` - Check bid status

### Real-time Bidding
- **WebSocket** `/ws/auctions/{id}/bids` - Real-time bid updates
- **WebSocket** `/ws/auctions/{id}/activity` - Live activity feed

## Token/Wallet Management Endpoints

### Token Operations
- **GET** `/wallet/balance` - Get user token balance
- **POST** `/wallet/deposit` - Deposit tokens
- **POST** `/wallet/withdraw` - Withdraw tokens
- **GET** `/wallet/transactions` - Get transaction history
- **POST** `/wallet/transfer` - Transfer tokens to another user

### Token Exchange
- **GET** `/exchange/rates` - Get current exchange rates
- **POST** `/exchange/buy-tokens` - Buy tokens with fiat
- **POST** `/exchange/sell-tokens` - Sell tokens for fiat

## Payment Gateway Endpoints

### Payment Methods
- **GET** `/payments/methods` - Get available payment methods
- **POST** `/payments/methods` - Add payment method
- **PUT** `/payments/methods/{id}` - Update payment method
- **DELETE** `/payments/methods/{id}` - Remove payment method

### Payment Processing
- **POST** `/payments/process` - Process payment
- **GET** `/payments/{id}/status` - Check payment status
- **POST** `/payments/{id}/refund` - Process refund
- **GET** `/payments/history` - Get payment history

## Escrow Management Endpoints

### Escrow Operations
- **GET** `/escrow/transactions` - Get user's escrow transactions
- **GET** `/escrow/{id}` - Get specific escrow details
- **POST** `/escrow/{id}/confirm-delivery` - Confirm delivery
- **POST** `/escrow/{id}/mark-delivered` - Mark as delivered (seller)
- **POST** `/escrow/{id}/release-funds` - Release escrowed funds
- **POST** `/escrow/{id}/dispute` - Initiate dispute

## Dispute Management Endpoints

### Dispute Operations
- **GET** `/disputes` - Get user disputes
- **GET** `/disputes/{id}` - Get specific dispute details
- **POST** `/disputes` - File new dispute
- **POST** `/disputes/{id}/respond` - Add response to dispute
- **POST** `/disputes/{id}/resolve` - Resolve dispute (admin)
- **POST** `/disputes/{id}/escalate` - Escalate dispute

## Notification System Endpoints

### Notification Management
- **GET** `/notifications` - Get user notifications
- **PUT** `/notifications/{id}/read` - Mark notification as read
- **PUT** `/notifications/read-all` - Mark all notifications as read
- **POST** `/notifications/subscribe` - Subscribe to notification type
- **DELETE** `/notifications/unsubscribe/{type}` - Unsubscribe from notifications

### Real-time Notifications
- **WebSocket** `/ws/notifications` - Real-time notification stream

## Security & Anonymity Endpoints

### Security Operations
- **GET** `/security/status` - Get security status
- **POST** `/security/enable-2fa` - Enable two-factor authentication
- **POST** `/security/disable-2fa` - Disable two-factor authentication
- **POST** `/security/verify-identity` - Submit identity verification
- **GET** `/security/anonymity-level` - Get current anonymity level
- **POST** `/security/report-issue` - Report security issue

### Privacy Controls
- **GET** `/privacy/settings` - Get privacy settings
- **PUT** `/privacy/settings` - Update privacy settings
- **POST** `/privacy/mask-identity` - Enable identity masking
- **DELETE** `/privacy/mask-identity` - Disable identity masking

## Admin Dashboard Endpoints

### System Management (Admin Only)
- **GET** `/admin/dashboard` - Get admin dashboard data
- **GET** `/admin/system/health` - Get system health status
- **GET** `/admin/statistics` - Get platform statistics
- **GET** `/admin/auctions/pending` - Get pending auctions for approval
- **POST** `/admin/auctions/{id}/approve` - Approve auction
- **POST** `/admin/auctions/{id}/reject` - Reject auction

### User Management (Admin Only)
- **GET** `/admin/users` - Get all users
- **PUT** `/admin/users/{id}/status` - Update user status
- **POST** `/admin/users/{id}/verify` - Verify user identity
- **GET** `/admin/users/{id}/activity` - Get user activity log

### Content Moderation (Admin Only)
- **GET** `/admin/reports` - Get reported content
- **POST** `/admin/reports/{id}/resolve` - Resolve report
- **POST** `/admin/content/{id}/flag` - Flag content
- **DELETE** `/admin/content/{id}` - Remove content

## Frontend Action to Endpoint Mapping

### Live Bidding Panel Actions
1. **Place Bid Button** → `POST /auctions/{id}/bids`
2. **Real-time Bid Updates** → `WebSocket /ws/auctions/{id}/bids`
3. **Load Auction Details** → `GET /auctions/{id}`

### Token Balance Actions
1. **View Balance** → `GET /wallet/balance`
2. **View Transactions** → `GET /wallet/transactions`
3. **Deposit Tokens** → `POST /wallet/deposit`

### Auction Card Actions
1. **View Auction** → `GET /auctions/{id}`
2. **Place Quick Bid** → `POST /auctions/{id}/bids`
3. **Watch Auction** → `POST /auctions/{id}/watch`

### Payment Gateway Actions
1. **Add Payment Method** → `POST /payments/methods`
2. **Buy Tokens** → `POST /exchange/buy-tokens`
3. **Cash Out** → `POST /exchange/sell-tokens`
4. **View Transaction History** → `GET /payments/history`

### Security Panel Actions
1. **View Security Status** → `GET /security/status`
2. **Report Issue** → `POST /security/report-issue`
3. **Update Settings** → `PUT /privacy/settings`

### Escrow Panel Actions
1. **Confirm Delivery** → `POST /escrow/{id}/confirm-delivery`
2. **Mark Delivered** → `POST /escrow/{id}/mark-delivered`
3. **Initiate Dispute** → `POST /disputes`
4. **View Escrow Details** → `GET /escrow/{id}`

### Dispute Panel Actions
1. **File Dispute** → `POST /disputes`
2. **Add Response** → `POST /disputes/{id}/respond`
3. **View Dispute Details** → `GET /disputes/{id}`

### Notification Panel Actions
1. **Mark as Read** → `PUT /notifications/{id}/read`
2. **View All Notifications** → `GET /notifications`
3. **Real-time Updates** → `WebSocket /ws/notifications`

### User Wallet Actions
1. **View Balance Breakdown** → `GET /wallet/balance`
2. **View Recent Transactions** → `GET /wallet/transactions`
3. **Transfer Tokens** → `POST /wallet/transfer`

### Admin Dashboard Actions
1. **Approve Auction** → `POST /admin/auctions/{id}/approve`
2. **Reject Auction** → `POST /admin/auctions/{id}/reject`
3. **View System Stats** → `GET /admin/statistics`
4. **Manage Users** → `GET /admin/users`

## Request/Response Formats

### Standard Response Format
```json
{
  "success": boolean,
  "data": object | array,
  "message": string,
  "errors": array,
  "meta": {
    "page": number,
    "limit": number,
    "total": number
  }
}
```

### Authentication Headers
```
Authorization: Bearer {jwt_token}
X-Anonymous-ID: {anonymous_identifier}
```

### Error Response Format
```json
{
  "success": false,
  "data": null,
  "message": "Error description",
  "errors": [
    {
      "field": "field_name",
      "message": "Validation error message"
    }
  ]
}
```

## WebSocket Events

### Auction Events
- `bid_placed` - New bid placed
- `auction_closed` - Auction ended
- `auction_updated` - Auction details changed

### Notification Events
- `new_notification` - New notification received
- `notification_read` - Notification marked as read

### System Events
- `maintenance_mode` - System maintenance notification
- `security_alert` - Security-related alerts

## Security Considerations

1. **Rate Limiting**: Implement rate limiting on all endpoints
2. **Input Validation**: Validate all input data
3. **Authentication**: JWT-based authentication with refresh tokens
4. **Anonymity**: Ensure user identities are properly masked
5. **Encryption**: Encrypt sensitive data in transit and at rest
6. **Audit Logging**: Log all significant actions for security auditing

## Implementation Notes

1. All monetary amounts should be handled as integers (smallest currency unit)
2. Implement proper pagination for list endpoints
3. Use WebSockets for real-time features
4. Implement proper error handling and validation
5. Ensure all endpoints support the anonymity requirements
6. Add comprehensive logging for debugging and monitoring