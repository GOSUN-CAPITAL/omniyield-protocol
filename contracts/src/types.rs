use near_sdk::json_types::U128;
use near_sdk::near;
use near_sdk::AccountId;

pub type MarketId = String;

/// Standard decimal precision offset for 6-decimal stablecoins (e.g. USDC)
pub const DECIMAL_OFFSET: u128 = 1_000_000;

/// Default dynamic supply cap for high-yield lending market (7,000,000 USDC)
pub const DEFAULT_RHEA_CAP: u128 = 7_000_000 * DECIMAL_OFFSET;

/// Buffer reserve cap for tokenized US Treasuries (100,000,000 USDC)
pub const DEFAULT_RWA_CAP: u128 = 100_000_000 * DECIMAL_OFFSET;

/// Standard Timelock duration for risk-increasing operations: 24 Hours in nanoseconds
pub const DEFAULT_TIMELOCK_DURATION_NS: u64 = 86_400_000_000_000;

/// Pending cap adjustment under timelock scrutiny
#[near(serializers = [borsh, json])]
#[derive(Clone, Debug, PartialEq)]
pub struct PendingCapChange {
    pub market_id: MarketId,
    pub proposed_cap: U128,
    pub submitted_at_ns: u64,
    pub executable_at_ns: u64,
}

/// Allocation command payload for the Morpho Public Allocator
#[near(serializers = [borsh, json])]
#[derive(Clone, Debug, PartialEq)]
pub struct AllocationInput {
    pub market_id: MarketId,
    pub amount: U128,
}

/// Comprehensive vault status summary for UI and institutional indexers
#[near(serializers = [borsh, json])]
#[derive(Clone, Debug)]
pub struct VaultSummary {
    pub total_assets: U128,
    pub total_shares: U128,
    pub price_per_share: U128, // Expressed with 6 decimals (1.000000 = 1_000_000)
    pub blended_apy_bps: u32,  // e.g. 1184 = 11.84%
    pub supply_queue: Vec<MarketId>,
    pub withdraw_queue: Vec<MarketId>,
    pub markets: Vec<crate::market::Market>,
    pub curator_id: AccountId,
    pub allocator_id: AccountId,
    pub guardian_id: AccountId,
    pub timelock_duration_ns: u64,
    pub pending_cap_changes: Vec<PendingCapChange>,
}

/// Morpho-standard Fee Configuration (Performance fee, Management fee, and recipients)
#[near(serializers = [borsh, json])]
#[derive(Clone, Debug, PartialEq)]
pub struct FeeConfig {
    pub performance_fee_bps: u32,
    pub management_fee_bps: u32,
    pub performance_fee_recipient: Option<AccountId>,
    pub management_fee_recipient: Option<AccountId>,
}

/// Multi-Curator Configuration & Risk Limit Specification (Veda Paradigm)
#[near(serializers = [borsh, json])]
#[derive(Clone, Debug, PartialEq)]
pub struct CuratorConfig {
    pub curator_id: AccountId,
    pub name: String,
    pub is_active: bool,
    pub max_allocation_cap: U128,        // Hard risk ceiling this curator is permitted to manage
    pub approved_markets: Vec<MarketId>, // Whitelisted strategy markets
    pub fee_share_bps: u32,              // Share of performance fee (e.g. 3000 bps = 30%)
    pub registered_at_block: u64,
}

/// Institutional Whitelabel Sub-Vault Specification
#[near(serializers = [borsh, json])]
#[derive(Clone, Debug, PartialEq)]
pub struct WhitelabelSubVault {
    pub sub_vault_id: String,                   // Unique identifier (e.g. "vault_steakhouse_usdc")
    pub name: String,                           // Display name (e.g. "Steakhouse USD Core Alpha")
    pub curator_id: AccountId,                  // Managing curator (e.g. "curator.omniyield-vault.testnet")
    pub distributor_partner_id: Option<String>, // Associated B2B distributor (e.g. "partner_phantom_alpha")
    pub total_assets: U128,                     // Total underlying assets in sub-vault
    pub total_shares: U128,                     // Total minted shares in sub-vault
    pub management_fee_bps: u32,                // Management fee in basis points (max 500 = 5%)
    pub performance_fee_bps: u32,               // Performance fee in basis points (max 3000 = 30%)
    pub fee_recipient: AccountId,               // Recipient of sub-vault fees
    pub allowed_markets: Vec<MarketId>,         // Whitelisted market IDs
    pub max_debt_ceiling: U128,                 // Maximum asset capacity (Debt Ceiling)
    pub is_paused: bool,                        // Emergency pause switch
    pub created_at_block: u64,
}
