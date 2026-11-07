use near_sdk::collections::UnorderedMap;
use near_sdk::require;

use crate::market::Market;
use crate::types::{AllocationInput, MarketId, DECIMAL_OFFSET};

pub struct MorphoVaultEngine;

impl MorphoVaultEngine {
    /// ERC-4626 Share calculation with Virtual Offset (\delta = 10^6) to immunize against inflation attacks
    pub fn convert_to_shares(assets: u128, total_assets: u128, total_shares: u128) -> u128 {
        if total_assets == 0 || total_shares == 0 {
            assets
        } else {
            (assets * (total_shares + DECIMAL_OFFSET)) / (total_assets + DECIMAL_OFFSET)
        }
    }

    /// ERC-4626 Asset calculation with Virtual Offset
    pub fn convert_to_assets(shares: u128, total_assets: u128, total_shares: u128) -> u128 {
        if total_shares == 0 {
            shares
        } else {
            (shares * (total_assets + DECIMAL_OFFSET)) / (total_shares + DECIMAL_OFFSET)
        }
    }

    /// Execute Morpho Supply Queue Routing: Prioritize high-yield queues up to caps, overflow cascades
    pub fn route_supply(
        assets: u128,
        supply_queue: &[MarketId],
        markets: &mut UnorderedMap<MarketId, Market>,
    ) {
        let mut remaining = assets;
        for market_id in supply_queue {
            if remaining == 0 {
                break;
            }
            if let Some(mut market) = markets.get(market_id) {
                if !market.is_active {
                    continue;
                }
                let allocated = market.allocate(remaining);
                if allocated > 0 {
                    markets.insert(market_id, &market);
                    remaining -= allocated;
                }
            }
        }

        require!(
            remaining == 0,
            "Deposit exceeds aggregated capacity across all supply queues"
        );
    }

    /// Execute Morpho Withdraw Queue Routing: Pull from ultra-liquid Treasury buffer first
    pub fn route_withdraw(
        assets_to_withdraw: u128,
        withdraw_queue: &[MarketId],
        markets: &mut UnorderedMap<MarketId, Market>,
    ) {
        let mut remaining = assets_to_withdraw;
        for market_id in withdraw_queue {
            if remaining == 0 {
                break;
            }
            if let Some(mut market) = markets.get(market_id) {
                if market.current_allocation.0 > 0 {
                    let pulled = market.deallocate(remaining);
                    if pulled > 0 {
                        markets.insert(market_id, &market);
                        remaining -= pulled;
                    }
                }
            }
        }

        require!(
            remaining == 0,
            "Insufficient liquid capital across withdraw queues to satisfy redemption"
        );
    }

    /// Verify reallocation invariant conditions before updating on-chain market allocations
    pub fn validate_and_apply_reallocation(
        allocations: &[AllocationInput],
        total_assets: u128,
        markets: &mut UnorderedMap<MarketId, Market>,
    ) {
        let mut sum_allocated: u128 = 0;

        for item in allocations {
            let mut market = markets
                .get(&item.market_id)
                .expect("Sub-market does not exist in registry");
            require!(market.is_active, "Target market is currently inactive");
            require!(
                item.amount.0 <= market.supply_cap.0,
                format!(
                    "Allocation for {} ({}) strictly exceeds supply cap ({})",
                    item.market_id, item.amount.0, market.supply_cap.0
                )
            );

            market.current_allocation = item.amount;
            markets.insert(&item.market_id, &market);
            sum_allocated += item.amount.0;
        }

        require!(
            sum_allocated == total_assets,
            format!(
                "Reallocation sum ({}) must strictly conserve total vault assets ({})",
                sum_allocated, total_assets
            )
        );
    }
}
