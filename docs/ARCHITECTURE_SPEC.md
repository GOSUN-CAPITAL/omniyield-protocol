# Technical Architecture & Specification
> **OmniYield Protocol (`NUSD`) Engineering Specification**  
> *Targeted Runtime: NEAR Protocol (WASM32) | Reference Architecture: MetaMorpho (ERC-4626)*

---

## 1. Smart Contract Architecture (Rust)

The core contract is implemented in Rust using `near-sdk-rs v5.x` and compiled to `wasm32-unknown-unknown`. It provides dual-standard compatibility:

```
                               ┌──────────────────────────────────────────────────────────┐
                               │                    OmniYieldVault                        │
                               └────────────────────────────┬─────────────────────────────┘
                                                            │
                     ┌──────────────────────────────────────┴─────────────────────────────────────┐
                     ▼                                                                            ▼
        [External Interface: NEP-141]                                                [Internal Engine: ERC-4626]
        • ft_transfer                                                                • deposit(assets) -> shares
        • ft_balance_of                                                              • withdraw(shares) -> assets
        • ft_total_supply                                                            • total_assets() -> u128
        • ft_metadata (Symbol: "NUSD", Decimals: 6)                                  • convert_to_shares / assets
                     │                                                                            │
                     └──────────────────────────────────────┬─────────────────────────────────────┘
                                                            │
                                                            ▼
                                        ┌───────────────────────────────────────┐
                                        │       Morpho Queue Allocator          │
                                        │  • Supply Queue: [RHEA -> RWA]        │
                                        │  • Withdraw Queue: [RWA -> RHEA]      │
                                        │  • Dynamic Supply Caps Enforced       │
                                        └───────────────────────────────────────┘
```

---

## 2. Mathematical Models & Queue Routing Algorithms

### 2.1 ERC-4626 Share Calculation (Anti-Inflation Attack)
To prevent the classic first-depositor inflation attack (ERC-4626 front-running vulnerability), OmniYield utilizes a virtual offset constant ($10^6$ for 6-decimal USDC):

$$\text{shares\_to\_mint} = \frac{\text{assets} \times (\text{total\_shares} + 10^6)}{\text{total\_assets} + 10^6}$$

$$\text{assets\_to\_withdraw} = \frac{\text{shares} \times (\text{total\_assets} + 10^6)}{\text{total\_shares} + 10^6}$$

### 2.2 Morpho Supply Queue Allocation Algorithm
When a deposit occurs:
```rust
let mut remaining = assets;
for market_id in &self.supply_queue {
    if remaining == 0 { break; }
    let market = self.markets.get_mut(market_id);
    let available_cap = market.supply_cap - market.current_allocation;
    if available_cap > 0 {
        let to_allocate = min(remaining, available_cap);
        market.current_allocation += to_allocate;
        remaining -= to_allocate;
    }
}
assert_eq!(remaining, 0, "Deposit exceeds aggregate capacity");
```

### 2.3 Morpho Withdraw Queue Routing Algorithm
When a withdrawal occurs:
```rust
let mut remaining = assets_to_withdraw;
for market_id in &self.withdraw_queue {
    if remaining == 0 { break; }
    let market = self.markets.get_mut(market_id);
    if market.current_allocation > 0 {
        let to_pull = min(remaining, market.current_allocation);
        market.current_allocation -= to_pull;
        remaining -= to_pull;
    }
}
assert_eq!(remaining, 0, "Insufficient liquidity in withdraw queue");
```
* **Critical Innovation**: The withdraw queue checks the **Ondo RWA Buffer first**, ensuring 100% of standard withdrawals do not call or liquidate active borrow lines in RHEA Lending.

---

## 3. NEP Standards Compliance Matrix

| Standard | Status | Implementation Details |
| :--- | :--- | :--- |
| **NEP-141** (Fungible Token) | Full Compliance | Implements `ft_transfer`, `ft_total_supply`, `ft_balance_of`. Emits standard transfer events. |
| **NEP-148** (Token Metadata) | Full Compliance | Name: "NEAR Yield Dollar", Symbol: "NUSD", Decimals: 6, Icon SVG hosted. |
| **NEP-297** (Event Standard) | Full Compliance | Structured JSON logging for `omniflow_deposit`, `omniflow_withdraw`, `omniflow_reallocate`, and `omniflow_yield_accrued`. |
| **ERC-4626** (Vault Standard) | Semantic Mapping | Canonical mathematical equivalents mapped into Rust entrypoints for cross-chain aggregator indexing. |

---

## 4. AI Public Allocator & Keeper Architecture

The Public Allocator runs off-chain in `/services/src/allocator.ts` and acts as an autonomous keeper:
1. **Oracle Feed Ingestion**: Connects to RHEA Burrow Oracle (for dynamic borrow utilization and lending rates) and Ondo Treasury Oracle (for risk-free baseline).
2. **Rebalance Trigger Condition**:
   $$\text{Spread} = APY_{\text{RHEA}} - APY_{\text{RWA}}$$
   * If $\text{Spread} > +1.0\%$: Squeeze high-yield queue up to curator cap (70%).
   * If $\text{Spread} \le 0\%$: Defensive rotation to 90% RWA buffer.
3. **Execution**: Issues signed on-chain `reallocate(allocations)` transaction to `omniflow-vault.near`.

---

## 5. Morpho Governance Matrix, Timelock, and Guardian Specification

OmniYield adheres to the audited **MetaMorpho Governance & Security Standard**:

### 5.1 The 4-Role Matrix
| Role | Identity / Access | Permissions & Scope | Security Constraints |
| :--- | :--- | :--- | :--- |
| **Owner** | Multi-sig / DAO | Rotates Curator, Allocator, and Guardian; configures Timelock delay. | Subject to multisig governance. |
| **Curator** | Risk Advisory Entity (e.g. Steakhouse / Block Analitica) | Sets market supply caps and queue order. | Risk increases (`new_cap > old_cap`) enforced by Timelock. |
| **Allocator** | AI Off-chain Keeper (`allocator.ts`) | Executes `reallocate()` within curator limits. | Cannot bypass caps or withdraw funds. |
| **Guardian** | Automated Security Watchtower & Security Council | Has instant **VETO** over pending cap changes; triggers **Emergency Pause** / circuit breaker. | Immediate execution, cannot steal user funds. |

### 5.2 Timelock State Transition & Security Invariant
1. **Immediate Risk Mitigation (De-escalation)**:
   $$\text{new\_cap} \le \text{old\_cap} \implies \text{executed immediately}$$
2. **Timelocked Risk Escalation**:
   $$\text{new\_cap} > \text{old\_cap} \implies \text{requires } \Delta t \ge 86,400\text{ s (24 hours)}$$
   - Curator calls `submit_supply_cap_change(market_id, new_cap)`.
   - Emits `omniflow_timelock_submitted`.
   - During the 24-hour window, users can withdraw with zero slippage if they disagree with the risk profile change.
   - Guardian can call `cancel_supply_cap_change(market_id)` to veto malicious or risky proposals.
   - After $\Delta t$ expires, `execute_supply_cap_change(market_id)` updates the active cap.
3. **Emergency Circuit Breaker**:
   - Guardian calls `emergency_pause_market(market_id)` to instantaneously set `supply_cap = 0` and `is_active = false`.
   - Prevents further capital inflow into compromised or volatile sub-markets.


