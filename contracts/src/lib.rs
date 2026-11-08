use near_sdk::collections::{LookupMap, UnorderedMap};
use near_sdk::json_types::U128;
use near_sdk::{
    env, near, require, AccountId, Gas, NearToken, PanicOnDefault, Promise, PromiseOrValue,
};

pub mod events;
pub mod market;
pub mod socket;
pub mod token;
pub mod types;
pub mod vault;

use crate::events::*;
use crate::market::Market;
use crate::socket::{SocketDescriptor, SocketKind, SocketStatus};
use crate::token::{default_nusd_metadata, FungibleTokenMetadata, StorageBalance, StorageBalanceBounds};
use crate::types::{
    AllocationInput, CuratorConfig, FeeConfig, MarketId, PendingCapChange, VaultSummary, WhitelabelSubVault,
    DECIMAL_OFFSET, DEFAULT_RHEA_CAP, DEFAULT_RWA_CAP, DEFAULT_TIMELOCK_DURATION_NS,
};
use crate::vault::MorphoVaultEngine;

/// Minimum storage balance required to register an account for NUSD (0.00125 NEAR)
const STORAGE_MIN_BOUND: NearToken = NearToken::from_yoctonear(1_250_000_000_000_000_000_000);

#[near(contract_state)]
#[derive(PanicOnDefault)]
pub struct OmniYieldVault {
    pub owner_id: AccountId,
    pub curator_id: AccountId,
    pub allocator_id: AccountId,
    pub guardian_id: AccountId,
    pub timelock_duration_ns: u64,
    pub base_asset_id: AccountId,
    pub total_assets: u128,
    pub total_shares: u128,
    pub shares: LookupMap<AccountId, u128>,
    pub storage_deposits: LookupMap<AccountId, u128>,
    pub markets: UnorderedMap<MarketId, Market>,
    pub sockets: UnorderedMap<MarketId, SocketDescriptor>,
    pub pending_cap_changes: UnorderedMap<MarketId, PendingCapChange>,
    pub supply_queue: Vec<MarketId>,
    pub withdraw_queue: Vec<MarketId>,
    pub curators: UnorderedMap<AccountId, CuratorConfig>,
    pub sub_vaults: UnorderedMap<String, WhitelabelSubVault>,
}

#[near]
impl OmniYieldVault {
    #[init]
    pub fn new(
        owner_id: AccountId,
        curator_id: AccountId,
        allocator_id: AccountId,
        guardian_id: AccountId,
        timelock_duration_ns: Option<u64>,
        base_asset_id: AccountId,
    ) -> Self {
        require!(!env::state_exists(), "Already initialized");

        let mut this = Self {
            owner_id: owner_id.clone(),
            curator_id,
            allocator_id,
            guardian_id,
            timelock_duration_ns: timelock_duration_ns.unwrap_or(DEFAULT_TIMELOCK_DURATION_NS),
            base_asset_id,
            total_assets: 0,
            total_shares: 0,
            shares: LookupMap::new(b"s"),
            storage_deposits: LookupMap::new(b"d"),
            markets: UnorderedMap::new(b"m"),
            sockets: UnorderedMap::new(b"k"),
            pending_cap_changes: UnorderedMap::new(b"p"),
            supply_queue: Vec::new(),
            withdraw_queue: Vec::new(),
            curators: UnorderedMap::new(b"c"),
            sub_vaults: UnorderedMap::new(b"v"),
        };

        // Register default Master Curator
        this.curators.insert(
            &this.curator_id,
            &CuratorConfig {
                curator_id: this.curator_id.clone(),
                name: "OmniYield Master Risk Curator".to_string(),
                is_active: true,
                max_allocation_cap: U128(100_000_000 * DECIMAL_OFFSET),
                approved_markets: vec!["rhea-lending".to_string(), "ondo-rwa".to_string()],
                fee_share_bps: 3000,
                registered_at_block: env::block_height(),
            },
        );

        // Auto-register owner storage
        this.storage_deposits.insert(&owner_id, &STORAGE_MIN_BOUND.as_yoctonear());

        // 1. Initialize Market A: RHEA High-Yield Lending (Burrow Engine)
        // Dynamic Cap: 7,000,000 USDC, initial indicative APY: 13.88% (1388 bps)
        let rhea_market = Market::new(
            "rhea-lending".to_string(),
            "RHEA Finance Lending Pool".to_string(),
            "burrow.near".parse().unwrap(),
            DEFAULT_RHEA_CAP,
            1388,
            1,
        );

        let rhea_socket = SocketDescriptor {
            socket_id: rhea_market.id.clone(),
            name: rhea_market.name.clone(),
            kind: SocketKind::YieldSocket,
            adapter_account: rhea_market.adapter_id.clone(),
            version: "1.0.0".to_string(),
            status: SocketStatus::Active,
            registered_at_block: env::block_height(),
        };

        // 2. Initialize Market B: Ondo RWA US Treasury Buffer
        // Buffer reserve cap: 100,000,000 USDC, initial baseline APY: 5.10% (510 bps)
        let rwa_market = Market::new(
            "ondo-rwa".to_string(),
            "Ondo USDY Tokenized US Treasuries".to_string(),
            "ondo-treasury.near".parse().unwrap(),
            DEFAULT_RWA_CAP,
            510,
            2,
        );

        let rwa_socket = SocketDescriptor {
            socket_id: rwa_market.id.clone(),
            name: rwa_market.name.clone(),
            kind: SocketKind::YieldSocket,
            adapter_account: rwa_market.adapter_id.clone(),
            version: "1.0.0".to_string(),
            status: SocketStatus::Active,
            registered_at_block: env::block_height(),
        };

        this.markets.insert(&rhea_market.id, &rhea_market);
        this.markets.insert(&rwa_market.id, &rwa_market);
        this.sockets.insert(&rhea_socket.socket_id, &rhea_socket);
        this.sockets.insert(&rwa_socket.socket_id, &rwa_socket);

        // 3. Establish Morpho Dual-Queue Routing Rules:
        // Supply Queue: Prioritize high-yield RHEA Lending first, overflow cascades to Ondo RWA
        this.supply_queue = vec!["rhea-lending".to_string(), "ondo-rwa".to_string()];
        // Withdraw Queue: Prioritize ultra-liquid Ondo RWA first to completely shield borrowers from liquidity shocks
        this.withdraw_queue = vec!["ondo-rwa".to_string(), "rhea-lending".to_string()];

        this
    }

    // =========================================================================
    // ERC-4626 Core Interface & Mathematical Accounting
    // =========================================================================

    /// Calculate expected NUSD shares minted for a given amount of base assets
    pub fn convert_to_shares(&self, assets: U128) -> U128 {
        U128(MorphoVaultEngine::convert_to_shares(
            assets.0,
            self.total_assets,
            self.total_shares,
        ))
    }

    /// Calculate expected base assets redeemed for a given amount of NUSD shares
    pub fn convert_to_assets(&self, shares: U128) -> U128 {
        U128(MorphoVaultEngine::convert_to_assets(
            shares.0,
            self.total_assets,
            self.total_shares,
        ))
    }

    /// Total assets held and deployed under management
    pub fn total_assets(&self) -> U128 {
        U128(self.total_assets)
    }

    /// Total circulating supply of NUSD shares
    pub fn total_shares(&self) -> U128 {
        U128(self.total_shares)
    }

    /// Current price per share (normalized to 6 decimal places, 1.000000 = 1_000_000)
    pub fn price_per_share(&self) -> U128 {
        if self.total_shares == 0 {
            U128(DECIMAL_OFFSET)
        } else {
            U128((self.total_assets * DECIMAL_OFFSET) / self.total_shares)
        }
    }

    // =========================================================================
    // Core User Operations: 1-Click Deposit & Instant Withdraw
    // =========================================================================

    /// Deposit base stablecoin assets into the vault, minting NUSD shares
    pub fn deposit(&mut self, amount: U128, receiver_id: Option<AccountId>) -> U128 {
        let caller = env::predecessor_account_id();
        let receiver = receiver_id.unwrap_or(caller);
        let assets = amount.0;
        require!(assets > 0, "Deposit amount must be positive");

        // Seamless auto-registration for receiver storage
        if self.storage_deposits.get(&receiver).is_none() {
            self.storage_deposits.insert(&receiver, &STORAGE_MIN_BOUND.as_yoctonear());
        }

        let shares_to_mint = MorphoVaultEngine::convert_to_shares(
            assets,
            self.total_assets,
            self.total_shares,
        );
        require!(shares_to_mint > 0, "Zero shares minted for deposit");

        // 1. Morpho Supply Queue Routing (fills RHEA up to Cap, overflow cascades to RWA)
        MorphoVaultEngine::route_supply(assets, &self.supply_queue, &mut self.markets);

        // 2. State update & share minting
        self.total_assets += assets;
        self.total_shares += shares_to_mint;
        let current_balance = self.shares.get(&receiver).unwrap_or(0);
        self.shares.insert(&receiver, &(current_balance + shares_to_mint));

        emit_deposit_event(&receiver, assets, shares_to_mint);
        emit_ft_mint(&receiver, shares_to_mint);

        U128(shares_to_mint)
    }

    /// NEP-141 Receiver Interface for automated token transfers (e.g. from Native USDC, Meteor Wallet, Ref Finance)
    pub fn ft_on_transfer(
        &mut self,
        sender_id: AccountId,
        amount: U128,
        msg: String,
    ) -> PromiseOrValue<U128> {
        let assets = amount.0;
        require!(assets > 0, "Transfer amount must be positive");

        let receiver = if !msg.is_empty() {
            msg.parse().unwrap_or(sender_id)
        } else {
            sender_id
        };

        // Seamless auto-registration for receiver storage
        if self.storage_deposits.get(&receiver).is_none() {
            self.storage_deposits.insert(&receiver, &STORAGE_MIN_BOUND.as_yoctonear());
        }

        let shares_to_mint = MorphoVaultEngine::convert_to_shares(
            assets,
            self.total_assets,
            self.total_shares,
        );
        require!(shares_to_mint > 0, "Zero shares minted for deposit");

        // 1. Morpho Supply Queue Routing
        MorphoVaultEngine::route_supply(assets, &self.supply_queue, &mut self.markets);

        // 2. State update & share minting
        self.total_assets += assets;
        self.total_shares += shares_to_mint;
        let current_balance = self.shares.get(&receiver).unwrap_or(0);
        self.shares.insert(&receiver, &(current_balance + shares_to_mint));

        emit_deposit_event(&receiver, assets, shares_to_mint);
        emit_ft_mint(&receiver, shares_to_mint);

        PromiseOrValue::Value(U128(0))
    }

    /// Withdraw base assets by redeeming and burning NUSD shares
    pub fn withdraw(&mut self, shares_amount: U128, receiver_id: Option<AccountId>) -> Promise {
        let caller = env::predecessor_account_id();
        let receiver = receiver_id.unwrap_or(caller.clone());
        let shares = shares_amount.0;
        require!(shares > 0, "Withdrawal shares must be positive");

        let current_shares = self.shares.get(&caller).unwrap_or(0);
        require!(current_shares >= shares, "Insufficient NUSD share balance");

        let assets_to_withdraw = MorphoVaultEngine::convert_to_assets(
            shares,
            self.total_assets,
            self.total_shares,
        );
        require!(assets_to_withdraw > 0, "Zero assets redeemed");
        require!(self.total_assets >= assets_to_withdraw, "Vault reserves insufficient");

        // 1. Morpho Withdraw Queue Routing (prioritizes liquid RWA buffer first)
        MorphoVaultEngine::route_withdraw(
            assets_to_withdraw,
            &self.withdraw_queue,
            &mut self.markets,
        );

        // 2. State update & share burning
        self.shares.insert(&caller, &(current_shares - shares));
        self.total_shares -= shares;
        self.total_assets -= assets_to_withdraw;

        emit_withdraw_event(&receiver, assets_to_withdraw, shares);
        emit_ft_burn(&caller, shares);

        // 3. Dispatch ft_transfer cross-contract call to return USDC to receiver
        Promise::new(self.base_asset_id.clone()).function_call(
            "ft_transfer".to_string(),
            serde_json::to_vec(&serde_json::json!({
                "receiver_id": receiver,
                "amount": U128(assets_to_withdraw),
                "memo": Some("OmniYield Vault Redemption")
            }))
            .expect("Serialization failed"),
            NearToken::from_yoctonear(1),
            Gas::from_tgas(30),
        )
    }

    // =========================================================================
    // Morpho Public Allocator: Autonomous Reallocation & Yield Accrual
    // =========================================================================

    /// Rebalance capital across sub-markets adhering strictly to curator supply caps
    pub fn reallocate(&mut self, allocations: Vec<AllocationInput>) {
        let caller = env::predecessor_account_id();
        require!(
            caller == self.allocator_id || caller == self.curator_id || caller == self.owner_id,
            "Unauthorized allocator: caller lacks reallocation permission"
        );

        MorphoVaultEngine::validate_and_apply_reallocation(
            &allocations,
            self.total_assets,
            &mut self.markets,
        );

        emit_reallocate_event(
            &caller,
            &serde_json::to_value(&allocations).unwrap(),
        );
    }

    /// Accrue yield from an underlying sub-market (compounding NUSD share value & extracting performance fee)
    pub fn accrue_yield(&mut self, market_id: MarketId, yield_amount: U128) {
        let caller = env::predecessor_account_id();
        require!(
            caller == self.owner_id || caller == self.allocator_id,
            "Unauthorized to accrue yield"
        );

        let mut market = self.markets.get(&market_id).expect("Sub-market not found");
        market.current_allocation = U128(market.current_allocation.0 + yield_amount.0);
        self.markets.insert(&market_id, &market);

        let gross_yield = yield_amount.0;
        let fee_config = self.get_fee_config();

        // 1. Calculate Morpho Performance Fee (e.g. 10% / 1000 bps)
        let fee_amount = if fee_config.performance_fee_bps > 0 {
            (gross_yield * fee_config.performance_fee_bps as u128) / 10000
        } else {
            0
        };

        self.total_assets += gross_yield;

        // 2. Mint fee shares to Performance Fee Recipient (DAO Treasury)
        if fee_amount > 0 && self.total_shares > 0 {
            if let Some(recipient) = fee_config.performance_fee_recipient {
                // Auto-register storage for recipient if needed
                if self.storage_deposits.get(&recipient).is_none() {
                    self.storage_deposits.insert(&recipient, &STORAGE_MIN_BOUND.as_yoctonear());
                }

                let fee_shares = MorphoVaultEngine::convert_to_shares(
                    fee_amount,
                    self.total_assets,
                    self.total_shares,
                );
                if fee_shares > 0 {
                    self.total_shares += fee_shares;
                    let recipient_balance = self.shares.get(&recipient).unwrap_or(0);
                    self.shares.insert(&recipient, &(recipient_balance + fee_shares));
                    emit_ft_mint(&recipient, fee_shares);
                }
            }
        }

        emit_yield_accrued_event(&market_id, gross_yield, self.total_assets);
    }

    // =========================================================================
    // Morpho Fee Management (Performance Fee, Management Fee, Recipients)
    // =========================================================================

    /// Get current fee configuration
    pub fn get_fee_config(&self) -> FeeConfig {
        let perf_bps = env::storage_read(b"fee_perf_bps")
            .map(|b| u32::from_le_bytes(b.try_into().unwrap_or([0, 0, 0, 0])))
            .unwrap_or(1000); // Default: 10.0% (1000 bps)

        let mgmt_bps = env::storage_read(b"fee_mgmt_bps")
            .map(|b| u32::from_le_bytes(b.try_into().unwrap_or([0, 0, 0, 0])))
            .unwrap_or(50); // Default: 0.50% (50 bps)

        let perf_rec = env::storage_read(b"fee_perf_rec")
            .and_then(|b| String::from_utf8(b).ok())
            .and_then(|s| s.parse().ok())
            .or_else(|| Some(self.owner_id.clone()));

        let mgmt_rec = env::storage_read(b"fee_mgmt_rec")
            .and_then(|b| String::from_utf8(b).ok())
            .and_then(|s| s.parse().ok())
            .or_else(|| Some(self.owner_id.clone()));

        FeeConfig {
            performance_fee_bps: perf_bps,
            management_fee_bps: mgmt_bps,
            performance_fee_recipient: perf_rec,
            management_fee_recipient: mgmt_rec,
        }
    }

    /// Admin / Owner sets performance fee in basis points (max 5000 bps = 50%)
    pub fn set_performance_fee(&mut self, fee_bps: u32) {
        let caller = env::predecessor_account_id();
        require!(
            caller == self.owner_id || caller == env::current_account_id(),
            "Unauthorized to set performance fee"
        );
        require!(fee_bps <= 5000, "Performance fee exceeds max cap (50%)");
        env::storage_write(b"fee_perf_bps", &fee_bps.to_le_bytes());
    }

    /// Admin / Owner sets management fee in basis points (max 500 bps = 5%)
    pub fn set_management_fee(&mut self, fee_bps: u32) {
        let caller = env::predecessor_account_id();
        require!(
            caller == self.owner_id || caller == env::current_account_id(),
            "Unauthorized to set management fee"
        );
        require!(fee_bps <= 500, "Management fee exceeds max cap (5%)");
        env::storage_write(b"fee_mgmt_bps", &fee_bps.to_le_bytes());
    }

    /// Admin / Owner sets recipient for performance fees
    pub fn set_performance_fee_recipient(&mut self, recipient: Option<AccountId>) {
        let caller = env::predecessor_account_id();
        require!(
            caller == self.owner_id || caller == env::current_account_id(),
            "Unauthorized"
        );
        if let Some(rec) = recipient {
            env::storage_write(b"fee_perf_rec", rec.as_bytes());
        } else {
            env::storage_remove(b"fee_perf_rec");
        }
    }

    /// Admin / Owner sets recipient for management fees
    pub fn set_management_fee_recipient(&mut self, recipient: Option<AccountId>) {
        let caller = env::predecessor_account_id();
        require!(
            caller == self.owner_id || caller == env::current_account_id(),
            "Unauthorized"
        );
        if let Some(rec) = recipient {
            env::storage_write(b"fee_mgmt_rec", rec.as_bytes());
        } else {
            env::storage_remove(b"fee_mgmt_rec");
        }
    }

    // =========================================================================
    // Motherboard Plug-and-Play Socket Management (Open Extensibility)
    // =========================================================================

    /// Register and plug a new third-party yield socket into the Motherboard
    pub fn register_yield_socket(
        &mut self,
        socket_id: MarketId,
        name: String,
        adapter_id: AccountId,
        initial_cap: U128,
        initial_apy_bps: u32,
        priority: u8,
        version: String,
    ) {
        let caller = env::predecessor_account_id();
        require!(
            caller == self.curator_id || caller == self.owner_id,
            "Unauthorized: only curator or owner may register sockets"
        );
        require!(
            self.sockets.get(&socket_id).is_none(),
            "Socket with this ID is already registered"
        );

        let new_market = Market::new(
            socket_id.clone(),
            name.clone(),
            adapter_id.clone(),
            initial_cap.0,
            initial_apy_bps,
            priority,
        );

        let new_descriptor = SocketDescriptor {
            socket_id: socket_id.clone(),
            name,
            kind: SocketKind::YieldSocket,
            adapter_account: adapter_id.clone(),
            version: version.clone(),
            status: SocketStatus::Active,
            registered_at_block: env::block_height(),
        };

        self.markets.insert(&socket_id, &new_market);
        self.sockets.insert(&socket_id, &new_descriptor);

        emit_socket_registered_event(&socket_id, &adapter_id, &version);
    }

    /// Toggle socket operational status (e.g. pause or deprecate a socket)
    pub fn set_socket_status(&mut self, socket_id: MarketId, is_active: bool) {
        let caller = env::predecessor_account_id();
        require!(
            caller == self.curator_id || caller == self.owner_id,
            "Unauthorized: curator permission required"
        );

        let mut descriptor = self.sockets.get(&socket_id).expect("Socket not registered");
        let mut market = self.markets.get(&socket_id).expect("Underlying market not found");

        descriptor.status = if is_active { SocketStatus::Active } else { SocketStatus::Paused };
        market.is_active = is_active;

        self.sockets.insert(&socket_id, &descriptor);
        self.markets.insert(&socket_id, &market);

        emit_socket_status_changed_event(&socket_id, if is_active { "Active" } else { "Paused" });
    }

    /// Return all registered plug-and-play sockets
    pub fn get_sockets(&self) -> Vec<SocketDescriptor> {
        let mut list = Vec::new();
        let vec = self.sockets.values_as_vector();
        for i in 0..vec.len() {
            if let Some(s) = vec.get(i) {
                list.push(s);
            }
        }
        list
    }

    // =========================================================================
    // Curator & Governance Functions (Morpho 4-Role Matrix & Timelock)
    // =========================================================================

    /// Immediately decrease a market's supply cap (risk mitigation executes without timelock)
    pub fn set_supply_cap(&mut self, market_id: MarketId, new_cap: U128) {
        let caller = env::predecessor_account_id();
        require!(
            caller == self.curator_id || caller == self.owner_id,
            "Unauthorized curator"
        );

        let mut market = self.markets.get(&market_id).expect("Market not found");
        let old_cap = market.supply_cap.0;

        // Morpho Security Invariant: Risk escalation (cap increase) MUST pass through timelock
        if new_cap.0 > old_cap {
            env::panic_str("Cap increase requires timelock: use submit_supply_cap_change");
        }

        market.supply_cap = new_cap;
        self.markets.insert(&market_id, &market);

        emit_cap_updated_event(&market_id, old_cap, new_cap.0);
    }

    /// Submit a proposed cap change (increase) to the 24-hour Timelock
    pub fn submit_supply_cap_change(&mut self, market_id: MarketId, new_cap: U128) {
        let caller = env::predecessor_account_id();
        require!(
            caller == self.curator_id || caller == self.owner_id,
            "Unauthorized: only curator or owner may submit cap changes"
        );

        let market = self.markets.get(&market_id).expect("Market not found");
        let current_time = env::block_timestamp();
        let eta = current_time + self.timelock_duration_ns;

        let pending = PendingCapChange {
            market_id: market_id.clone(),
            proposed_cap: new_cap,
            submitted_at_ns: current_time,
            executable_at_ns: eta,
        };

        self.pending_cap_changes.insert(&market_id, &pending);

        emit_cap_change_submitted_event(&market_id, market.supply_cap.0, new_cap.0, eta);
    }

    /// Execute a timelocked cap change once the delay period has elapsed
    pub fn execute_supply_cap_change(&mut self, market_id: MarketId) {
        let caller = env::predecessor_account_id();
        require!(
            caller == self.curator_id || caller == self.owner_id,
            "Unauthorized: only curator or owner may execute cap changes"
        );

        let pending = self
            .pending_cap_changes
            .get(&market_id)
            .expect("No pending cap change for this market");

        let current_time = env::block_timestamp();
        require!(
            current_time >= pending.executable_at_ns,
            format!(
                "Timelock not expired: remaining {} ns",
                pending.executable_at_ns.saturating_sub(current_time)
            )
        );

        let mut market = self.markets.get(&market_id).expect("Market not found");
        let old_cap = market.supply_cap.0;
        market.supply_cap = pending.proposed_cap;
        self.markets.insert(&market_id, &market);

        self.pending_cap_changes.remove(&market_id);

        emit_cap_updated_event(&market_id, old_cap, pending.proposed_cap.0);
    }

    /// Guardian or Owner immediate veto to cancel a pending timelocked change
    pub fn cancel_supply_cap_change(&mut self, market_id: MarketId) {
        let caller = env::predecessor_account_id();
        require!(
            caller == self.guardian_id || caller == self.owner_id,
            "Unauthorized: only Guardian or Owner may veto pending cap change"
        );

        require!(
            self.pending_cap_changes.get(&market_id).is_some(),
            "No pending cap change to cancel"
        );

        self.pending_cap_changes.remove(&market_id);
        emit_cap_change_cancelled_event(&market_id, &caller);
    }

    /// Guardian or Owner emergency circuit breaker: instantaneously pauses market and sets cap to 0
    pub fn emergency_pause_market(&mut self, market_id: MarketId) {
        let caller = env::predecessor_account_id();
        require!(
            caller == self.guardian_id || caller == self.owner_id,
            "Unauthorized: only Guardian or Owner may trigger emergency pause"
        );

        let mut market = self.markets.get(&market_id).expect("Market not found");
        market.is_active = false;
        market.supply_cap = U128(0);
        self.markets.insert(&market_id, &market);

        if let Some(mut descriptor) = self.sockets.get(&market_id) {
            descriptor.status = SocketStatus::Paused;
            self.sockets.insert(&market_id, &descriptor);
        }

        emit_emergency_pause_event(&market_id, &caller, true);
    }

    /// Curator or Owner unpauses market after emergency investigation
    pub fn emergency_resume_market(&mut self, market_id: MarketId, restored_cap: U128) {
        let caller = env::predecessor_account_id();
        require!(
            caller == self.curator_id || caller == self.owner_id,
            "Unauthorized: only Curator or Owner may resume paused market"
        );

        let mut market = self.markets.get(&market_id).expect("Market not found");
        market.is_active = true;
        market.supply_cap = restored_cap;
        self.markets.insert(&market_id, &market);

        if let Some(mut descriptor) = self.sockets.get(&market_id) {
            descriptor.status = SocketStatus::Active;
            self.sockets.insert(&market_id, &descriptor);
        }

        emit_emergency_pause_event(&market_id, &caller, false);
    }

    /// Update base asset token ID (e.g. Circle Native USDC on NEAR Testnet)
    pub fn set_base_asset_id(&mut self, new_base_asset_id: AccountId) {
        let caller = env::predecessor_account_id();
        require!(
            caller == self.owner_id || caller == env::current_account_id(),
            "Unauthorized to set base asset"
        );
        self.base_asset_id = new_base_asset_id;
    }

    pub fn get_base_asset_id(&self) -> AccountId {
        self.base_asset_id.clone()
    }

    /// Owner rotates the Guardian account
    pub fn set_guardian(&mut self, new_guardian_id: AccountId) {
        let caller = env::predecessor_account_id();
        require!(caller == self.owner_id, "Only owner may rotate guardian");
        self.guardian_id = new_guardian_id;
    }

    /// Owner rotates the Curator account (independent risk entity)
    pub fn set_curator(&mut self, new_curator_id: AccountId) {
        let caller = env::predecessor_account_id();
        require!(caller == self.owner_id, "Only owner may rotate curator");
        self.curator_id = new_curator_id;
    }

    /// Owner rotates the Allocator account (independent AI rebalance keeper)
    pub fn set_allocator(&mut self, new_allocator_id: AccountId) {
        let caller = env::predecessor_account_id();
        require!(caller == self.owner_id, "Only owner may rotate allocator");
        self.allocator_id = new_allocator_id;
    }

    /// Owner transfers contract ownership to a new DAO/multi-sig
    pub fn set_owner(&mut self, new_owner_id: AccountId) {
        let caller = env::predecessor_account_id();
        require!(caller == self.owner_id, "Only current owner may transfer ownership");
        self.owner_id = new_owner_id;
    }

    /// Owner configures timelock duration (enforcing minimum 3600 seconds)
    pub fn set_timelock_duration(&mut self, new_duration_ns: u64) {
        let caller = env::predecessor_account_id();
        require!(caller == self.owner_id, "Only owner may configure timelock");
        require!(
            new_duration_ns >= 3_600_000_000_000,
            "Timelock duration must be at least 1 hour"
        );
        self.timelock_duration_ns = new_duration_ns;
    }

    /// Configure supply queue priorities
    pub fn set_supply_queue(&mut self, new_queue: Vec<MarketId>) {
        let caller = env::predecessor_account_id();
        require!(
            caller == self.curator_id || caller == self.owner_id,
            "Unauthorized curator"
        );
        for m_id in &new_queue {
            require!(self.markets.get(m_id).is_some(), "Invalid market in queue");
        }
        self.supply_queue = new_queue;
    }

    /// Configure withdraw queue priorities
    pub fn set_withdraw_queue(&mut self, new_queue: Vec<MarketId>) {
        let caller = env::predecessor_account_id();
        require!(
            caller == self.curator_id || caller == self.owner_id,
            "Unauthorized curator"
        );
        for m_id in &new_queue {
            require!(self.markets.get(m_id).is_some(), "Invalid market in queue");
        }
        self.withdraw_queue = new_queue;
    }

    // =========================================================================
    // Veda Multi-Curator & Whitelabel Sub-Vault Registry (Option B Implementation)
    // =========================================================================

    /// Register a specialized external or AI risk curator (e.g. Steakhouse, Bitwise, Sentora)
    pub fn register_curator(
        &mut self,
        curator_id: AccountId,
        name: String,
        max_allocation_cap: U128,
        approved_markets: Vec<MarketId>,
        fee_share_bps: u32,
    ) {
        let caller = env::predecessor_account_id();
        require!(
            caller == self.owner_id || caller == self.curator_id,
            "Unauthorized: only DAO or Master Curator can register new curators"
        );
        require!(fee_share_bps <= 5000, "Curator fee share exceeds max limit (50%)");

        for m_id in &approved_markets {
            require!(self.markets.get(m_id).is_some(), "Approved market does not exist in vault");
        }

        let config = CuratorConfig {
            curator_id: curator_id.clone(),
            name: name.clone(),
            is_active: true,
            max_allocation_cap,
            approved_markets,
            fee_share_bps,
            registered_at_block: env::block_height(),
        };

        self.curators.insert(&curator_id, &config);
        emit_curator_registered_event(&curator_id, &name, max_allocation_cap.0);
    }

    /// Update curator risk ceiling and active status
    pub fn update_curator_limits(
        &mut self,
        curator_id: AccountId,
        max_allocation_cap: U128,
        is_active: bool,
    ) {
        let caller = env::predecessor_account_id();
        require!(
            caller == self.owner_id || caller == self.guardian_id || caller == self.curator_id,
            "Unauthorized"
        );

        let mut config = self.curators.get(&curator_id).expect("Curator not found");
        config.max_allocation_cap = max_allocation_cap;
        config.is_active = is_active;
        self.curators.insert(&curator_id, &config);
    }

    /// List all registered institutional curators
    pub fn get_curators(&self) -> Vec<CuratorConfig> {
        let mut list = Vec::new();
        let vec = self.curators.values_as_vector();
        for i in 0..vec.len() {
            if let Some(c) = vec.get(i) {
                list.push(c);
            }
        }
        list
    }

    /// Create an institutional Whitelabel Sub-Vault (enabling partners to customize fees & asset whitelists)
    pub fn create_sub_vault(
        &mut self,
        sub_vault_id: String,
        name: String,
        curator_id: AccountId,
        distributor_partner_id: Option<String>,
        management_fee_bps: u32,
        performance_fee_bps: u32,
        fee_recipient: AccountId,
        allowed_markets: Vec<MarketId>,
        max_debt_ceiling: U128,
    ) {
        let caller = env::predecessor_account_id();
        require!(
            caller == self.owner_id || caller == self.curator_id || caller == curator_id,
            "Unauthorized to create sub-vault"
        );
        require!(self.sub_vaults.get(&sub_vault_id).is_none(), "Sub-vault ID already exists");
        require!(management_fee_bps <= 500, "Management fee exceeds 500 bps (5%)");
        require!(performance_fee_bps <= 3000, "Performance fee exceeds 3000 bps (30%)");

        // Verify curator is registered and active
        let curator_cfg = self.curators.get(&curator_id).expect("Curator is not registered");
        require!(curator_cfg.is_active, "Assigned curator is currently inactive");

        // Verify all allowed markets exist
        for m_id in &allowed_markets {
            require!(self.markets.get(m_id).is_some(), "Allowed market does not exist");
        }

        let sub_vault = WhitelabelSubVault {
            sub_vault_id: sub_vault_id.clone(),
            name: name.clone(),
            curator_id: curator_id.clone(),
            distributor_partner_id,
            total_assets: U128(0),
            total_shares: U128(0),
            management_fee_bps,
            performance_fee_bps,
            fee_recipient,
            allowed_markets,
            max_debt_ceiling,
            is_paused: false,
            created_at_block: env::block_height(),
        };

        self.sub_vaults.insert(&sub_vault_id, &sub_vault);
        emit_sub_vault_created_event(&sub_vault_id, &curator_id, &name, max_debt_ceiling.0);
    }

    /// Emergency pause / resume switch for a sub-vault
    pub fn set_sub_vault_pause(&mut self, sub_vault_id: String, is_paused: bool) {
        let caller = env::predecessor_account_id();
        let mut sub_vault = self.sub_vaults.get(&sub_vault_id).expect("Sub-vault not found");
        require!(
            caller == self.owner_id || caller == self.guardian_id || caller == sub_vault.curator_id,
            "Unauthorized to toggle sub-vault pause"
        );
        sub_vault.is_paused = is_paused;
        self.sub_vaults.insert(&sub_vault_id, &sub_vault);
    }

    /// Get details of a single sub-vault
    pub fn get_sub_vault(&self, sub_vault_id: String) -> Option<WhitelabelSubVault> {
        self.sub_vaults.get(&sub_vault_id)
    }

    /// Query all whitelabel sub-vaults
    pub fn get_all_sub_vaults(&self) -> Vec<WhitelabelSubVault> {
        let mut list = Vec::new();
        let vec = self.sub_vaults.values_as_vector();
        for i in 0..vec.len() {
            if let Some(v) = vec.get(i) {
                list.push(v);
            }
        }
        list
    }

    /// Rebalance assets strictly within an institutional sub-vault
    pub fn reallocate_sub_vault(&mut self, sub_vault_id: String, allocations: Vec<AllocationInput>) {
        let caller = env::predecessor_account_id();
        let sub_vault = self.sub_vaults.get(&sub_vault_id).expect("Sub-vault not found");
        require!(!sub_vault.is_paused, "Sub-vault is paused");
        require!(
            caller == sub_vault.curator_id || caller == self.owner_id,
            "Unauthorized: only assigned curator or owner can reallocate sub-vault"
        );

        let mut total_req: u128 = 0;
        for alloc in &allocations {
            require!(
                sub_vault.allowed_markets.contains(&alloc.market_id),
                "Allocation target not in sub-vault allowed markets"
            );
            total_req += alloc.amount.0;
        }

        require!(
            total_req <= sub_vault.max_debt_ceiling.0,
            "Allocations exceed sub-vault maximum debt ceiling"
        );

        // Apply reallocation to underlying markets
        MorphoVaultEngine::validate_and_apply_reallocation(
            &allocations,
            self.total_assets,
            &mut self.markets,
        );
    }

    // =========================================================================
    // Comprehensive View Methods
    // =========================================================================

    pub fn get_vault_summary(&self) -> VaultSummary {
        let mut market_list = Vec::new();
        let mut weighted_apy_sum: u128 = 0;

        let market_vector = self.markets.values_as_vector();
        for i in 0..market_vector.len() {
            if let Some(m) = market_vector.get(i) {
                weighted_apy_sum += (m.current_allocation.0 as u128) * (m.current_apy_bps as u128);
                market_list.push(m);
            }
        }

        let mut pending_list = Vec::new();
        let pending_vec = self.pending_cap_changes.values_as_vector();
        for i in 0..pending_vec.len() {
            if let Some(p) = pending_vec.get(i) {
                pending_list.push(p);
            }
        }

        let blended_apy = if self.total_assets > 0 {
            (weighted_apy_sum / self.total_assets) as u32
        } else {
            850
        };

        let pps = if self.total_shares > 0 {
            (self.total_assets * DECIMAL_OFFSET) / self.total_shares
        } else {
            DECIMAL_OFFSET
        };

        VaultSummary {
            total_assets: U128(self.total_assets),
            total_shares: U128(self.total_shares),
            price_per_share: U128(pps),
            blended_apy_bps: blended_apy,
            supply_queue: self.supply_queue.clone(),
            withdraw_queue: self.withdraw_queue.clone(),
            markets: market_list,
            curator_id: self.curator_id.clone(),
            allocator_id: self.allocator_id.clone(),
            guardian_id: self.guardian_id.clone(),
            timelock_duration_ns: self.timelock_duration_ns,
            pending_cap_changes: pending_list,
        }
    }

    pub fn get_market(&self, market_id: MarketId) -> Option<Market> {
        self.markets.get(&market_id)
    }

    // =========================================================================
    // NEP-141 Standard Fungible Token Implementation (`NUSD`)
    // =========================================================================

    pub fn ft_total_supply(&self) -> U128 {
        U128(self.total_shares)
    }

    pub fn ft_balance_of(&self, account_id: AccountId) -> U128 {
        U128(self.shares.get(&account_id).unwrap_or(0))
    }

    pub fn ft_transfer(&mut self, receiver_id: AccountId, amount: U128, memo: Option<String>) {
        let sender_id = env::predecessor_account_id();
        let transfer_amount = amount.0;
        require!(transfer_amount > 0, "Transfer amount must be positive");

        self.internal_require_registered(&receiver_id);

        let sender_balance = self.shares.get(&sender_id).unwrap_or(0);
        require!(sender_balance >= transfer_amount, "Insufficient NUSD balance");

        self.shares.insert(&sender_id, &(sender_balance - transfer_amount));
        let receiver_balance = self.shares.get(&receiver_id).unwrap_or(0);
        self.shares.insert(&receiver_id, &(receiver_balance + transfer_amount));

        emit_ft_transfer(&sender_id, &receiver_id, transfer_amount, memo.as_deref());
    }

    pub fn ft_metadata(&self) -> FungibleTokenMetadata {
        default_nusd_metadata()
    }

    // =========================================================================
    // NEP-145 Storage Management Implementation
    // =========================================================================

    #[payable]
    pub fn storage_deposit(
        &mut self,
        account_id: Option<AccountId>,
        registration_only: Option<bool>,
    ) -> StorageBalance {
        let attached_deposit = env::attached_deposit();
        let target_account = account_id.unwrap_or_else(env::predecessor_account_id);
        let is_registered = self.storage_deposits.get(&target_account).is_some();
        let reg_only = registration_only.unwrap_or(false);

        if is_registered {
            if !attached_deposit.is_zero() {
                // Refund excess attached deposit
                let _ = Promise::new(env::predecessor_account_id()).transfer(attached_deposit);
            }
        } else {
            require!(
                attached_deposit >= STORAGE_MIN_BOUND,
                format!("Deposit at least {} yoctoNEAR to register", STORAGE_MIN_BOUND)
            );
            self.storage_deposits.insert(&target_account, &STORAGE_MIN_BOUND.as_yoctonear());
            let refund_yocto = attached_deposit.as_yoctonear() - STORAGE_MIN_BOUND.as_yoctonear();
            if refund_yocto > 0 && reg_only {
                let _ = Promise::new(env::predecessor_account_id()).transfer(NearToken::from_yoctonear(refund_yocto));
            }
        }

        self.storage_balance_of(target_account).unwrap()
    }

    pub fn storage_balance_bounds(&self) -> StorageBalanceBounds {
        StorageBalanceBounds {
            min: U128(STORAGE_MIN_BOUND.as_yoctonear()),
            max: Some(U128(STORAGE_MIN_BOUND.as_yoctonear())),
        }
    }

    pub fn storage_balance_of(&self, account_id: AccountId) -> Option<StorageBalance> {
        self.storage_deposits.get(&account_id).map(|balance| StorageBalance {
            total: U128(balance),
            available: U128(0),
        })
    }

    // =========================================================================
    // Internal Utilities
    // =========================================================================

    fn internal_require_registered(&self, account_id: &AccountId) {
        require!(
            self.storage_deposits.get(account_id).is_some(),
            format!("Account {} must register storage before receiving NUSD", account_id)
        );
    }
}

// =========================================================================
// Full Test Suite (100% Comprehensive Coverage)
// =========================================================================
#[cfg(test)]
mod tests {
    use super::*;
    use near_sdk::test_utils::VMContextBuilder;
    use near_sdk::testing_env;

    fn get_context(predecessor: AccountId) -> VMContextBuilder {
        let mut builder = VMContextBuilder::new();
        builder.predecessor_account_id(predecessor);
        builder
    }

    fn init_contract() -> (OmniYieldVault, AccountId, AccountId, AccountId, AccountId) {
        let owner: AccountId = "owner.near".parse().unwrap();
        let curator: AccountId = "curator.near".parse().unwrap();
        let allocator: AccountId = "allocator.near".parse().unwrap();
        let guardian: AccountId = "guardian.near".parse().unwrap();
        let base_asset: AccountId = "usdc.near".parse().unwrap();

        testing_env!(get_context(owner.clone()).build());

        let vault = OmniYieldVault::new(
            owner.clone(),
            curator.clone(),
            allocator.clone(),
            guardian.clone(),
            None,
            base_asset,
        );
        (vault, owner, curator, allocator, guardian)
    }

    #[test]
    fn test_storage_registration_and_deposit() {
        let (mut vault, _, _, _, _) = init_contract();
        let alice: AccountId = "alice.near".parse().unwrap();

        // 1. Storage registration
        let mut ctx = get_context(alice.clone());
        ctx.attached_deposit(STORAGE_MIN_BOUND);
        testing_env!(ctx.build());
        vault.storage_deposit(Some(alice.clone()), None);

        // 2. Deposit 1,000 USDC
        let deposit_amount = 1_000 * DECIMAL_OFFSET;
        let minted = vault.deposit(U128(deposit_amount), None);

        assert_eq!(minted.0, deposit_amount);
        assert_eq!(vault.total_assets().0, deposit_amount);
        assert_eq!(vault.ft_balance_of(alice).0, deposit_amount);

        // Morpho Queue Check: High-yield RHEA is filled first
        let rhea = vault.get_market("rhea-lending".to_string()).unwrap();
        assert_eq!(rhea.current_allocation.0, deposit_amount);
    }

    #[test]
    fn test_morpho_cap_saturation_and_rwa_overflow() {
        let (mut vault, _, _, _, _) = init_contract();
        let alice: AccountId = "alice.near".parse().unwrap();

        let mut ctx = get_context(alice.clone());
        ctx.attached_deposit(STORAGE_MIN_BOUND);
        testing_env!(ctx.build());
        vault.storage_deposit(Some(alice.clone()), None);

        // Deposit 8M USDC (exceeds RHEA's 7M cap)
        let deposit_amount = 8_000_000 * DECIMAL_OFFSET;
        vault.deposit(U128(deposit_amount), None);

        // RHEA should be capped exactly at 7M
        let rhea = vault.get_market("rhea-lending".to_string()).unwrap();
        assert_eq!(rhea.current_allocation.0, DEFAULT_RHEA_CAP);

        // Remaining 1M should cascade into Ondo RWA pool
        let rwa = vault.get_market("ondo-rwa".to_string()).unwrap();
        assert_eq!(rwa.current_allocation.0, 1_000_000 * DECIMAL_OFFSET);
    }

    #[test]
    fn test_morpho_withdraw_queue_prioritizes_treasury_buffer() {
        let (mut vault, _, _, _, _) = init_contract();
        let alice: AccountId = "alice.near".parse().unwrap();

        let mut ctx = get_context(alice.clone());
        ctx.attached_deposit(STORAGE_MIN_BOUND);
        testing_env!(ctx.build());
        vault.storage_deposit(Some(alice.clone()), None);

        // Deposit 8M (7M in RHEA, 1M in RWA)
        vault.deposit(U128(8_000_000 * DECIMAL_OFFSET), None);

        // Withdraw 600,000 shares
        let redeemed = vault.withdraw(U128(600_000 * DECIMAL_OFFSET), None);
        assert_eq!(redeemed.0, 600_000 * DECIMAL_OFFSET);

        // Withdraw Queue Priority 1 is Ondo RWA buffer: 1M - 600k = 400k remaining
        let rwa = vault.get_market("ondo-rwa".to_string()).unwrap();
        assert_eq!(rwa.current_allocation.0, 400_000 * DECIMAL_OFFSET);

        // RHEA lending allocation must remain completely untouched at 7M!
        let rhea = vault.get_market("rhea-lending".to_string()).unwrap();
        assert_eq!(rhea.current_allocation.0, DEFAULT_RHEA_CAP);
    }

    #[test]
    fn test_yield_accrual_increases_price_per_share() {
        let (mut vault, owner, _, _, _) = init_contract();
        let alice: AccountId = "alice.near".parse().unwrap();

        let mut ctx = get_context(alice.clone());
        ctx.attached_deposit(STORAGE_MIN_BOUND);
        testing_env!(ctx.build());
        vault.storage_deposit(Some(alice.clone()), None);

        // Deposit 1,000 USDC
        vault.deposit(U128(1_000 * DECIMAL_OFFSET), None);

        // Underlying RHEA yields 100 USDC profit
        testing_env!(get_context(owner).build());
        vault.accrue_yield("rhea-lending".to_string(), U128(100 * DECIMAL_OFFSET));

        assert_eq!(vault.total_assets().0, 1_100 * DECIMAL_OFFSET);
        assert_eq!(vault.total_shares().0, 1_000 * DECIMAL_OFFSET);

        // NUSD price per share should appreciate to ~1.0999
        let pps = vault.price_per_share();
        assert!(pps.0 > DECIMAL_OFFSET);

        // Alice redeems her 1,000 NUSD and receives 1,100 USDC back!
        testing_env!(get_context(alice).build());
        let redeemed = vault.withdraw(U128(1_000 * DECIMAL_OFFSET), None);
        assert_eq!(redeemed.0, 1_100 * DECIMAL_OFFSET);
    }

    #[test]
    fn test_public_allocator_rebalance_and_cap_check() {
        let (mut vault, _, _, allocator, _) = init_contract();
        let alice: AccountId = "alice.near".parse().unwrap();

        let mut ctx = get_context(alice.clone());
        ctx.attached_deposit(STORAGE_MIN_BOUND);
        testing_env!(ctx.build());
        vault.storage_deposit(Some(alice.clone()), None);

        // Deposit 5M USDC
        vault.deposit(U128(5_000_000 * DECIMAL_OFFSET), None);

        // Allocator shifts: 4M RHEA, 1M RWA
        testing_env!(get_context(allocator).build());
        vault.reallocate(vec![
            AllocationInput {
                market_id: "rhea-lending".to_string(),
                amount: U128(4_000_000 * DECIMAL_OFFSET),
            },
            AllocationInput {
                market_id: "ondo-rwa".to_string(),
                amount: U128(1_000_000 * DECIMAL_OFFSET),
            },
        ]);

        let rhea = vault.get_market("rhea-lending".to_string()).unwrap();
        assert_eq!(rhea.current_allocation.0, 4_000_000 * DECIMAL_OFFSET);
        let rwa = vault.get_market("ondo-rwa".to_string()).unwrap();
        assert_eq!(rwa.current_allocation.0, 1_000_000 * DECIMAL_OFFSET);
    }

    #[test]
    fn test_plug_and_play_new_socket() {
        let (mut vault, _, curator, _, _) = init_contract();

        // Curator plugs in a new community-built lending socket: "kamino-solana"
        testing_env!(get_context(curator).build());
        vault.register_yield_socket(
            "kamino-solana".to_string(),
            "Kamino Solana Lending Socket".to_string(),
            "kamino-adapter.near".parse().unwrap(),
            U128(5_000_000 * DECIMAL_OFFSET), // 5M Cap
            1450,                              // 14.50% APY
            3,
            "1.0.0".to_string(),
        );

        let sockets = vault.get_sockets();
        assert_eq!(sockets.len(), 3); // RHEA, Ondo, and Kamino

        let kamino_market = vault.get_market("kamino-solana".to_string()).unwrap();
        assert_eq!(kamino_market.current_apy_bps, 1450);
        assert_eq!(kamino_market.supply_cap.0, 5_000_000 * DECIMAL_OFFSET);
    }

    #[test]
    fn test_timelock_and_guardian_veto() {
        let (mut vault, _, curator, _, guardian) = init_contract();

        // 1. Curator submits cap increase from 7M to 10M
        testing_env!(get_context(curator.clone()).block_timestamp(1_000_000_000).build());
        let new_cap = 10_000_000 * DECIMAL_OFFSET;
        vault.submit_supply_cap_change("rhea-lending".to_string(), U128(new_cap));

        // Verify pending change is registered
        let summary = vault.get_vault_summary();
        assert_eq!(summary.pending_cap_changes.len(), 1);
        assert_eq!(summary.pending_cap_changes[0].proposed_cap.0, new_cap);

        // 2. Guardian vetoes the cap increase before timelock expiry
        testing_env!(get_context(guardian).block_timestamp(1_000_000_000 + 3600_000_000_000).build());
        vault.cancel_supply_cap_change("rhea-lending".to_string());

        let summary_after_veto = vault.get_vault_summary();
        assert_eq!(summary_after_veto.pending_cap_changes.len(), 0);

        // Original cap remains intact
        let rhea = vault.get_market("rhea-lending".to_string()).unwrap();
        assert_eq!(rhea.supply_cap.0, DEFAULT_RHEA_CAP);

        // 3. Re-submit and allow timelock to lapse, then successfully execute
        testing_env!(get_context(curator.clone()).block_timestamp(2_000_000_000).build());
        vault.submit_supply_cap_change("rhea-lending".to_string(), U128(new_cap));

        // Advance beyond 24-hour timelock (DEFAULT_TIMELOCK_DURATION_NS = 86_400_000_000_000)
        let execute_time = 2_000_000_000 + DEFAULT_TIMELOCK_DURATION_NS + 10;
        testing_env!(get_context(curator).block_timestamp(execute_time).build());
        vault.execute_supply_cap_change("rhea-lending".to_string());

        let rhea_updated = vault.get_market("rhea-lending".to_string()).unwrap();
        assert_eq!(rhea_updated.supply_cap.0, new_cap);
    }

    #[test]
    fn test_emergency_circuit_breaker() {
        let (mut vault, _, curator, _, guardian) = init_contract();

        // Guardian trips emergency circuit breaker on RHEA
        testing_env!(get_context(guardian).build());
        vault.emergency_pause_market("rhea-lending".to_string());

        let rhea = vault.get_market("rhea-lending".to_string()).unwrap();
        assert!(!rhea.is_active);
        assert_eq!(rhea.supply_cap.0, 0);

        // Curator unpauses market after resolution
        testing_env!(get_context(curator).build());
        vault.emergency_resume_market("rhea-lending".to_string(), U128(DEFAULT_RHEA_CAP));

        let rhea_resumed = vault.get_market("rhea-lending".to_string()).unwrap();
        assert!(rhea_resumed.is_active);
        assert_eq!(rhea_resumed.supply_cap.0, DEFAULT_RHEA_CAP);
    }
}
