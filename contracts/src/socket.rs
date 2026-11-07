use near_sdk::near;
use near_sdk::AccountId;

use crate::types::MarketId;

/// Type of pluggable socket attached to the OmniYield Motherboard
#[near(serializers = [borsh, json])]
#[derive(Clone, Debug, PartialEq)]
pub enum SocketKind {
    /// External blockchain settlement socket (e.g. Arbitrum, Solana, Monad)
    ChainSocket,
    /// Yield-generating sub-market socket (e.g. RHEA Lending, Ondo Treasuries, Kamino)
    YieldSocket,
}

/// Operational state of an attached socket
#[near(serializers = [borsh, json])]
#[derive(Clone, Debug, PartialEq)]
pub enum SocketStatus {
    Active,
    Paused,
    Deprecated,
}

/// Metadata and registration descriptor for a pluggable socket
#[near(serializers = [borsh, json])]
#[derive(Clone, Debug, PartialEq)]
pub struct SocketDescriptor {
    pub socket_id: MarketId,
    pub name: String,
    pub kind: SocketKind,
    pub adapter_account: AccountId,
    pub version: String,
    pub status: SocketStatus,
    pub registered_at_block: u64,
}

/// Canonical trait definition for an OmniYield Yield Socket.
/// Any third-party lending market, staking pool, or RWA issuer implements this specification.
pub trait YieldSocketTrait {
    /// Deposit assets into the underlying protocol adapter
    fn supply(&mut self, amount: u128) -> u128;

    /// Withdraw assets from the underlying protocol adapter
    fn withdraw(&mut self, amount: u128) -> u128;

    /// Query the current indicative annualized yield rate in basis points
    fn get_current_apy_bps(&self) -> u32;

    /// Query current instantaneous available liquidity
    fn get_available_liquidity(&self) -> u128;
}

/// Canonical trait definition for an OmniYield Chain Settlement Socket.
/// Any external Layer-1 or Layer-2 network connects via this specification.
pub trait ChainSocketTrait {
    /// Verify an inbound user intent proof from an external blockchain
    fn verify_inbound_intent(&self, raw_proof: &[u8]) -> bool;

    /// Dispatch an outbound native payout transaction to the target blockchain
    fn dispatch_outbound_payout(&self, destination_address: &str, amount: u128) -> bool;
}
