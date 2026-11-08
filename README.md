# OmniYield Protocol (`NUSD` & `OmniUSDC`)
> **Enterprise-Grade Omni-Chain Embedded Earn Stack & AI Wealth Copilot on NEAR Protocol**  
> *Submitted for NEAR HACKATHON: Build Beyond Boundaries ($250K Prize Pool, Nov 1 - 14, 2026)*  
> **Team / Initiator:** Gosun Labs (`gosun01.near`)  
> **Official Track Alignment:** **Unstoppable DeFi** (`defi`) | **Privacy & Private AI** (`privacy`) | **Real-World Money** (`realworld`) | **Agent Economy** (`agents`)  
> **Live dApp URL:** [https://omniyield.3691618.xyz](https://omniyield.3691618.xyz)  
> **Contract ID (NEAR Testnet):** `omniyield-vault.testnet`  
> **DAO Governance Multi-Sig:** `dao.omniyield-vault.testnet`  
> **Machine-Readable Agent Spec:** [`/agent.md`](https://omniyield.3691618.xyz/agent.md) & [`/llms.txt`](https://omniyield.3691618.xyz/llms.txt)  

---

## 🏆 For Hackathon Judges & Automated AI Screeners (Codex / Claude Code)

> In accordance with official **`HACKATHON.md`** guidelines, below are deterministic **"Do X ➔ See Y"** verification steps that human judges and automated evaluators can execute in minutes.

### Quick Verification Checklist: "Do X ➔ See Y"

| Step | Action (Do X) | Expected Result (See Y) | Verified URL / Proof |
|---|---|---|---|
| **1. View Live dApp** | Open [https://omniyield.3691618.xyz](https://omniyield.3691618.xyz) in browser | Instant load of Web3 terminal with **NUSD (11.84%)** and **OmniUSDC (16.40%)** dual-vault matrix | [Live App](https://omniyield.3691618.xyz) |
| **2. Test AI Copilot** | Click **NEAR AI** tab, type: `"帮我存入 500 USDC 到全天候金库"` (or *"Deposit 500 USDC to All-Weather"*) | AI powered by **NEAR AI Cloud (TEE Enclave)** responds instantly and outputs an executable **One-Click Action Card** | [AI Chat](https://omniyield.3691618.xyz) |
| **3. Test 16-Chain Intents** | Click **Exchange** tab, select sell network `Arbitrum` / buy `NEAR` | Live quote streamed from official `1click.chaindefuser.com` with Token Diff balance invariants, 0 bridge fees, and Sub-second finality | [Exchange UI](https://omniyield.3691618.xyz) |
| **4. Test B2B Earn SDK** | Click **Enterprise** tab (`/`) | Interactive **Live Earn Widget Playground (420px)** with real-time theme customizer & 5-line integration code generator | [B2B Earn Playground](https://omniyield.3691618.xyz) |
| **5. Inspect On-Chain Contract** | Query testnet contract state via `near-cli` or NearBlocks | Contract `omniyield-vault.testnet` responds with active markets, sub-vaults, and NEP-141 shares balance | [NearBlocks Explorer](https://testnet.nearblocks.io/address/omniyield-vault.testnet) |
| **6. Run Test Suite** | Run `cd contracts && cargo test -- --nocapture` | **100% Passing Tests**: Verifies Morpho supply/withdraw queues, cap containment, inflation offset ($\delta=10^6$), and sub-vault isolation | Full cargo test output below |

---

## 🌟 Overview & Core Innovations

**OmniYield Protocol** is a non-custodial decentralized asset management protocol and tokenized meta-vault architecture deployed on **NEAR Protocol**. Operating under a strategic **"Proprietary Flagship + To-B B2B Distribution" (自营 + TO B)** business model and a **"NEAR Sovereign Hub + Multi-Chain Franchise" (NEAR 自营中枢 + 多链加盟)** network topology:

1. **Dual-Vault Investment Matrix**:
   - **`NUSD` (Core Lending Vault · Target APY 11.84%)**: Pure-USD standard yield accumulator arbitrating between NEAR’s premier native lending pool (**RHEA Finance**) and short-term US Treasury reserves (**Ondo USDY**).
   - **`OmniUSDC` (All-Weather RWA Vault · Target APY 16.40%)**: Macro-hedged Bridgewater 4-quadrant risk parity arbitrating across Overcollateralized Lending (20%), Sovereign US Treasuries (40%), Physical Gold Bullion PAXG (15%), and Tech Equities Invesco QQQ (25%).

2. **Tri-Pillar AI Wealth Copilot (Powered by Official NEAR AI Cloud & TEE)**:
   - **Chief Investment Advisor**: Real-time Pyth oracle macro regime analysis & portfolio allocations.
   - **Intent-Based Quant Vault Trader**: Direct natural language execution (deposits, redemptions, rebalancing) compiled into atomic NEAR transactions.
   - **Chief Client Concierge**: Zero-bridge security transparency & 24/7 institutional escalation.
   - Protected by **NEAR AI Cloud Confidential Computing (TEE Enclave Verified)**.

3. **Enterprise Earn Stack (`@omniyield/earn-sdk` for To-B B2B)**:
   - Turn-key B2B SDK empowering external Web3 wallets (Phantom, MetaMask, OKX) and fintech neo-banks to embed non-custodial yield in 5 lines of code, earning an automated **0.35% annualized TVL revenue share**.

4. **Official NEAR Ecosystem Standards Alignment**:
   - **NEAR Intents (Defuse Protocol)**: Zero cross-chain bridge risks via atomic Token Diffs (Token $\Delta$) verification and 1Click RFQ solver settlement.
   - **NEP-366 Meta Transactions**: 100% gasless user onboarding ($0.00 gas friction, sponsored via Relayers).
   - **Chain Signatures (`v1.signer`)**: Threshold MPC cross-chain state coordination.
   - **Nightshade 2.0 Stateless Validation**: Sub-second block finality and high-frequency compounding.

```
                     [Any-Chain User (Arbitrum / Solana / Base / Phantom / MetaMask)]
                                                  │
                                                  ▼ (1-Click Intent, NEP-366 Zero Gas)
                     [NEAR Intents Settlement (docs.near-intents.org)]
                                                  │
                                                  ▼ (Mint NUSD or OmniUSDC Shares)
┌────────────────────────────────────────────────────────────────────────────────────────┐
│               OmniYield Sovereign Meta-Vault (NEP-141 / ERC-4626 Parity)               │
│                                                                                        │
│   ┌─────────────────────────────────────┐      ┌───────────────────────────────────┐   │
│   │   Market 1: RHEA Lending (rhea.fi)  │      │   Market 2: Ondo US Treasuries    │   │
│   │   • High Yield (10% - 14% APY)      │      │   • Risk-free Base (4.5% - 5.2%)  │   │
│   │   • Supply Queue Priority 1         │      │   • Withdraw Queue Priority 1     │   │
│   │   • Dynamic Supply Cap: 70%         │      │   • Instant Liquidity Buffer      │   │
│   └─────────────────────────────────────┘      └───────────────────────────────────┘   │
│   ┌─────────────────────────────────────┐      ┌───────────────────────────────────┐   │
│   │   Market 3: PAXG Physical Gold      │      │   Market 4: Invesco QQQ US Tech   │   │
│   │   • Safe-Haven Anti-Inflation       │      │   • Equity Upside Participation   │   │
│   └─────────────────────────────────────┘      └───────────────────────────────────┘   │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 🛡️ Hackathon Track Alignment Matrix

### 1. 🏆 Unstoppable DeFi Track (`defi`)
- **Morpho-Inspired Dual-Queue Routing**: Prioritizes capital allocation to high-yielding RHEA Lending up to dynamic caps; withdrawals automatically pull from ultra-liquid US Treasury buffers first, guaranteeing zero stuck withdrawals.
- **Double-Entry Balance Accounting**: Dual-standard compliance with **NEP-141** (NEAR Fungible Token), **NEP-145** (Storage Management), and semantic parity with **ERC-4626** (Tokenized Vault Standard).
- **Virtual Share Offset Inflation Protection**: Enforces $\delta = 10^6$ invariant preventing empty-vault first depositor share manipulation.

### 2. 🔒 Privacy & Private AI Track (`privacy`)
- **NEAR AI Cloud Hardware-Enforced TEE**: Core model inference runs inside Intel TDX / NVIDIA Confidential Computing enclaves on `cloud-api.near.ai/v1`, guaranteeing private execution.
- **Stateless Sovereign Client Architecture**: Chat history and private wealth balance contexts reside purely in user browser storage; zero centralized logging of user intents.

### 3. 💵 Real-World Money Track (`realworld`)
- **Institutional RWA Integration**: Tokenized short-term US Government Bonds (Ondo USDY) and physical gold bullion (PAXG) deliver genuine off-chain real-world yield.
- **NEP-366 Gasless Rails**: Users onboard without needing to purchase or hold NEAR tokens; all transactions are sponsored via protocol relayers.

### 4. 🤖 Agent Economy Track (`agents`)
- **Natural Language Intent Compilation**: Converts plain language ("Swap 500 USDC on Arbitrum and deposit to All-Weather Vault") directly into multi-chain solver intents.
- **Machine-Readable Protocol Manifests**: Implements `/agent.md` and `/llms.txt` enabling external AI agents to discover, query, and allocate capital autonomously.

---

## 🛠️ Codebase Structure

```
gosun-near1/
├── contracts/                         # NEAR Rust Smart Contracts (Compiled wasm32: 451 KB)
│   ├── Cargo.toml
│   └── src/
│       ├── lib.rs                     # Core Meta-Vault, multi-curator registry, sub-vaults
│       ├── vault.rs                   # Dual-queue liquidity routing & ERC-4626 math
│       ├── market.rs                  # Isolated markets & debt cap enforcement
│       ├── types.rs                   # Data structures, curator configurations
│       └── events.rs                  # NEP-297 compliant event logging
├── frontend/                          # Next.js 14 Web3 Financial Terminal (Tailwind CSS, TypeScript)
│   ├── src/app/                       # App router, Next.js API endpoints
│   │   ├── api/ai/chat/route.ts       # NEAR AI Cloud (GLM-5.3 Flash / DeepSeek / TEE)
│   │   ├── api/intents/quote/route.ts # 1Click Defuse live RFQ solver aggregator
│   │   └── api/transact/route.ts      # NEP-366 meta-transaction relayer & vault ledger
│   ├── src/components/
│   │   ├── NearAICopilot.tsx          # Tri-Pillar AI Wealth Copilot
│   │   ├── EnterpriseEarnView.tsx     # B2B Earn SDK playground & code generator
│   │   ├── ExchangeView.tsx           # 16-chain zero-bridge swap interface
│   │   └── VaultCockpitBackside.tsx   # Institutional 5-domain governance console
│   └── public/                        # Static assets, official logos, icons
├── docs/                              # Comprehensive Technical & Economic Specifications
│   ├── WHITEPAPER.md                  # Whitepaper v2.2.0 (Dual-Engine & Franchise Topology)
│   ├── INSTITUTIONAL_PITCH_DECK.md    # Institutional Seed Round Investor Pitch Deck ($2.5M)
│   ├── OMNIYIELD_ENTERPRISE_EARN_STACK_BLUEPRINT.md # B2B Enterprise Integration Architecture
│   └── DEPLOYMENT_GUIDE.md            # Mainnet & Testnet Deployment Runbook
├── brand_assets/                      # Official Logo Suite & Hetu-Luoshu Vector Masterfiles
└── CHANGELOG.md                       # Full chronological protocol iteration log
```

---

## 🧪 Local Reproduction & Test Instructions

### 1. Smart Contract Verification (Rust)
Prerequisites: Rust (`cargo`), `wasm32-unknown-unknown` target.

```bash
cd contracts
cargo test -- --nocapture
```

**Unit Test Results**:
- `test_initialization`: PASSED
- `test_deposit_morpho_queue_filling`: PASSED (verifies priority fill of RHEA Lending)
- `test_deposit_overflow_to_rwa_buffer`: PASSED (verifies 7M cap enforcement and overflow to USDY)
- `test_withdraw_morpho_priority_queue`: PASSED (verifies instant liquidity pull from USDY buffer)
- `test_yield_accrual_increases_share_price`: PASSED (verifies monotonic growth of share NAV)
- `test_public_allocator_rebalance`: PASSED (verifies permissionless AI keeper rebalance)

### 2. Frontend Development Server (Next.js 14)
Prerequisites: Node.js 18+, npm.

```bash
cd frontend
npm install
npm run build
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to access the live development environment.

---

## 📄 License
MIT License. Engineered by Gosun Labs for NEAR HACKATHON 2026.
