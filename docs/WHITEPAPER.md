# OmniYield Protocol: An Autonomous Omni-Chain Meta-Vault and Adaptive Yield Engine Powered by NEAR Chain Signatures and Intent Architectures
**Whitepaper v1.0.0**  
**Gosun Labs Research & Engineering**  
*November 2026*  
*Contact: research@gosun.network | Website: https://omniflow.network*

---

## Abstract

Decentralized Finance (DeFi) currently suffers from extreme liquidity fragmentation, fragile cross-chain bridge topologies, and capital misallocation across heterogeneous Layer-1 and Layer-2 blockchains. Over \$170 billion in stablecoin assets are marooned within single-chain silos, resulting in sub-optimal yields, frequent debt-ceiling saturations, and high user-experience friction driven by fragmented gas token requirements. 

In this paper, we introduce **OmniYield Protocol**, a non-custodial, chain-abstracted asset management protocol and tokenized meta-vault architecture deploying on the **NEAR Protocol**. Inspired by the minimalist, isolated risk framework of **Morpho Blue** and the composable vaults of **MetaMorpho**, OmniYield introduces a dual-core yield allocation engine arbitrating between NEAR’s premier native lending market (**RHEA Finance**) and institutional tokenized real-world assets (**Ondo US Treasuries / RWA**). 

By uniting **NEAR Chain Signatures**—leveraging decentralized Multi-Party Computation (MPC) threshold cryptography—with **NEAR Intents** and off-chain atomic solver networks, OmniYield establishes a universal, chain-agnostic financial primitive: **`NUSD` (NEAR Yield Dollar)**. `NUSD` functions as a fully collateralized, yield-bearing liquid asset natively compatible with both the NEAR **NEP-141** standard and the Ethereum **ERC-4626** vault specification. Users deposit native assets from any origin chain (e.g., Arbitrum, Solana, Base) in a single click, earn risk-adjusted yields governed by algorithmic supply caps and prioritized dual queues, and execute sub-second withdrawals to any destination chain without third-party bridges, wrapped tokens, or cross-chain gas exposure.

---

## 1. Introduction

### 1.1 The Cross-Chain DeFi Impasse
The blockchain ecosystem has transitioned from a monolithic paradigm dominated by Ethereum Layer-1 into a sprawling multi-chain archipelago. While this multi-chain reality provides horizontal scalability, it introduces three fundamental systemic vulnerabilities:

1. **Liquidity Fragmentation & Spread Inefficiencies**: Stablecoin yield rates (APY) diverge dramatically across networks. An annualized borrowing demand of 14% on NEAR can coexist with a 4.5% yield on Arbitrum Aave and 5.2% on tokenized US Treasuries. Arbitrage between these pools is constrained by capital lockups and transaction latencies.
2. **Bridge Risk and the "Wrapped Token Trap"**: Traditional cross-chain infrastructure relies on lock-and-mint or burn-and-mint multi-signature bridges. Over \$3 billion has been lost to bridge exploits (e.g., Ronin, Wormhole, Nomad, Multichain). Wrapped tokens ($wBTC$, $wETH$, $USDC.e$) create unbacked systemic contagion when bridge custody collapses.
3. **Execution Complexity & Gas Starvation**: Moving assets across networks requires users to maintain native gas tokens across distinct ecosystems ($ETH$, $SOL$, $NEAR$), manage disparate wallet providers, and execute multi-step token approvals.

### 1.2 The OmniYield Solution
OmniYield resolves this trilemma by divorcing **user intent expression** from **underlying liquidity execution**, positioning the NEAR Protocol as a universal, decentralized settlement and clearing layer. 

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                 THE OMNIYIELD PARADIGM                                  │
├───────────────────────────────┬────────────────────────────────────────────────────────┤
│ Traditional Cross-Chain Vault │ OmniYield Protocol (`NUSD`)                            │
├───────────────────────────────┼────────────────────────────────────────────────────────┤
│ Lock-and-mint wrapped tokens  │ Zero wrapped tokens; native MPC multi-chain control    │
│ Monolithic pooled risk (Aave) │ Isolated sub-markets with strict Supply Caps (Morpho)  │
│ Rigid same-chain withdrawal   │ Decoupled routing: Inflow on Chain A, Outflow on Chain B│
│ Manual, reactive rebalancing  │ Autonomous AI Public Allocator with keeper incentives  │
│ Single-chain gas friction     │ Universal intents: Solvers front gas and liquidity     │
└───────────────────────────────┴────────────────────────────────────────────────────────┘
```

---

## 2. Core Protocol Architecture

The protocol is partitioned into three discrete layers: **The Intent Settlement Layer**, **The Meta-Vault Core (NEP-141/ERC-4626)**, and **The Underlying Sub-Market Adapters**.

```mermaid
flowchart TD
    subgraph External ["External Multi-Chain Environment"]
        Arb["Arbitrum (USDC)"]
        Sol["Solana (SPL-USDC)"]
        Base["Base (USDC)"]
    end

    subgraph Intents ["NEAR Intents Clearing Layer"]
        UserIntent["User Intent: Deposit(1000 USDC) / Withdraw(NUSD)"]
        SolverNet["Competitive Solver Network\n(Pre-funds destination liquidity & fronts gas)"]
        Verifier["intents.near Verifier (Atomic settlement)"]
    end

    subgraph Core ["OmniYield Meta-Vault (NEAR Protocol)"]
        Vault["OmniYieldVault (Rust WASM)"]
        ShareLedger["NUSD Ledger (NEP-141 & ERC-4626 Math)"]
        AIKeeper["AI Public Allocator\n(Continuous APY Spread Monitoring)"]
    end

    subgraph Markets ["Dual-Core Isolated Sub-Markets"]
        RHEA["Market A: RHEA Finance Lending\n[Dynamic Cap: 70% | 10% - 14% APY]"]
        RWA["Market B: Ondo US Treasuries (USDY)\n[Liquidity Buffer | 4.5% - 5.2% APY]"]
    end

    External -->|1. Sign Intent| UserIntent
    UserIntent --> SolverNet
    SolverNet -->|2. Fulfill & Verify| Verifier
    Verifier -->|3. Atomic Mint / Burn| Vault
    Vault --- ShareLedger
    AIKeeper -->|4. Trigger reallocate()| Vault
    Vault -->|Supply Queue: Priority 1| RHEA
    Vault -->|Supply Overflow / Withdraw Queue: Priority 1| RWA
```

---

## 3. The Motherboard & Plug-and-Play Socket Architecture

A fundamental limitation of previous-generation cross-chain aggregators is architectural rigidity: integrating new Layer-1 ecosystems or lending pools requires monolithic contract redeployments and custom engineering by the core team.

OmniYield introduces the **Motherboard & Socket Paradigm (OmniSocket™)**, decoupling the central ledger from modular perimeter connectors:

```
+─────────────────────────────────────────────────────────────────────────────────+
|               OMNIYIELD MOTHERBOARD (Core Settlement & Ledger on NEAR)          |
|  • ERC-4626 NUSD Ledger                 • Morpho Dual-Queue Routing Engine      |
|  • Dynamic Supply Caps Enforcer         • Pluggable Socket Registry             |
+─────────────────────────────────────────────────────────────────────────────────+
                                    ▲
          ┌─────────────────────────┼─────────────────────────┐
          ▼                         ▼                         ▼
┌──────────────────┐      ┌──────────────────┐      ┌──────────────────┐
│   Chain Socket   │      │   Yield Socket   │      │ Community Socket │
│ • Arbitrum, Base │      │ • RHEA Lending   │      │ • Monad, Sui,    │
│ • Solana, NEAR   │      │ • Ondo RWA Pool  │      │   Kamino, Aave   │
└──────────────────┘      └──────────────────┘      └──────────────────┘
```

### 3.1 Formal Socket Definitions
1. **`ChainSocket` (Settlement Connector)**: Implements inbound intent verification and atomic outbound signature dispatch for foreign networks.
2. **`YieldSocket` (Capital Allocator)**: Exposes a standardized capital interface (`supply()`, `withdraw()`, `get_current_apy_bps()`, `get_available_liquidity()`).

This modularity transforms OmniYield into an open financial bus: third-party Layer-1 foundations (e.g., Monad, Sui) can permissionlessly write and propose compliant sockets, instantly tapping into NEAR's unified liquidity clearinghouse without core code alterations.

---

## 4. Mathematical Formulation & Vault Mechanics

OmniYield’s accounting logic is governed by an ERC-4626-compliant state machine adapted for the NEAR WebAssembly runtime (`near-sdk-rs`).

### 3.1 Exchange Rate & Anti-Inflation Share Calculation
To inoculate the vault against the *first-depositor inflation attack* (where an attacker front-runs an initial deposit with an asset donation to skew share ratios), the protocol enforces a virtual offset constant $\delta = 10^6$ (corresponding to standard 6-decimal micro-USDC):

Let:
* $A_t$ be the total underlying assets held in aggregate across all sub-markets at time $t$.
* $S_t$ be the total circulating supply of `NUSD` shares at time $t$.
* $a_{\text{in}}$ be the incoming assets deposited.
* $s_{\text{in}}$ be the shares minted to the depositor.

The share minting function $f: a_{\text{in}} \to s_{\text{in}}$ is defined as:

$$s_{\text{in}} = \left\lfloor \frac{a_{\text{in}} \cdot (S_t + \delta)}{A_t + \delta} \right\rfloor$$

Conversely, for a withdrawal of $s_{\text{out}}$ shares, the redeemed assets $a_{\text{out}}$ are calculated as:

$$a_{\text{out}} = \left\lfloor \frac{s_{\text{out}} \cdot (A_t + \delta)}{S_t + \delta} \right\rfloor$$

The real-time spot price of one `NUSD` share $P_t$ in terms of underlying USDC is strictly monotonic non-decreasing in the absence of catastrophic bad debt:

$$P_t = \frac{A_t + \delta}{S_t + \delta} \ge 1.000000$$

### 3.2 Sub-Market Isolation & Dynamic Supply Caps
In traditional pooled lending models (e.g., Aave v3, Compound v2), risk is cross-collateralized: a liquidity crisis in an obscure collateral asset can drain the entire liquidity pool.

OmniYield adopts the **Morpho Blue paradigm** by decomposing allocation into isolated sub-markets $M_i \in \mathcal{M}$. Each sub-market possesses an immutable identifier, an adapter address, an active allocation $C_i(t)$, and a curator-defined hard Supply Cap $\Omega_i$:

$$\forall i \in \mathcal{M}, \quad C_i(t) \le \Omega_i$$

For the dual-core deployment:
1. **$M_{\text{RHEA}}$ (RHEA Lending Pool)**: $\Omega_{\text{RHEA}} = \min(0.70 \cdot A_t, \text{LiquidityLimit})$. Cap represents a maximum 70% vault exposure.
2. **$M_{\text{RWA}}$ (Ondo USDY US Treasury Reserve)**: $\Omega_{\text{RWA}} = \infty$. Functions as an unconstrained, risk-free liquidity sink.

### 3.3 Morpho Dual-Queue Routing Mechanics

```
                           CAPITAL FLOW TOPOLOGY
                           
Deposit (Supply Queue):     [Assets] ──► [M_RHEA (Up to Cap Ω)] ──► [M_RWA (Overflow)]
Withdrawal (Withdraw Queue): [Assets] ◄── [M_RWA (Buffer Reserve)] ◄── [M_RHEA (Secondary)]
```

#### Algorithm 1: Morpho Supply Queue Allocation
When $a_{\text{in}}$ assets enter the vault:
$$\begin{aligned}
\text{Let } \mathcal{Q}_{\text{supply}} &= [M_{\text{RHEA}}, M_{\text{RWA}}] \\
\text{For each } M_i \in \mathcal{Q}_{\text{supply}}&: \\
\Delta_i &= \min\left(a_{\text{remaining}}, \Omega_i - C_i(t)\right) \\
C_i(t+1) &= C_i(t) + \Delta_i \\
a_{\text{remaining}} &\leftarrow a_{\text{remaining}} - \Delta_i \\
\text{Assert: } a_{\text{remaining}} &= 0
\end{aligned}$$

#### Algorithm 2: Morpho Withdraw Queue Liquidity Preservation
To ensure that depositors can exit instantly without triggering mass borrow liquidations or liquidity shortfalls in RHEA Lending, the withdrawal queue prioritizes the ultra-liquid RWA treasury reserve:
$$\begin{aligned}
\text{Let } \mathcal{Q}_{\text{withdraw}} &= [M_{\text{RWA}}, M_{\text{RHEA}}] \\
\text{For each } M_j \in \mathcal{Q}_{\text{withdraw}}&: \\
\Delta_j &= \min\left(a_{\text{to\_pull}}, C_j(t)\right) \\
C_j(t+1) &= C_j(t) - \Delta_j \\
a_{\text{to\_pull}} &\leftarrow a_{\text{to\_pull}} - \Delta_j \\
\text{Assert: } a_{\text{to\_pull}} &= 0
\end{aligned}$$

---

## 4. The Autonomous AI Public Allocator

Inspired by MetaMorpho's decoupled curation architecture, OmniYield introduces a permissionless on-chain execution interface:

```rust
pub fn reallocate(&mut self, allocations: Vec<AllocationInput>);
```

### 4.1 Rebalance Invariant Conditions
A reallocation proposal submitted by any entity is accepted if and only if:
1. $\sum_{i} \text{allocations}[i] = A_t$ (Exact conservation of total capital).
2. $\forall i, \quad \text{allocations}[i] \le \Omega_i$ (No market exceeds its curator-defined cap).
3. The caller is authorized by the governance role or matches the registered **AI Allocator Keeper** contract.

### 4.2 Algorithmic Spread Decision Policy
The off-chain AI Allocator monitors annualized lending benchmarks and triggers reallocation under the following formal policy:

Let $R_{\text{RHEA}}(t)$ be the real-time variable supply APY on RHEA, and $R_{\text{RWA}}$ be the risk-free rate of Ondo USDY. Let $\theta_{\text{spread}} = 100 \text{ bps} = 0.0100$ and $\theta_{\text{hysteresis}} = 0.02 \cdot A_t$.

$$\text{Action Policy } \pi(t) = \begin{cases}
\text{Saturate } M_{\text{RHEA}} \text{ to } \Omega_{\text{RHEA}}, & \text{if } R_{\text{RHEA}}(t) > R_{\text{RWA}} + \theta_{\text{spread}} \\
\text{Rotate } 90\% \text{ to } M_{\text{RWA}}, & \text{if } R_{\text{RHEA}}(t) \le R_{\text{RWA}} \\
\text{Hold State}, & \text{otherwise}
\end{cases}$$

This ensures that during high-utilization borrowing regimes, the vault captures top-tier DeFi yields (10% to 14%), but automatically retreats into risk-free US Treasury bonds (4.5% to 5.2%) when borrow demand contracts.

---

## 5. Chain Abstraction & Universal Settlement (NEAR Intents)

OmniYield removes all user-facing bridge interaction through the **NEAR Intents** framework.

```
+───────────────────────────────────────────────────────────────────────────+
|                     CROSS-CHAIN INTENT EXECUTION CYCLE                    |
+───────────────────────────────────────────────────────────────────────────+
  1. User (Arbitrum) signs intent: [Deposit 1,000 USDC -> Mint NUSD]
  2. Solvers compete in an off-chain Dutch auction to satisfy the intent.
  3. Winning Solver pre-funds 1,000 USDC on NEAR to `intents.near`.
  4. Vault contract verifies atomic settlement and mints NUSD to user account.
  5. User later submits withdrawal intent: [Burn 1,000 NUSD -> Payout on Solana].
  6. Solver transfers 1,048 USDC to user's Solana address.
  7. Vault releases escrowed assets to Solver on NEAR upon cryptographic proof.
+───────────────────────────────────────────────────────────────────────────+
```

* **Zero Slippage**: User intent specifies the exact output bound. Partial fills and adverse MEV slippage are structurally impossible.
* **Gas Abstraction**: The depositor only needs the asset they wish to deposit. Solvers handle gas sponsorship across all interacting chains.

---

## 6. Threat Modeling & Risk Mitigation

| Attack Vector | Vulnerability Description | OmniYield Mitigation Mechanism |
| :--- | :--- | :--- |
| **First-Depositor Inflation** | Attacker deposits 1 wei, donates \$10k assets, and manipulates share pricing to round down subsequent deposits to zero. | **Virtual Decimal Offset ($\delta = 10^6$)**: Mathematical invariant anchors early pricing to \$1.000000. |
| **Borrower Liquidity Crunch** | Sudden surge in borrower utilization locks 100% of lending assets, freezing user withdrawals. | **Withdraw Queue Prioritization**: Liquidations always exit via the unencumbered **Ondo RWA Treasury Reserve first**. |
| **Single-Market Insolvency** | Bad debt or exploit occurs in the underlying lending protocol. | **Supply Caps Isolation ($\le 70\%$)**: 30% to 100% of capital remains insulated in segregated US Treasuries. |
| **Stablecoin De-peg Event** | Underlying asset deviates from peg (e.g. historical USDC \$0.88 deviation). | **De-peg Shield**: Automated oracles monitor Curve/Uniswap balance; if deviation $>1.5\%$ persists, AI keeper shifts funds to fallback collateral. |
| **Malicious Curator Risk Escalation** | Rogue or compromised curator dramatically inflates supply cap on an exploit-vulnerable market. | **24h Security Timelock + Guardian Veto**: Cap increases enforce $\Delta t \ge 86,400\text{ s}$ delay. Guardian has unilateral instantaneous veto. |
| **Zero-Day Market Exploit** | An underlying lending market suffers an active exploit or smart contract drain. | **Guardian Emergency Circuit Breaker**: Instantaneous on-chain pause freezes market allocations and sets cap to zero immediately. |

---

### 6.1 MetaMorpho 4-Role Decoupled Governance Matrix

OmniYield eliminates all single points of governance failure by decoupling operational responsibilities into a strict 4-role permission matrix:

$$\mathcal{R} = \{\text{Owner}, \text{Curator}, \text{Allocator}, \text{Guardian}\}$$

1. **Owner ($\mathcal{O}$)**: A decentralized DAO multi-signature account possessing authority to rotate roles and configure global protocol boundaries. Cannot withdraw depositor principal or bypass algorithmic allocations.
2. **Curator ($\mathcal{C}$)**: Professional risk assessment firm (e.g., Steakhouse Financial) tasked with establishing market-level risk parameters:
   $$\Omega_k \in \mathbb{R}_{\ge 0} \quad (\text{Supply Cap for market } k), \quad \mathcal{Q}_{\text{supply}}, \quad \mathcal{Q}_{\text{withdraw}}$$
3. **Allocator ($\mathcal{A}$)**: Automated off-chain AI keeper constrained strictly within curator bounds:
   $$\sum_k a_k = A_t \quad \text{subject to} \quad a_k \le \Omega_k \quad \forall k$$
4. **Guardian ($\mathcal{G}$)**: Real-time autonomous security watchtower and multi-signature security council empowered with two unilateral emergency functions:
   - **Veto Power**: $\text{cancel\_supply\_cap\_change}(k)$ unconditionally revokes pending timelock proposals.
   - **Circuit Breaker**: $\text{emergency\_pause\_market}(k)$ instantly halts capital inflow and sets $\Omega_k \leftarrow 0$.

---

## 7. Tokenomics & Protocol Revenue Flywheel

OmniYield operates with transparent on-chain cash-flow fundamentals:

```
                              PROTOCOL CASH-FLOW ENGINE
                              
           Total Managed Assets ($50M TVL)
                         │
                         ├──► 0.50% Management Fee ──────► $250,000 / year
                         ├──► 10.0% Performance Fee ────► $600,000 / year
                         └──► 0.02% Cross-Chain Inflow ──► $100,000 / year
                                         │
                         ┌───────────────┴───────────────┐
                         ▼                               ▼
               60% Buyback & Burn              40% Insurance Reserve
         (Value accrual for governance)     (Protocol emergency backstop)
```

1. **Protocol Revenue Generation**:
   * **Management Fee**: 0.50% per annum assessed continuously on gross assets.
   * **Performance Fee**: 10.0% levied strictly on net accrued yield exceeding the RWA hurdle rate.
   * **Intent Clearance Spread**: 2 bps fee on atomic cross-chain solver settlement.
2. **Value Capture**:
   * **60% to Market Buyback & Distribution**: Deployed to acquire governance tokens and distribute real yield to long-term lockers.
   * **40% to Protocol Insurance Reserve**: Deposited into an on-chain, multi-signature safety module to serve as a backstop against unexpected shortfalls.

### 7.3 Institutional Tri-Safe Governance Architecture
To eliminate single points of failure (SPOF) and private key leakage risks, OmniYield implements a **Tri-Safe Multi-Sig Matrix**:
1. **Protocol Security Safe (`security.omniyield.sputnik-dao.near`)**: Governs code upgrades, market socket whitelisting, and emergency circuit breakers with a 4-of-7 threshold and mandatory 24-hour on-chain timelock.
2. **DAO Financial Treasury Safe (`treasury.omniyield.sputnik-dao.near`)**: Receives all protocol management and performance fees; manages ecosystem grants and liquidity reserves with a 3-of-5 threshold.
3. **Base & Cross-Chain Dispatcher Safe (`base-dispatcher.omniyield.sputnik-dao.near`)**: Leverages NEAR Chain Signatures (MPC `v1.signer`) to remotely orchestrate liquidity rebalancing and RWA settlements on external networks (e.g., Base, Arbitrum) without maintaining separate external seed phrases.

*(For detailed architectural specifications, see `docs/TRI_SAFE_MULTISIG_GOVERNANCE_ARCHITECTURE.md`)*.

---

## 8. Implementation & Verification

The core contracts have been engineered with production-grade modularity:
* **Repository**: `contracts/src/lib.rs`, `market.rs`, `events.rs`
* **Compilation Target**: `wasm32-unknown-unknown`
* **Test Suite**: 100% passing unit tests covering initialization, Morpho queue prioritization, cap saturation, yield compounding, and allocator execution.
* **Standard Compatibility**: Full adherence to **NEP-141**, **NEP-148**, **NEP-297**, and semantic parity with **ERC-4626**.

---

## 9. Conclusion

OmniYield represents a paradigm shift in decentralized capital efficiency. By transplanting the modular risk governance of Morpho into the chain-abstracted landscape of the NEAR Protocol, OmniYield transforms fragmented stablecoin capital into a dynamic, institutional-grade monetary instrument: **`NUSD`**. With automated dual-queue routing between RHEA Lending and US Treasuries, zero-bridge cross-chain intent settlement, and strict cryptographic supply caps, OmniYield delivers an unstoppable, secure, and world-class foundation for the next era of multi-chain finance.

---

## References

1. **Adams, H., et al.** (2021). *Uniswap v3 Core*. Uniswap Labs.
2. **Frambot, P., et al.** (2023). *Morpho Blue: The Minimalist and Immutable Lending Protocol*. Morpho Labs.
3. **Frambot, P., et al.** (2023). *MetaMorpho: Non-Custodial Risk Management on Morpho Blue*. Morpho Labs.
4. **Skidanov, A., & Polosukhin, I.** (2019). *NEAR Protocol: A Decentralized Application Platform*. NEAR Protocol.
5. **Ethena Labs.** (2024). *Ethena: Synthetic Dollar Protocol Specification*.
6. **Ondo Finance.** (2023). *Ondo Short-Term US Government Bond Fund (USDY) Technical Framework*.
7. **Ethereum Improvement Proposals.** (2022). *ERC-4626: Tokenized Vault Standard*. EIP-4626.

