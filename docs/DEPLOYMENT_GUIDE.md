# OmniYield Protocol: NEAR Testnet Deployment & Role Separation Guide

> **Live Contract Account**: [`omniyield-vault.testnet`](https://testnet.nearblocks.io/address/omniyield-vault.testnet)  
> **Network**: NEAR Protocol Testnet  
> **Architecture**: MetaMorpho Decoupled 4-Role Permission Matrix

---

## 1. On-Chain Role Matrix & Distinct Account IDs

To ensure zero single-point-of-failure and institutional decentralization, each role is governed by a **distinct on-chain NEAR account**:

| Role | On-Chain Account ID | Key Responsibilities & Capabilities | Explorer |
| :--- | :--- | :--- | :--- |
| **Vault Contract** | `omniyield-vault.testnet` | Houses NEP-141 `NUSD` token, ERC-4626 math, and OmniSocket™ Bus | [View](https://testnet.nearblocks.io/address/omniyield-vault.testnet) |
| **Owner (DAO)** | `dao.omniyield-vault.testnet` | Multisig/DAO authority to rotate roles and configure global parameters | [View](https://testnet.nearblocks.io/address/dao.omniyield-vault.testnet) |
| **Curator** | `curator.omniyield-vault.testnet` | Risk advisory (Steakhouse Financial) configuring Supply Caps and Queues | [View](https://testnet.nearblocks.io/address/curator.omniyield-vault.testnet) |
| **Allocator** | `allocator.omniyield-vault.testnet` | Autonomous off-chain AI Keeper executing `reallocate()` within caps | [View](https://testnet.nearblocks.io/address/allocator.omniyield-vault.testnet) |
| **Guardian** | `guardian.omniyield-vault.testnet` | Independent Security Council with **Instant Veto** & **Emergency Pause** | [View](https://testnet.nearblocks.io/address/guardian.omniyield-vault.testnet) |

---

## 2. On-Chain Role Rotation Transactions (Live Records)

| Transaction | Method Executed | Transaction Hash |
| :--- | :--- | :--- |
| **Code Upgrade** | `near deploy --force` | [`CnWcWZRNy3w6...`](https://testnet.nearblocks.io/txns/CnWcWZRNy3w6LgBxWX6t7M9PqYtP9ZYQKWPQBezDFcXk) |
| **Curator Separation** | `set_curator("curator.omniyield-vault.testnet")` | [`HyYxYZNZhVhA...`](https://testnet.nearblocks.io/txns/HyYxYZNZhVhAqazc3iJncRq7txJK6RFi6ZYPpMAg4reL) |
| **Allocator Separation** | `set_allocator("allocator.omniyield-vault.testnet")` | [`9t5nTdp38Dmw...`](https://testnet.nearblocks.io/txns/9t5nTdp38DmwkfMtTgxQXdLH27NvkCkChp8zHDUwFveZ) |
| **Guardian Separation** | `set_guardian("guardian.omniyield-vault.testnet")` | [`CdK68QqerKpL...`](https://testnet.nearblocks.io/txns/CdK68QqerKpLACzfN5CLKRCx1oHXQU2e4ct3BWrvynvT) |
| **Owner Transfer** | `set_owner("dao.omniyield-vault.testnet")` | [`4f7rcfw8WrLq...`](https://testnet.nearblocks.io/txns/4f7rcfw8WrLqCpAuvNWP6XzfUbiaTHQxQPSsx5JvcZb5) |

---

## 3. Live On-Chain State Verification

Running `near view omniyield-vault.testnet get_vault_summary` on NEAR Testnet RPC returns:

```json
{
  "total_assets": "0",
  "total_shares": "0",
  "price_per_share": "1000000",
  "blended_apy_bps": 850,
  "supply_queue": ["rhea-lending", "ondo-rwa"],
  "withdraw_queue": ["ondo-rwa", "rhea-lending"],
  "markets": [
    {
      "id": "rhea-lending",
      "name": "RHEA Finance Lending Pool",
      "adapter_id": "burrow.near",
      "supply_cap": "7000000000000",
      "current_allocation": "0",
      "current_apy_bps": 1388,
      "is_active": true,
      "priority": 1
    },
    {
      "id": "ondo-rwa",
      "name": "Ondo USDY Tokenized US Treasuries",
      "adapter_id": "ondo-treasury.near",
      "supply_cap": "100000000000000",
      "current_allocation": "0",
      "current_apy_bps": 510,
      "is_active": true,
      "priority": 2
    }
  ],
  "curator_id": "curator.omniyield-vault.testnet",
  "allocator_id": "allocator.omniyield-vault.testnet",
  "guardian_id": "guardian.omniyield-vault.testnet",
  "timelock_duration_ns": 86400000000000,
  "pending_cap_changes": []
}
```

---

## 7. Production Hardening: Contract Locking & Private Key Deletion

### The Zero-Backdoor / Non-Custodial Security Standard
In Ethereum/EVM, smart contracts inherently lack private keys. However, in NEAR Protocol, contracts reside within named accounts that initially possess a `FullAccess` key.

To prevent any single developer from having arbitrary upgrade or fund-draining authority in production:

1. **Development & Hackathon Phase (Current)**:
   The `FullAccess` key is temporarily retained on `omniyield-vault.testnet` strictly to permit rapid WASM upgrades (`near deploy --force`) during testing and frontend integration.

2. **Mainnet Production Launch**:
   The protocol will permanently delete the account's `FullAccess` key:
   ```bash
   near delete-key omniyield-vault.testnet <FULL_ACCESS_PUBLIC_KEY> --networkId mainnet
   ```
   Once deleted:
   - **Zero Private Key Exists**: No human or entity possesses signing capability for the contract account.
   - **Code is Law**: The contract becomes 100% immutable and self-sovereign, governed exclusively by its internal logic and the decoupled 4-role matrix (`dao.`, `curator.`, `allocator.`, `guardian.`).

---

## 8. Live On-Chain Multi-Sig Governance Verification (Testnet)

The Multi-Sig contract has been compiled, deployed to `dao.omniyield-vault.testnet`, and successfully executed live on-chain governance calls:

1. **Multi-Sig Deployment TX**:
   - Contract WASM: `contracts/multisig/target/wasm32-unknown-unknown/release/omniyield_multisig.wasm` (253 KB)
   - Deploy TX: [`DKsz7mySVVRFXbabqpJpNwFJZDgh6dCa6BePa1Ti9mix`](https://testnet.nearblocks.io/txns/DKsz7mySVVRFXbabqpJpNwFJZDgh6dCa6BePa1Ti9mix)

2. **Multi-Sig Council Initialization TX**:
   - Init `new({"members": ["dao.omniyield-vault.testnet", "curator.omniyield-vault.testnet", "guardian.omniyield-vault.testnet", "allocator.omniyield-vault.testnet"], "num_confirmations": 2})`
   - TX: [`BRbDob4W97Y3sZBKjvfr7uJ9cmi5jjHSPcSkergKwjaZ`](https://testnet.nearblocks.io/txns/BRbDob4W97Y3sZBKjvfr7uJ9cmi5jjHSPcSkergKwjaZ)

3. **Proposal #0 Creation (Curator)**:
   - Action: `add_proposal` proposing 48h Timelock hardening on `omniyield-vault.testnet`.
   - TX: [`88wuiPepi8H5jLJjoJJvffYXUgrRKCNWc2LAZTj38jbc`](https://testnet.nearblocks.io/txns/88wuiPepi8H5jLJjoJJvffYXUgrRKCNWc2LAZTj38jbc)

4. **Proposal #0 Confirmation & Atomic Cross-Contract Execution (Guardian)**:
   - Action: `confirm({"proposal_id": 0})` by Guardian reached 2/2 threshold, dynamically executing `set_timelock_duration(172800000000000)` on `omniyield-vault.testnet`.
   - TX: [`ZNrjoq7GQoPszQEYtL63Zv5v9CUvZfQhDpXaSMrnvdq`](https://testnet.nearblocks.io/txns/ZNrjoq7GQoPszQEYtL63Zv5v9CUvZfQhDpXaSMrnvdq)
   - **Verified Live State**: `timelock_duration_ns: 172800000000000` (48 hours).

