// use cw_ica_controller_derive::ica_callback_execute;
use cosmwasm_schema::cw_serde;
use cosmwasm_std::Uint128;
use schemars::JsonSchema;
use serde::{Deserialize, Serialize};

#[cw_serde]
pub struct InstantiateMsg {}

#[cw_serde]
pub enum ExecuteMsg {
    ClawbackAssets {},
    // ClawbackAdditionalSnips {
    //     key: String,
    //     snips: Vec<(String, String)>,
    // },
}

#[derive(Serialize, Deserialize, Clone, Debug, Eq, PartialEq, JsonSchema)]
#[serde(rename_all = "snake_case")]
pub enum QueryMsg {
    Owner {},
    // Snip { snip: String },
    QueryBalance {},
}

#[cw_serde]
pub enum QueryAnswer {
    OwnerResponse { owner: String },
    SnipResponse { exist: bool },
    BalanceResponse { balance: Vec<(String, Uint128)> },
}

#[derive(Serialize, Deserialize, Clone, Debug, Eq, PartialEq, JsonSchema)]
#[serde(rename_all = "snake_case")]
pub enum MigrateMsg {
    Migrate {},
    StdError {},
}
