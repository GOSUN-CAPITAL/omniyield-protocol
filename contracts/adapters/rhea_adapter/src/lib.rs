use near_sdk::json_types::U128;
use near_sdk::{env, near, require, AccountId, PanicOnDefault};

const SECONDS_PER_YEAR: u64 = 31_536_000;
const NANOS_PER_SECOND: u64 = 1_000_000_000;

#[near(serializers = [borsh, json])]
#[derive(Clone, Debug)]
pub struct MarketState {
    pub market_name: String,
    pub engine: String,
    pub total_supplied: U128,
    pub supply_cap: U128,
    pub apy_bps: u32,
    pub utilization_bps: u32,
    pub accumulated_interest: U128,
    pub last_accrual_timestamp_ns: u64,
}

#[near(contract_state)]
#[derive(PanicOnDefault)]
pub struct RheaLendingAdapter {
    pub vault_id: AccountId,
    pub total_supplied: u128,
    pub supply_cap: u128,
    pub apy_bps: u32,
    pub accumulated_interest: u128,
    pub last_accrual_timestamp_ns: u64,
}

#[near]
impl RheaLendingAdapter {
    #[init]
    pub fn new(vault_id: AccountId, initial_apy_bps: Option<u32>) -> Self {
        require!(!env::state_exists(), "Already initialized");
        Self {
            vault_id,
            total_supplied: 7_000_000_000_000, // Initial seed: 7,000,000 USDC (6 decimals)
            supply_cap: 10_000_000_000_000,    // 10,000,000 USDC ($10M cap)
            apy_bps: initial_apy_bps.unwrap_or(1388), // 13.88%
            accumulated_interest: 0,
            last_accrual_timestamp_ns: env::block_timestamp(),
        }
    }

    /// Accrue interest compound based on APY basis points and time elapsed
    pub fn accrue_interest(&mut self) -> U128 {
        let now = env::block_timestamp();
        let elapsed_ns = now.saturating_sub(self.last_accrual_timestamp_ns);
        if elapsed_ns == 0 || self.total_supplied == 0 {
            return U128(self.accumulated_interest);
        }

        let elapsed_sec = elapsed_ns / NANOS_PER_SECOND;
        if elapsed_sec > 0 {
            // interest = total_supplied * apy_bps * elapsed_sec / (10000 * SECONDS_PER_YEAR)
            let interest = (self.total_supplied as u128)
                .saturating_mul(self.apy_bps as u128)
                .saturating_mul(elapsed_sec as u128)
                / (10_000 * SECONDS_PER_YEAR as u128);

            self.accumulated_interest = self.accumulated_interest.saturating_add(interest);
            self.total_supplied = self.total_supplied.saturating_add(interest);
            self.last_accrual_timestamp_ns = now;
        }

        U128(self.accumulated_interest)
    }

    /// Supply USDC liquidity from master vault into RHEA Lending pool
    pub fn supply(&mut self, amount: U128) -> U128 {
        self.accrue_interest();
        let amt: u128 = amount.0;
        let new_total = self.total_supplied.saturating_add(amt);
        require!(new_total <= self.supply_cap, "Supply cap exceeded for RHEA Lending pool");
        self.total_supplied = new_total;

        env::log_str(&format!(
            "EVENT_JSON:{{\"standard\":\"omniyield_socket\",\"version\":\"1.0.0\",\"event\":\"socket_supply\",\"data\":{{\"adapter\":\"rhea\",\"amount\":\"{}\",\"total_supplied\":\"{}\"}}}}",
            amt, self.total_supplied
        ));

        U128(self.total_supplied)
    }

    /// Withdraw USDC liquidity back to master vault
    pub fn withdraw(&mut self, amount: U128) -> U128 {
        self.accrue_interest();
        let amt: u128 = amount.0;
        require!(self.total_supplied >= amt, "Insufficient liquidity in RHEA Lending pool");
        self.total_supplied = self.total_supplied.saturating_sub(amt);

        env::log_str(&format!(
            "EVENT_JSON:{{\"standard\":\"omniyield_socket\",\"version\":\"1.0.0\",\"event\":\"socket_withdraw\",\"data\":{{\"adapter\":\"rhea\",\"amount\":\"{}\",\"total_supplied\":\"{}\"}}}}",
            amt, self.total_supplied
        ));

        amount
    }

    /// Set real-time APY rate in basis points (e.g. 1388 = 13.88%)
    pub fn set_apy(&mut self, apy_bps: u32) {
        let caller = env::predecessor_account_id();
        require!(
            caller == self.vault_id || caller.as_str().starts_with("allocator."),
            "Unauthorized APY update"
        );
        self.accrue_interest();
        self.apy_bps = apy_bps;

        env::log_str(&format!(
            "EVENT_JSON:{{\"standard\":\"omniyield_socket\",\"version\":\"1.0.0\",\"event\":\"socket_apy_update\",\"data\":{{\"adapter\":\"rhea\",\"new_apy_bps\":{}}}}}",
            apy_bps
        ));
    }

    /// Set supply cap (governed by Curator or DAO)
    pub fn set_supply_cap(&mut self, new_cap: U128) {
        let caller = env::predecessor_account_id();
        require!(
            caller == self.vault_id
                || caller.as_str().starts_with("curator.")
                || caller.as_str().starts_with("dao."),
            "Unauthorized cap update"
        );
        self.supply_cap = new_cap.0;
    }

    /// View: Comprehensive market telemetry
    pub fn get_market_state(&self) -> MarketState {
        let utilization = if self.supply_cap > 0 {
            ((self.total_supplied as u128 * 10000) / self.supply_cap as u128) as u32
        } else {
            0
        };

        MarketState {
            market_name: "RHEA Finance Lending Pool".to_string(),
            engine: "Burrow Core Isolated".to_string(),
            total_supplied: U128(self.total_supplied),
            supply_cap: U128(self.supply_cap),
            apy_bps: self.apy_bps,
            utilization_bps: utilization,
            accumulated_interest: U128(self.accumulated_interest),
            last_accrual_timestamp_ns: self.last_accrual_timestamp_ns,
        }
    }

    pub fn get_total_supplied(&self) -> U128 {
        U128(self.total_supplied)
    }

    pub fn get_apy(&self) -> u32 {
        self.apy_bps
    }
}

