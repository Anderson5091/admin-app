# QUICKSEND

# TREASURY & DIGITAL ASSET MANAGEMENT ARCHITECTURE

Version 3.0

Classification: Internal Engineering Specification

---

# 1. PURPOSE

This document defines how QuickSend manages digital assets, customer balances, liquidity, remittance settlements, treasury operations, and blockchain interactions.

QuickSend operates as a fully custodial financial platform.

Customers do not own blockchain wallets.

Customers do not hold private keys.

Customers do not sign blockchain transactions.

All blockchain assets are owned and controlled by QuickSend through Crossmint Treasury Wallet infrastructure.

Customer balances exist exclusively within the QuickSend Core Ledger.

The blockchain serves only as a settlement layer.

---

# 2. FUNDAMENTAL PRINCIPLE

## Banking Model

QuickSend follows the same model used by modern fintechs and remittance companies.

Customer Balance:

```text
Database Ledger
```

Treasury Assets:

```text
Crossmint Treasury Wallets
```

Source of Truth:

```text
Double Entry Ledger
```

A customer's balance is never derived from blockchain balances.

The ledger remains the authoritative financial record.

---

# 3. TREASURY OWNERSHIP MODEL

All production wallets are Crossmint Treasury Wallets.

Configuration:

```typescript
owner: "COMPANY"
```

Characteristics:

* Fully custodial
* Company controlled
* Enterprise security
* Server-based transaction signing
* Multi-signature support
* Compliance monitoring
* Audit trails

QuickSend exclusively controls all treasury assets.

---

# 4. TREASURY LAYERS

QuickSend uses a three-tier treasury architecture.

## Layer 1: HOT TREASURY

Purpose:

Operational liquidity.

Used For:

* Customer withdrawals
* Stablecoin payouts
* Remittance settlements
* Agent settlements
* Merchant settlements

Characteristics:

* Online
* Automated signing
* Connected to transaction engine

Target Liquidity:

```text
$20,000 – $100,000
```

Risk Level:

HIGH

---

## Layer 2: WARM TREASURY

Purpose:

Operational reserve.

Used For:

* Hot wallet replenishment
* Liquidity balancing
* Treasury management

Characteristics:

* Restricted access
* Multi-signature approvals
* Treasury operations only

Target Liquidity:

```text
$250,000 – $1,000,000
```

Risk Level:

MEDIUM

---

## Layer 3: COLD TREASURY

Purpose:

Long-term reserves.

Used For:

* Corporate reserves
* Investor capital
* Emergency liquidity
* Regulatory reserve requirements

Characteristics:

* Isolated from daily operations
* Executive approval required
* Hardware or KMS protected

Target Liquidity:

```text
Majority of company assets
```

Risk Level:

LOW

---

# 5. NETWORK TREASURIES

Each supported network maintains independent treasury wallets.

Example:

```text
Base USDC Treasury
Polygon USDC Treasury
Ethereum USDC Treasury
Solana USDC Treasury
Stellar USDC Treasury
```

Each network includes:

```text
Hot Treasury
Warm Treasury
Cold Treasury
```

Example:

```text
Base Hot Wallet
Base Warm Wallet
Base Cold Wallet
```

---

# 6. CUSTOMER BALANCES

Customer funds are represented by ledger accounts.

Example:

```text
Customer Account
USD Balance
USDC Balance
HTG Balance
Transaction History
```

Blockchain deposit wallet is assigned to customers.

Customers interact exclusively with:

* Mobile App
* Web App
* Agent Network

All balances are maintained internally.

---

# 7. DEPOSIT ARCHITECTURE

## Deposit Wallets

QuickSend may create company-owned deposit wallets for each user

Example:

```text
deposit-user-123
deposit-user-456
```

Wallet Type:

```typescript
owner: "COMPANY"
```

Purpose:

Receive customer deposits.

---

## Deposit Flow

Customer Deposit

↓

User Deposit Wallet

↓

Blockchain Confirmation

↓

Ledger Credit

↓

Automatic Sweep

↓

Treasury Wallet

The customer balance is credited immediately after confirmation and reconciliation.

---

# 8. SWEEP ENGINE

The Sweep Engine consolidates funds into treasury wallets.

Rules:

```text
Deposit Wallet → Hot Treasury
```

Benefits:

* Reduced risk
* Treasury consolidation
* Simplified reconciliation

Deposit wallets should not retain balances.

---

# 9. INTERNAL TRANSFERS

QuickSend-to-QuickSend transfers do not use blockchain.

Example:

```text
Alice → Bob
```

Ledger:

```text
Alice -100

Bob +100
```

Blockchain Activity:

```text
NONE
```

Benefits:

* Instant settlement
* No gas fees
* Unlimited scalability

---

# 10. WITHDRAWAL ARCHITECTURE

Customer requests withdrawal.

Validation:

```text
Available Balance Check
AML Check
Fraud Check
Velocity Check
```

Ledger:

```text
Debit Customer Balance
```

Settlement:

```text
Hot Treasury Wallet
        ↓
Recipient Wallet
```

Funds always originate from QuickSend treasury.

Never from user wallets.

---

# 11. REMITTANCE SETTLEMENT

## Sending Flow

Customer funds account.

Ledger Credit:

```text
+500 USD
```

Customer sends:

```text
500 USD
```

Ledger:

```text
-500 USD
```

Settlement:

```text
QuickSend Treasury
        ↓
Crossmint Payout Infrastructure
        ↓
Partner Network
        ↓
Recipient
```

Crossmint performs:

* AML screening
* Sanctions screening
* Travel Rule compliance
* Compliance monitoring
* Regulatory controls

---

# 12. TREASURY REBALANCING

## Hot Wallet Rules

Target:

```text
50,000 USDC
```

Rule:

```text
If balance < 20,000

Move 100,000

Warm → Hot
```

---

## Warm Wallet Rules

Target:

```text
500,000 USDC
```

Rule:

```text
If balance < 250,000

Move 1,000,000

Cold → Warm
```

Requires treasury approval.

---

# 13. REVENUE MANAGEMENT

Transaction fees are separated from customer liabilities.

Fee Collection Wallet:

```text
Revenue Treasury
```

Revenue Sources:

* Transfer fees
* FX fees
* Withdrawal fees
* Agent fees
* Merchant fees

Customer funds and company revenue must never be mixed within the ledger.

---

# 14. DOUBLE ENTRY LEDGER

Every financial event creates balanced entries.

Example:

Customer Deposit:

```text
Debit Treasury Asset

Credit Customer Liability
```

Customer Withdrawal:

```text
Debit Customer Liability

Credit Treasury Asset
```

Ledger guarantees:

* Auditability
* Reconciliation
* Financial reporting
* Regulatory compliance

---

# 15. SECURITY MODEL

Security Controls:

* Crossmint Treasury Wallets
* Multi-signature approvals
* Cloud KMS integration
* Role-based access control
* Webhook verification
* Audit logging
* Transaction monitoring
* Treasury segregation

---

# 16. SOURCE OF TRUTH

The authoritative financial record for QuickSend is:

```text
Core Ledger
```

Not:

```text
Blockchain Balances
```

Treasury wallets hold assets.

The ledger tracks liabilities.

Every customer balance, transfer, deposit, withdrawal, payout, fee, and treasury movement is recorded in the QuickSend Ledger.

The ledger is the definitive source of truth across the entire QuickSend ecosystem.
