# OmniYield Protocol — Machine-Readable Agent Specification
> **Specification Standard**: NEAR AI Agent Protocol Manifest (RFC-NEAR-AI-04)  
> **Endpoint**: `https://omniyield.finance/agent.md`  
> **Compatible With**: NEAR AI Cloud, OpenAI-compatible Agents, Claude Code, Codex, AutoGPT  

---

## 1. Protocol Overview & Identity
- **Protocol Name**: OmniYield Protocol (GOSUN OmniYield)
- **Primary Category**: Agent Economy / Autonomous DeFi Vault Aggregator
- **Base Network**: NEAR Protocol (`testnet` / `mainnet`)
- **Core Value**: Zero-bridge multi-chain intent clearing, dual-vault real-yield liquidity, and sovereign AI copilot.

---

## 2. Vault Registry & On-Chain Contracts

### 2.1 NUSD Core Lending Vault
- **Contract ID**: `omniyield-vault.testnet`
- **Receipt Token**: `NUSD` (NEP-141)
- **Base Asset**: `USDC` (6 decimals)
- **Target APY**: `12.40%`
- **Strategy Matrix**: 70% Overcollateralized RHEA Borrow/Lending + 30% Ondo USDY Tokenized US Treasuries
- **Risk Profile**: Conservative / Pure USD Standard / Zero Impermanent Loss

### 2.2 OmniUSDC All-Weather Macro Vault
- **Contract ID**: `omniyield-vault.testnet` (Sub-account / Namespace `all-weather`)
- **Receipt Token**: `OmniUSDC` (NEP-141)
- **Base Asset**: `USDC` (6 decimals)
- **Target APY**: `16.80%`
- **Strategy Matrix**: Bridgewater 4-Pillar Risk Parity (40% US 10Y Treasuries + 25% QQQ Tech Equities + 15% PAXG Gold + 20% DeFi Credit)
- **Risk Profile**: Moderate-Aggressive / Macro All-Weather Hedging

### 2.3 Sovereign Multi-Sig Governance
- **DAO Address**: `dao.omniyield-vault.testnet`
- **Engine**: SputnikDAO v2 Multi-Sig
- **Council**: 4 entities (`dao.`, `curator.`, `guardian.`, `allocator.omniyield-vault.testnet`)
- **Quorum**: 2/2 threshold with 24-hour timelock on critical parameters.

---

## 3. Machine-Executable Action Intents

When an AI Agent generates execution tags for OmniYield, emit the following JSON schema inside `<<<ACTION_CARD:{...}>>>`:

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "title": "OmniYieldIntentPayload",
  "type": "object",
  "required": ["type", "vault", "amount", "title", "buttonText"],
  "properties": {
    "type": {
      "type": "string",
      "enum": ["deposit", "withdraw", "rebalance"]
    },
    "vault": {
      "type": "string",
      "enum": ["usdc", "all-weather"]
    },
    "vaultName": {
      "type": "string"
    },
    "amount": {
      "type": "number",
      "minimum": 0.01
    },
    "destinationChain": {
      "type": "string",
      "enum": ["NEAR", "Arbitrum", "Solana", "Base"]
    },
    "slippageToleranceBps": {
      "type": "integer",
      "default": 50,
      "maximum": 100
    }
  }
}
```

---

## 4. Policy-Based Authorization Sandbox (The Right to Run)

In accordance with NEAR Foundation's *"The Right to Run"* architectural principles:
1. **Uncensored Reasoning**: The agent has uninhibited latitude to compute macro valuations, compare APYs, and formulate arbitrage paths.
2. **Deterministic Execution Sandbox**: Every intent emitted by the agent must pass the following deterministic policy gate before on-chain submission:
   - **Target Whitelist**: Intents must target `omniyield-vault.testnet` or `dao.omniyield-vault.testnet` exclusively.
   - **Slippage Cap**: Maximum allowable slippage is capped at 0.50% (50 bps).
   - **Gasless Solver Routing**: Solvers pre-fund cross-chain routing; user incurs 0 gas token friction.
   - **Zero Custody**: Private keys remain sovereign inside client Web3 wallets (HERE Wallet, Meteor, MyNearWallet) or local TEE enclave.

---

## 5. Live Oracle & Data Feeds
- **Pyth Network (NEAR)**: Real-time high-frequency sub-second price feed for BTC, ETH, NEAR, PAXG.
- **Coinbase / CoinGecko REST Aggregator**: Multi-source oracle fallback for altcoins (AKT, SUI, RENDER, TAO).
- **Public RPC**: `https://rpc.testnet.near.org`
