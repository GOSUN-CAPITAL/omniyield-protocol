use near_sdk::json_types::U128;
use near_sdk::near;

/// Storage balance descriptor conforming to NEP-145
#[near(serializers = [borsh, json])]
#[derive(Clone, Debug, PartialEq)]
pub struct StorageBalance {
    pub total: U128,
    pub available: U128,
}

/// Storage bounds descriptor conforming to NEP-145
#[near(serializers = [borsh, json])]
#[derive(Clone, Debug, PartialEq)]
pub struct StorageBalanceBounds {
    pub min: U128,
    pub max: Option<U128>,
}

/// Metadata conforming to NEP-148
#[near(serializers = [borsh, json])]
#[derive(Clone, Debug, PartialEq)]
pub struct FungibleTokenMetadata {
    pub spec: String,
    pub name: String,
    pub symbol: String,
    pub icon: Option<String>,
    pub reference: Option<String>,
    pub reference_hash: Option<String>,
    pub decimals: u8,
}

pub fn default_nusd_metadata() -> FungibleTokenMetadata {
    FungibleTokenMetadata {
        spec: "ft-1.0.0".to_string(),
        name: "NEAR Yield Dollar".to_string(),
        symbol: "NUSD".to_string(),
        icon: Some("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMjggMTI4IiB3aWR0aD0iMTI4IiBoZWlnaHQ9IjEyOCI+CiAgPGRlZnM+CiAgICA8bGluZWFyR3JhZGllbnQgaWQ9ImdyYWQiIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPgogICAgICA8c3RvcCBvZmZzZXQ9IjAlIiBzdG9wLWNvbG9yPSIjMTBCOTgxIi8+CiAgICAgIDxzdG9wIG9mZnNldD0iNTAlIiBzdG9wLWNvbG9yPSIjMDZCNkQ0Ii8+CiAgICAgIDxzdG9wIG9mZnNldD0iMTAwJSIgc3RvcC1jb2xvcj0iIzNCODJGNiIvPgogICAgPC9saW5lYXJHcmFkaWVudD4KICAgIDxyYWRpYWxHcmFkaWVudCBpZD0iaW5uZXJHbG93IiBjeD0iNTAlIiBjeT0iNTAlIiByPSI1MCUiPgogICAgICA8c3RvcCBvZmZzZXQ9IjAlIiBzdG9wLWNvbG9yPSIjMTBCOTgxIiBzdG9wLW9wYWNpdHk9IjAuMjUiLz4KICAgICAgPHN0b3Agb2Zmc2V0PSIxMDAlIiBzdG9wLWNvbG9yPSIjMEYxNzJBIiBzdG9wLW9wYWNpdHk9IjAiLz4KICAgIDwvcmFkaWFsR3JhZGllbnQ+CiAgPC9kZWZzPgogIDwhLS0gQmFja2dyb3VuZCBCYWRnZSAtLT4KICA8Y2lyY2xlIGN4PSI2NCIgY3k9IjY0IiByPSI2MCIgZmlsbD0iIzBCMEYxOSIgc3Ryb2tlPSJ1cmwoI2dyYWQpIiBzdHJva2Utd2lkdGg9IjQuNSIvPgogIDxjaXJjbGUgY3g9IjY0IiBjeT0iNjQiIHI9IjUyIiBmaWxsPSJ1cmwoI2lubmVyR2xvdykiLz4KICA8Y2lyY2xlIGN4PSI2NCIgY3k9IjY0IiByPSI1MSIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjMTBCOTgxIiBzdHJva2Utd2lkdGg9IjEiIHN0cm9rZS1kYXNoYXJyYXk9IjMgMyIgb3BhY2l0eT0iMC4zNSIvPgogIAogIDwhLS0gU3R5bGl6ZWQgTlVTRCBTeW1ib2wgKE5FQVIgIk4iICsgRG9sbGFyIE1vdGlmKSAtLT4KICA8cGF0aCBkPSJNNDIgODZWNDJMNzIgNzhWNDIiIHN0cm9rZT0idXJsKCNncmFkKSIgc3Ryb2tlLXdpZHRoPSI4IiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGZpbGw9Im5vbmUiLz4KICA8cGF0aCBkPSJNODYgNDJWODYiIHN0cm9rZT0idXJsKCNncmFkKSIgc3Ryb2tlLXdpZHRoPSI4IiBzdHJva2UtbGluZWNhcD0icm91bmQiIGZpbGw9Im5vbmUiLz4KICA8IS0tIFRvcCBSaWdodCBZaWVsZCBTcGFya2xlIC0tPgogIDxjaXJjbGUgY3g9Ijg2IiBjeT0iMzIiIHI9IjQuNSIgZmlsbD0iIzEwQjk4MSIvPgo8L3N2Zz4=".to_string()),
        reference: None,
        reference_hash: None,
        decimals: 6,
    }
}
