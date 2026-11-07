use near_sdk::json_types::U128;
use near_sdk::near;
use near_sdk::AccountId;

use crate::types::MarketId;

/// Configuration and state for an isolated underlying yield market, inspired by Morpho Blue.
#[near(serializers = [borsh, json])]
#[derive(Clone, Debug, PartialEq)]
pub struct Market {
    pub id: MarketId,
    pub name: String,
    /// AccountId of the protocol adapter or underlying pool (e.g. "burrow.near")
    pub adapter_id: AccountId,
    /// Maximum capital allocation cap for risk containment (in base asset units)
    pub supply_cap: U128,
    /// Current allocated capital in this market
    pub current_allocation: U128,
    /// Annualized percentage yield in basis points (e.g. 1388 = 13.88%)
    pub current_apy_bps: u32,
    /// Operational status
    pub is_active: bool,
    /// Priority tier
    pub priority: u8,
}

impl Market {
    pub fn new(
        id: MarketId,
        name: String,
        adapter_id: AccountId,
        supply_cap: u128,
        initial_apy_bps: u32,
        priority: u8,
    ) -> Self {
        Self {
            id,
            name,
            adapter_id,
            supply_cap: U128(supply_cap),
            current_allocation: U128(0),
            current_apy_bps: initial_apy_bps,
            is_active: true,
            priority,
        }
    }

    /// Calculate available capacity before reaching the Morpho supply cap
    pub fn available_capacity(&self) -> u128 {
        if !self.is_active || self.current_allocation.0 >= self.supply_cap.0 {
            0
        } else {
            self.supply_cap.0 - self.current_allocation.0
        }
    }

    /// Add capital to this market, capped by available room
    pub fn allocate(&mut self, amount: u128) -> u128 {
        let capacity = self.available_capacity();
        let to_add = std::cmp::min(amount, capacity);
        self.current_allocation = U128(self.current_allocation.0 + to_add);
        to_add
    }

    /// Pull capital from this market for withdrawals
    pub fn deallocate(&mut self, amount: u128) -> u128 {
        let to_pull = std::cmp::min(amount, self.current_allocation.0);
        self.current_allocation = U128(self.current_allocation.0 - to_pull);
        to_pull
    }
}
