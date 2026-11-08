use near_sdk::json_types::U128;
use near_sdk::serde::Serialize;
use near_sdk::{env, AccountId};

#[derive(Serialize)]
#[serde(crate = "near_sdk::serde")]
struct EventLog<'a> {
    standard: &'static str,
    version: &'static str,
    event: &'a str,
    data: &'a serde_json::Value,
}

pub fn emit_ft_mint(owner_id: &AccountId, amount: u128) {
    let data = serde_json::json!([{
        "owner_id": owner_id,
        "amount": amount.to_string(),
    }]);
    log_event("nep141", "1.0.0", "ft_mint", &data);
}

pub fn emit_ft_burn(owner_id: &AccountId, amount: u128) {
    let data = serde_json::json!([{
        "owner_id": owner_id,
        "amount": amount.to_string(),
    }]);
    log_event("nep141", "1.0.0", "ft_burn", &data);
}

pub fn emit_ft_transfer(old_owner_id: &AccountId, new_owner_id: &AccountId, amount: u128, memo: Option<&str>) {
    let mut item = serde_json::json!({
        "old_owner_id": old_owner_id,
        "new_owner_id": new_owner_id,
        "amount": amount.to_string(),
    });
    if let Some(m) = memo {
        item["memo"] = serde_json::Value::String(m.to_string());
    }
    let data = serde_json::json!([item]);
    log_event("nep141", "1.0.0", "ft_transfer", &data);
}

pub fn emit_deposit_event(account_id: &AccountId, assets: u128, shares: u128) {
    let data = serde_json::json!({
        "account_id": account_id,
        "assets": U128(assets),
        "shares": U128(shares),
    });
    log_event("nep297", "1.0.0", "omniflow_deposit", &data);
}

pub fn emit_withdraw_event(account_id: &AccountId, assets: u128, shares: u128) {
    let data = serde_json::json!({
        "account_id": account_id,
        "assets": U128(assets),
        "shares": U128(shares),
    });
    log_event("nep297", "1.0.0", "omniflow_withdraw", &data);
}

pub fn emit_reallocate_event(allocator: &AccountId, market_allocations: &serde_json::Value) {
    let data = serde_json::json!({
        "allocator": allocator,
        "allocations": market_allocations,
    });
    log_event("nep297", "1.0.0", "omniflow_reallocate", &data);
}

pub fn emit_yield_accrued_event(market_id: &str, yield_amount: u128, new_total_assets: u128) {
    let data = serde_json::json!({
        "market_id": market_id,
        "yield_amount": U128(yield_amount),
        "new_total_assets": U128(new_total_assets),
    });
    log_event("nep297", "1.0.0", "omniflow_yield_accrued", &data);
}

pub fn emit_cap_updated_event(market_id: &str, old_cap: u128, new_cap: u128) {
    let data = serde_json::json!({
        "market_id": market_id,
        "old_cap": U128(old_cap),
        "new_cap": U128(new_cap),
    });
    log_event("nep297", "1.0.0", "omniflow_cap_updated", &data);
}

pub fn emit_socket_registered_event(socket_id: &str, adapter_account: &AccountId, version: &str) {
    let data = serde_json::json!({
        "socket_id": socket_id,
        "adapter_account": adapter_account,
        "version": version,
    });
    log_event("nep297", "1.0.0", "omniflow_socket_registered", &data);
}

pub fn emit_socket_status_changed_event(socket_id: &str, new_status: &str) {
    let data = serde_json::json!({
        "socket_id": socket_id,
        "new_status": new_status,
    });
    log_event("nep297", "1.0.0", "omniflow_socket_status_changed", &data);
}

pub fn emit_cap_change_submitted_event(market_id: &str, current_cap: u128, proposed_cap: u128, eta: u64) {
    let data = serde_json::json!({
        "market_id": market_id,
        "current_cap": U128(current_cap),
        "proposed_cap": U128(proposed_cap),
        "eta_timestamp_ns": eta.to_string(),
    });
    log_event("nep297", "1.0.0", "omniflow_timelock_submitted", &data);
}

pub fn emit_cap_change_cancelled_event(market_id: &str, guardian: &AccountId) {
    let data = serde_json::json!({
        "market_id": market_id,
        "vetoed_by": guardian,
    });
    log_event("nep297", "1.0.0", "omniflow_timelock_vetoed", &data);
}

pub fn emit_emergency_pause_event(market_id: &str, caller: &AccountId, is_paused: bool) {
    let data = serde_json::json!({
        "market_id": market_id,
        "triggered_by": caller,
        "is_paused": is_paused,
    });
    log_event("nep297", "1.0.0", "omniflow_emergency_circuit_breaker", &data);
}

pub fn emit_curator_registered_event(curator_id: &AccountId, name: &str, max_allocation_cap: u128) {
    let data = serde_json::json!({
        "curator_id": curator_id,
        "name": name,
        "max_allocation_cap": U128(max_allocation_cap),
    });
    log_event("nep297", "1.0.0", "omniyield_curator_registered", &data);
}

pub fn emit_sub_vault_created_event(sub_vault_id: &str, curator_id: &AccountId, name: &str, max_debt_ceiling: u128) {
    let data = serde_json::json!({
        "sub_vault_id": sub_vault_id,
        "curator_id": curator_id,
        "name": name,
        "max_debt_ceiling": U128(max_debt_ceiling),
    });
    log_event("nep297", "1.0.0", "omniyield_sub_vault_created", &data);
}

fn log_event(standard: &'static str, version: &'static str, event_name: &str, data: &serde_json::Value) {
    let log = EventLog {
        standard,
        version,
        event: event_name,
        data,
    };
    env::log_str(&format!(
        "EVENT_JSON:{}",
        serde_json::to_string(&log).unwrap()
    ));
}
