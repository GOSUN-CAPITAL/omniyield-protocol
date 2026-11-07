use near_sdk::json_types::U128;
use near_sdk::{env, near, require, AccountId, PanicOnDefault};

const SECONDS_PER_YEAR: u64 = 31_536_000;
const NANOS_PER_SECOND: u64 = 1_000_000_000;

#[near(serializers = [borsh, json])]
#[derive(Clone, Debug)]
pub struct GoldMarketState {
    pub asset_name: String,
    pub backing: String,
    pub total_supplied: U128,
    pub capacity: U128,
    pub apy_bps: u32,
    pub accumulated_appreciation: U128,
    pub last_accrual_timestamp_ns: u64,
}

#[near(contract_state)]
#[derive(PanicOnDefault)]
pub struct GoldAdapter {
    pub vault_id: AccountId,
    pub total_supplied: u128,
    pub capacity: u128,
    pub apy_bps: u32,
    pub accumulated_appreciation: u128,
    pub last_accrual_timestamp_ns: u64,
}

#[near]
impl GoldAdapter {
    #[init]
    pub fn new(vault_id: AccountId, initial_apy_bps: Option<u32>) -> Self {
        require!(!env::state_exists(), "Already initialized");
        Self {
            vault_id,
            total_supplied: 1_290_000_000_000, // Initial allocation: $1.29M (15% of All-Weather $8.6M)
            capacity: 30_000_000_000_000,       // $30M capacity
            apy_bps: initial_apy_bps.unwrap_or(1250), // 12.50% Gold appreciation & lending carry
            accumulated_appreciation: 0,
            last_accrual_timestamp_ns: env::block_timestamp(),
        }
    }

    /// Accrue gold appreciation & storage yield compounding
    pub fn accrue_interest(&mut self) -> U128 {
        let now = env::block_timestamp();
        let elapsed_ns = now.saturating_sub(self.last_accrual_timestamp_ns);
        if elapsed_ns == 0 || self.total_supplied == 0 {
            return U128(self.accumulated_appreciation);
        }

        let elapsed_sec = elapsed_ns / NANOS_PER_SECOND;
        if elapsed_sec > 0 {
            let gains = (self.total_supplied as u128)
                .saturating_mul(self.apy_bps as u128)
                .saturating_mul(elapsed_sec as u128)
                / (10_000 * SECONDS_PER_YEAR as u128);

            self.accumulated_appreciation = self.accumulated_appreciation.saturating_add(gains);
            self.total_supplied = self.total_supplied.saturating_add(gains);
            self.last_accrual_timestamp_ns = now;
        }

        U128(self.accumulated_appreciation)
    }

    /// Supply into tokenized physical gold
    pub fn supply(&mut self, amount: U128) -> U128 {
        self.accrue_interest();
        let amt: u128 = amount.0;
        let new_total = self.total_supplied.saturating_add(amt);
        require!(new_total <= self.capacity, "Gold reserve capacity exceeded");
        self.total_supplied = new_total;

        env::log_str(&format!(
            "EVENT_JSON:{{\"standard\":\"omniyield_socket\",\"version\":\"1.0.0\",\"event\":\"socket_supply\",\"data\":{{\"adapter\":\"gold\",\"amount\":\"{}\",\"total_supplied\":\"{}\"}}}}",
            amt, self.total_supplied
        ));

        U128(self.total_supplied)
    }

    /// Redeem gold back to USDC
    pub fn redeem(&mut self, amount: U128) -> U128 {
        self.accrue_interest();
        let amt: u128 = amount.0;
        require!(self.total_supplied >= amt, "Insufficient gold reserve balance to redeem");
        self.total_supplied = self.total_supplied.saturating_sub(amt);

        env::log_str(&format!(
            "EVENT_JSON:{{\"standard\":\"omniyield_socket\",\"version\":\"1.0.0\",\"event\":\"socket_redeem\",\"data\":{{\"adapter\":\"gold\",\"amount\":\"{}\",\"remaining_total\":\"{}\"}}}}",
            amt, self.total_supplied
        ));

        amount
    }

    /// Set dynamic gold appreciation rate (e.g. 1250 = 12.50%)
    pub fn set_apy(&mut self, apy_bps: u32) {
        let caller = env::predecessor_account_id();
        require!(
            caller == self.vault_id || caller.as_str().starts_with("allocator."),
            "Unauthorized APY update"
        );
        self.accrue_interest();
        self.apy_bps = apy_bps;

        env::log_str(&format!(
            "EVENT_JSON:{{\"standard\":\"omniyield_socket\",\"version\":\"1.0.0\",\"event\":\"socket_apy_update\",\"data\":{{\"adapter\":\"gold\",\"new_apy_bps\":{}}}}}",
            apy_bps
        ));
    }

    /// View: Market state
    pub fn get_market_state(&self) -> GoldMarketState {
        GoldMarketState {
            asset_name: "Tokenized Physical Gold (PAXG / Tether Gold)".to_string(),
            backing: "100% London Good Delivery Physical Gold Bars".to_string(),
            total_supplied: U128(self.total_supplied),
            capacity: U128(self.capacity),
            apy_bps: self.apy_bps,
            accumulated_appreciation: U128(self.accumulated_appreciation),
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

