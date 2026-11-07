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
