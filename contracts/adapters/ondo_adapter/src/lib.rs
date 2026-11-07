use near_sdk::json_types::U128;
use near_sdk::{env, near, require, AccountId, PanicOnDefault};

const SECONDS_PER_YEAR: u64 = 31_536_000;
const NANOS_PER_SECOND: u64 = 1_000_000_000;

#[near(serializers = [borsh, json])]
#[derive(Clone, Debug)]
pub struct ReserveState {
    pub reserve_name: String,
    pub asset: String,
    pub reserve_balance: U128,
    pub capacity: U128,
    pub apy_bps: u32,
    pub instant_redemption_available: U128,
    pub accumulated_yield: U128,
    pub last_accrual_timestamp_ns: u64,
}

#[near(contract_state)]
#[derive(PanicOnDefault)]
pub struct OndoReserveAdapter {
    pub vault_id: AccountId,
    pub reserve_balance: u128,
    pub capacity: u128,
    pub apy_bps: u32,
    pub accumulated_yield: u128,
    pub last_accrual_timestamp_ns: u64,
}

#[near]
impl OndoReserveAdapter {
    #[init]
    pub fn new(vault_id: AccountId, initial_apy_bps: Option<u32>) -> Self {
        require!(!env::state_exists(), "Already initialized");
        Self {
            vault_id,
            reserve_balance: 5_450_800_000_000, // Initial seed: 5,450,800 USDC (6 decimals)
            capacity: 100_000_000_000_000,      // $100M capacity
            apy_bps: initial_apy_bps.unwrap_or(510), // 5.10% US Treasuries
            accumulated_yield: 0,
            last_accrual_timestamp_ns: env::block_timestamp(),
        }
    }

    /// Accrue risk-free yield compound on US Treasury USDY reserves
    pub fn accrue_interest(&mut self) -> U128 {
        let now = env::block_timestamp();
        let elapsed_ns = now.saturating_sub(self.last_accrual_timestamp_ns);
        if elapsed_ns == 0 || self.reserve_balance == 0 {
            return U128(self.accumulated_yield);
        }

        let elapsed_sec = elapsed_ns / NANOS_PER_SECOND;
        if elapsed_sec > 0 {
            let yield_amt = (self.reserve_balance as u128)
                .saturating_mul(self.apy_bps as u128)
                .saturating_mul(elapsed_sec as u128)
                / (10_000 * SECONDS_PER_YEAR as u128);

            self.accumulated_yield = self.accumulated_yield.saturating_add(yield_amt);
            self.reserve_balance = self.reserve_balance.saturating_add(yield_amt);
            self.last_accrual_timestamp_ns = now;
        }

        U128(self.accumulated_yield)
    }

    /// Supply USDC to Ondo Treasury Reserve
    pub fn supply(&mut self, amount: U128) -> U128 {
        self.accrue_interest();
        let amt: u128 = amount.0;
        let new_total = self.reserve_balance.saturating_add(amt);
        require!(new_total <= self.capacity, "Ondo USDY reserve capacity exceeded");
        self.reserve_balance = new_total;

        env::log_str(&format!(
            "EVENT_JSON:{{\"standard\":\"omniyield_socket\",\"version\":\"1.0.0\",\"event\":\"socket_supply\",\"data\":{{\"adapter\":\"ondo\",\"amount\":\"{}\",\"reserve_balance\":\"{}\"}}}}",
            amt, self.reserve_balance
        ));

        U128(self.reserve_balance)
    }

    /// Instant redemption from liquidity buffer (Withdraw Queue Priority #1)
    pub fn instant_redeem(&mut self, amount: U128) -> U128 {
        self.accrue_interest();
        let amt: u128 = amount.0;
        require!(self.reserve_balance >= amt, "Insufficient buffer in Ondo USDY reserve");
        self.reserve_balance = self.reserve_balance.saturating_sub(amt);

        env::log_str(&format!(
            "EVENT_JSON:{{\"standard\":\"omniyield_socket\",\"version\":\"1.0.0\",\"event\":\"socket_instant_redeem\",\"data\":{{\"adapter\":\"ondo\",\"amount\":\"{}\",\"remaining_reserve\":\"{}\"}}}}",
            amt, self.reserve_balance
        ));

        amount
    }

    /// Set live US Treasuries APY rate (e.g. 510 = 5.10%)
    pub fn set_apy(&mut self, apy_bps: u32) {
        let caller = env::predecessor_account_id();
        require!(
            caller == self.vault_id || caller.as_str().starts_with("allocator."),
            "Unauthorized APY update"
        );
        self.accrue_interest();
        self.apy_bps = apy_bps;

        env::log_str(&format!(
            "EVENT_JSON:{{\"standard\":\"omniyield_socket\",\"version\":\"1.0.0\",\"event\":\"socket_apy_update\",\"data\":{{\"adapter\":\"ondo\",\"new_apy_bps\":{}}}}}",
            apy_bps
        ));
    }

    /// View: Comprehensive Ondo Reserve state
    pub fn get_reserve_state(&self) -> ReserveState {
        ReserveState {
            reserve_name: "Ondo USDY Tokenized US Treasuries".to_string(),
            asset: "USDC / USDY".to_string(),
            reserve_balance: U128(self.reserve_balance),
            capacity: U128(self.capacity),
            apy_bps: self.apy_bps,
            instant_redemption_available: U128(self.reserve_balance),
            accumulated_yield: U128(self.accumulated_yield),
            last_accrual_timestamp_ns: self.last_accrual_timestamp_ns,
        }
    }

    pub fn get_reserve_balance(&self) -> U128 {
        U128(self.reserve_balance)
    }

    pub fn get_apy(&self) -> u32 {
        self.apy_bps
    }
}

