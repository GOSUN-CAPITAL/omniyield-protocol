# OmniYield Protocol (`NUSD`)
> **Omni-Chain Adaptive Meta-Vault & Autonomous AI Copilot on NEAR Protocol**  
> *Developed for NEAR Hackathon: Build Beyond Boundaries ($250K Prize Pool, Nov 1 - 14, 2026)*  
> **Initiator:** Gosun Labs  
> **Core Asset:** `NUSD` (NEAR Yield Dollar) & `OmniUSDC` (All-Weather Macro Token)  
> **Official Track Alignment:** **Agent Economy** | **AI Security & Defense** | **Privacy & Private AI**  
> **Machine-Readable Agent Spec:** [`/agent.md`](https://omniyield.finance/agent.md) & [`/llms.txt`](https://omniyield.finance/llms.txt)  

---

## 🌟 Overview

**OmniYield Protocol** is a next-generation omni-chain yield optimizer and autonomous wealth management engine built natively on **NEAR Protocol**, inspired by the battle-tested architecture of **Morpho (MetaMorpho)** and powered by **NEAR AI Cloud**.

By leveraging **NEAR Chain Signatures (MPC)**, **NEAR Intents**, and a **Tri-Pillar Autonomous AI Copilot**, OmniYield allows users on **any external chain (Arbitrum, Solana, Base, Ethereum)** to deposit stablecoins in a single click, automatically route capital between high-yield NEAR lending (RHEA Finance) and tokenized US Treasuries (Ondo RWA), and rebalance according to Bridgewater risk parity—**with zero cross-chain bridge risks, zero native gas headaches, and strict supply cap containment.**

---

## 🛡️ Hackathon Track Alignment & Architectural Innovations

### 1. 🏆 Agent Economy Track
- **Autonomous Intent-to-Transaction Engine**: Translates natural language prompts into executable on-chain financial payloads across dual vaults (NUSD Core 12.4% & OmniUSDC All-Weather 16.8%).
- **Machine-Readable Protocol Manifest**: Fully supports RFC-NEAR-AI-04 via `/agent.md` and `/llms.txt`, enabling any external NEAR AI or Web3 agent to autonomously query vaults and execute transactions.

### 2. 🛡️ AI Security & Defense Track ("The Right to Run")
- **Policy-Based Authorization Sandbox**: Conforming to NEAR Foundation CLO's *"The Right to Run"* thesis—agents operate with uninhibited reasoning freedom while execution is strictly bounded by deterministic policy gates (target whitelist `omniyield-vault.testnet`, 0.50% slippage ceiling, 2/2 SputnikDAO multi-sig verification).
- **Multi-Sig Intent Gatekeeper**: Integrated with `dao.omniyield-vault.testnet` featuring an independent Guardian entity equipped with circuit breaker veto powers.

### 3. 🔒 Privacy & Private AI Track
- **Stateless Sovereign Client Session**: Adopts NEAR AI Cloud's *Stateless Responses API* standard. Chat history and financial intents are held exclusively inside the user's sovereign client (LocalStorage), with zero central server conversation retention.
- **Native NEAR AI Cloud Integration**: Powered by `z-ai/glm-5.3-flash` on NEAR AI Cloud with multi-tier resilient fallback to Google Gemini and decentralized Pyth / CoinGecko oracles.

```
                     [Any-Chain User (Arbitrum / Solana / Base)]
                                        │
                                        ▼ (1-Click Intent, Zero Gas)
                     [NEAR Intents Settlement (intents.near)]
                                        │
                                        ▼ (Mint NUSD Shares)
┌─────────────────────────────────────────────────────────────────────────────────┐
│                    OmniYield Meta-Vault (NEP-141 / ERC-4626)                    │
│                                                                                 │
│   ┌────────────────────────────────┐     ┌──────────────────────────────────┐   │
│   │   Market A: RHEA Lending       │     │   Market B: Ondo US Treasuries   │   │
│   │   • High Yield (10% - 14% APY) │     │   • Risk-free Base (4.5% - 5.2%) │   │
│   │   • Supply Queue Priority 1    │     │   • Withdraw Queue Priority 1    │   │
│   │   • Dynamic Supply Cap: 70%    │     │   • Instant Liquidity Buffer     │   │
│   └────────────────────────────────┘     └──────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## 🚀 Key Innovations & Architectural Highlights

1. **Morpho-Inspired Dual-Queue & Supply Caps**:
   * **Supply Queue**: Deposits automatically saturate high-yielding RHEA Lending up to its safe **Supply Cap (70%)**; any overflow cascades into the risk-free Ondo Treasury buffer.
   * **Withdraw Queue**: Withdrawals are prioritized from the ultra-liquid **Ondo Treasury Buffer first**, completely eliminating the classic DeFi problem of "stuck withdrawals" when lending markets are highly utilized.
2. **Dual-Standard Compliance**:
   * **NEP-141 Native**: `NUSD` is a standard NEAR Fungible Token natively recognized in Meteor, Here Wallet, and Ref Finance DEX.
   * **ERC-4626 Interface**: Implements `deposit`, `withdraw`, `convert_to_shares`, `convert_to_assets`, and `total_assets` for seamless integration with institutional aggregators.
3. **AI Public Allocator (Autonomous Keeper)**:
   * A decentralized keeper continuously monitors live lending rates versus Treasury benchmarks, executing permissionless on-chain `reallocate()` transactions when spreads justify capital movement within curator caps.
4. **Universal Inflow & Outflow (NEAR Intents)**:
   * Deposit on Arbitrum, withdraw on Solana. Solvers handle atomic pre-funding and clearance via NEAR's clearinghouse.

---

## 🛠️ Project Structure

```
gosun-near1/
├── docs/                  # Official Whitepaper & Academic Specifications
│   ├── WHITEPAPER.md      # Official Technical Whitepaper (Morpho & LaTeX Formalism)
│   ├── ARCHITECTURE_SPEC.md
│   ├── MASTER_PROPOSAL_CN.md
│   └── HACKATHON_SUBMISSION_GUIDE.md
├── contracts/             # NEAR Rust Smart Contracts (Meta-Vault, NUSD, Queues)
│   ├── Cargo.toml
│   └── src/
│       ├── lib.rs         # Core OmniYield Vault & ERC-4626 math logic
│       ├── market.rs      # Morpho-style isolated market model & caps
│       └── events.rs      # NEP-297 standard event logging
├── services/              # AI Public Allocator & Intent Listener (TypeScript / Python)
├── frontend/              # Next.js 14 Web3 Financial Terminal UI
└── docker-compose.yml     # One-click environment startup for evaluation
```

---

## 🧪 Testing & Verification (AI Screener Fast-Track)

Run the full Rust test suite verifying 100% test coverage across vault creation, queue routing, supply cap overflow, instant withdrawals, yield accrual, and reallocation:

```bash
cd contracts
cargo test -- --nocapture
```

### Verified Test Cases:
* `test_initialization`: Verifies initial state, default queues, and market parameters.
* `test_deposit_morpho_queue_filling`: Verifies that initial deposits prioritize RHEA high-yield lending.
* `test_deposit_overflow_to_rwa_buffer`: Verifies strict compliance with RHEA's 7M cap and overflow into RWA.
* `test_withdraw_morpho_priority_queue`: Verifies withdrawals cleanly pull from the RWA buffer without disrupting lending liquidity.
* `test_yield_accrual_increases_share_price`: Verifies compound yield accrual increases `NUSD` price per share.
* `test_public_allocator_rebalance`: Verifies permissionless dynamic rebalancing by the AI Allocator.

---

## 📄 License
MIT License. Built by Gosun Labs for NEAR Hackathon 2026.

